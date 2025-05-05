// src/components/RoundEntryModal.tsx
import React, { useState, useEffect, ChangeEvent } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { Paper, Slider } from '@mui/material';
import { API_URL } from '../config';
import { useTranslation } from 'react-i18next';
import { inputStyles } from '../styles/formStyles';

// Define WinType enum matching your backend
export enum WinType {
  NORMAL = 'NORMAL',
  SELF_DRAW_ALL_PAY = 'SELF_DRAW_ALL_PAY',
  SELF_DRAW_ONE_PAY = 'SELF_DRAW_ONE_PAY',
}

// Props expected from GamePage
interface PlayerInfoForModal {
    game_player_id: string;
    player_name_in_game: string;
}
interface ScoreLimitsForModal {
    min: number;
    max: number;
}
interface RoundEntryModalProps {
    open: boolean;
    onClose: () => void;
    onSubmitSuccess: () => void;
    gameId: string | undefined;
    activePlayers: PlayerInfoForModal[];
    scoreLimits: ScoreLimitsForModal;
}

// // Common input styles - matching main application theme
// const inputStyles = { 
//     '& label.Mui-focused': { color: 'white' },
//     '& .MuiInputLabel-root': { color: 'silver' }, 
//     '& .MuiOutlinedInput-root': {
//         '& fieldset': { borderColor: 'silver' }, 
//         '&:hover fieldset': { borderColor: 'white' },
//         '&.Mui-focused fieldset': { borderColor: 'white' },
//         '& input': { color: 'white' },
//         '& .MuiSelect-select': { color: 'white' }, 
//         '& .MuiSvgIcon-root': { color: 'silver'} 
//     }
// };

const RoundEntryModal: React.FC<RoundEntryModalProps> = ({
    open,
    onClose,
    onSubmitSuccess,
    gameId,
    activePlayers = [],
    scoreLimits = { min: 1, max: 1 }
}) => {
    const { t } = useTranslation();

    // Form State
    const [winnerId, setWinnerId] = useState<string>('');
    const [loserId, setLoserId] = useState<string>('');
    const [winType, setWinType] = useState<WinType>(WinType.NORMAL);
    const [scoreValue, setScoreValue] = useState<number>(1);
    // Component State
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Generate score options dynamically
    const scoreOptions = Array.from(
         { length: scoreLimits.max - scoreLimits.min + 1 },
         (_, i) => scoreLimits.min + i
    );

    // Reset form when modal opens or relevant props change
    useEffect(() => {
        if (open) {
            console.log("Modal opened, resetting form state...");
            setWinnerId(activePlayers[0]?.game_player_id || '');
            setLoserId('');
            setWinType(WinType.NORMAL);
            // Ensure default score is valid
            const validMinScore = scoreLimits.min > 0 && scoreLimits.max >= scoreLimits.min ? scoreLimits.min : (scoreOptions.length > 0 ? scoreOptions[0] : 1);
            setScoreValue(validMinScore);
            setError(null);
            setIsLoading(false);
        }
    }, [open]); // Added scoreOptions dependency

    // --- *** CORRECTED/VERIFIED Handlers *** ---
    const handleWinTypeChange = (event: ChangeEvent<HTMLInputElement>) => {
        const newWinType = event.target.value as WinType;
        console.log("Win Type Changed:", newWinType); // Debug log
        setWinType(newWinType); // <-- This updates the state
        // Reset loser if not applicable or if they are the winner
        if (newWinType === WinType.SELF_DRAW_ALL_PAY || loserId === winnerId) {
            setLoserId('');
        }
    };

    const handleWinnerChange = (event: SelectChangeEvent) => {
        const newWinnerId = event.target.value;
        console.log(">>> Winner Changed! New winnerId:", newWinnerId); // <-- DEBUG LOG 1
        setWinnerId(newWinnerId);
        if (loserId === newWinnerId && winType !== WinType.SELF_DRAW_ALL_PAY) {
            console.log(">>> Resetting loserId because it matched new winner"); // <-- DEBUG LOG 2
            setLoserId('');
        }
         setError(null);
    };

    const handleLoserChange = (event: SelectChangeEvent) => {
        setLoserId(event.target.value); // Can be empty string
    };

     const handleScoreChange = (event: SelectChangeEvent<number>) => { // Using Select for score
        setScoreValue(Number(event.target.value));
    };
    // --- End Handlers ---


    // --- Derived Data for UI ---
    const loserOptions = activePlayers.filter(p => p.game_player_id !== winnerId);
    const isLoserRequired = winType !== WinType.SELF_DRAW_ALL_PAY;

    // --- Submit Logic (Keep as is) ---
    const handleSubmit = async () => {
        setError(null);
        // Validation
        if (!winnerId) { setError(t('errorWinnerRequired')); return; }
        if (isLoserRequired && !loserId) { setError(t('errorLoserRequired')); return; }
        if (!scoreOptions.includes(scoreValue)) { setError(`Score must be between ${scoreLimits.min} and ${scoreLimits.max}.`); return; }
        if (!gameId) { setError(t('errorGameNotFound', {min: scoreLimits.min, max: scoreLimits.max})); return; }

        setIsLoading(true);

        const payload = {
            winner_game_player_id: winnerId,
            loser_game_player_id: isLoserRequired && loserId ? loserId : null, // <-- Use null if not required
            win_type: winType,  // <-- Use enum value
            score_value: scoreValue,  // <-- Use number directly
            }

        const gameMasterToken = localStorage.getItem(`gameMasterToken_${gameId}`);
        if (!gameMasterToken) {
            setError(t('errorGameMasterTokenMissing'));
            setIsLoading(false); // <-- Stop loading
            return; // <-- Exit function
        }

        console.log("Submitting round payload:", payload);
        console.log("Using game master token: Present");

        try {
            const response = await fetch(`${API_URL}/games/${gameId}/rounds`, { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-game-master-token': gameMasterToken, // Send the master token
                },
                body: JSON.stringify(payload),
             });
            if (!response.ok) {
                let errorMsg = `Error: ${response.status}`;
                try { const errorData = await response.json(); errorMsg = errorData.message || JSON.stringify(errorData); }
                catch (jsonError) { errorMsg = `${response.status} ${response.statusText}`; }
                throw new Error(errorMsg);
             }
            console.log('Round submitted successfully');
            onSubmitSuccess();
            onClose();
        } catch (err: any) { 
            console.error("Failed to submit round:", err);
            setError(err.message || t('errorSubmitFailed'));
         }
        finally { setIsLoading(false); }
    };


    // --- *** ADD DEBUG LOG BEFORE RENDER *** ---
    console.log("--- Rendering RoundEntryModal ---");
    console.log("Current winnerId:", winnerId);
    console.log("Calculated loserOptions:", loserOptions.map(p => p.player_name_in_game)); // Log names for readability

    // --- Render ---
    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="xs" 
            fullWidth
            PaperComponent={props => (
                <Paper 
                  {...props} 
                  sx={{ 
                    backgroundColor: 'rgba(36, 36, 36, 0.95)', 
                    color: 'white',
                    borderRadius: 1,
                    border: '1px solid rgba(192, 192, 192, 0.3)'
                  }} 
                />
            )}
        >
            <DialogTitle sx={{ borderBottom: '1px solid rgba(192, 192, 192, 0.2)' }}>
                {t('addRoundResult')}
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
                 <Box component="form" noValidate sx={{ mt: 1 }}>
                    {/* Use Grid container for overall form layout */}
                    <Grid container spacing={2}>
                        {/* Winner Select */}
                        <Grid item xs={12} sm={8} {...({} as any)}>
                            <FormControl fullWidth required margin="dense" disabled={!activePlayers.length || isLoading} sx={inputStyles}>
                                <InputLabel id="winner-label">
                                    {t("winnerLabel")}
                                </InputLabel>
                                <Select
                                    labelId="winner-label"
                                    value={winnerId}
                                    label= {t("winnerLabel")}
                                    onChange={handleWinnerChange}
                                    sx={{
                                        '& .MuiSelect-select': {
                                            paddingRight: '32px !important',
                                            minWidth: '150px',
                                        },
                                    }}
                                >
                                    {activePlayers.map(p => (
                                        <MenuItem key={p.game_player_id} value={p.game_player_id}>
                                            {p.player_name_in_game}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Win Type Radio */}
                        <Grid item xs={12} sm={8} {...({} as any)}>
                            <FormControl component="fieldset" margin="dense" disabled={isLoading}>
                                <Typography component="legend" variant="body2" sx={{ mb: 0.5, color: 'silver'  }}>
                                    {t("winTypeLabel")}
                                </Typography>
                                <RadioGroup row name="win_type" value={winType} onChange={handleWinTypeChange}>
                                    <FormControlLabel 
                                        value={WinType.NORMAL} 
                                        control={<Radio size="small" sx={{ 
                                            color: 'silver',
                                            '&.Mui-checked': { color: 'white' }
                                        }}/>} 
                                        label={<Typography sx={{ color: 'silver' }}>
                                            {t("winTypeNormal")}
                                            </Typography>} 
                                        sx={{ mr: 0.5 }}
                                    />
                                    <FormControlLabel 
                                        value={WinType.SELF_DRAW_ALL_PAY} 
                                        control={<Radio size="small" sx={{ 
                                            color: 'silver',
                                            '&.Mui-checked': { color: 'white' }
                                        }}/>} 
                                        label={<Typography sx={{ color: 'silver' }}>
                                            {t("winTypeSelfDrawAll")}
                                            </Typography>} 
                                        sx={{ mr: 0.5 }}
                                    />
                                    <FormControlLabel 
                                        value={WinType.SELF_DRAW_ONE_PAY} 
                                        control={<Radio size="small" sx={{ 
                                            color: 'silver',
                                            '&.Mui-checked': { color: 'white' }
                                        }}/>} 
                                        label={<Typography sx={{ color: 'silver' }}>
                                            {t("winTypeSelfDrawOne")}
                                        </Typography>} 
                                    />
                                </RadioGroup>
                            </FormControl>
                        </Grid>

                        {/* Loser Select */}
                        <Grid item xs={12} sm={8} {...({} as any)}>
                            <FormControl fullWidth required={isLoserRequired} margin="dense" disabled={!isLoserRequired || isLoading} sx={inputStyles}>
                                <InputLabel id="loser-label">
                                        {isLoserRequired ? t('loserLabel') : t('notApplicable')}
                                </InputLabel>
                                <Select
                                    labelId="loser-label"
                                    value={loserId ?? ''}
                                    label={t('loserLabel')}
                                    onChange={handleLoserChange}
                                    sx={{
                                        '& .MuiSelect-select': {
                                            paddingRight: '32px !important',
                                            minWidth: '150px',
                                        },
                                    }}
                                >
                                    <MenuItem value="" disabled>
                                        <em>{isLoserRequired ? t('selectLoser')  : '(Not Applicable)'}</em>
                                    </MenuItem>
                                    {loserOptions.map(p => (
                                        <MenuItem key={p.game_player_id} value={p.game_player_id}>
                                            {p.player_name_in_game}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Score Select */}
                        <Grid item xs={12} sm={8} {...({} as any)}>
                            <Box sx={{ mt: 3, mb: 1 }}>
                                <Typography variant="body2" color="silver" gutterBottom>
                                    {t('scoreRefFaanHeader')}
                                </Typography>
                                
                                <Box sx={{ 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    px: 2
                                }}>
                                    {/* Current score display */}
                                    <Typography variant="h4" color="white" sx={{ mb: 1 }}>
                                        {scoreValue}
                                    </Typography>

                                    {/* Slider component */}
                                    <Slider
                                        value={scoreValue}
                                        onChange={(_, value) => setScoreValue(value as number)}
                                        step={1}
                                        marks
                                        min={scoreLimits.min}
                                        max={scoreLimits.max}
                                        valueLabelDisplay="auto"
                                        aria-labelledby="score-slider"
                                        sx={{
                                            width: '100%',
                                            color: 'white',
                                            '& .MuiSlider-rail': {
                                                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                            },
                                            '& .MuiSlider-track': {
                                                backgroundColor: 'white',
                                            },
                                            '& .MuiSlider-thumb': {
                                                backgroundColor: 'white',
                                                '&:hover, &.Mui-focusVisible': {
                                                    boxShadow: '0 0 0 8px rgba(255, 255, 255, 0.16)'
                                                }
                                            },
                                            '& .MuiSlider-mark': {
                                                backgroundColor: 'silver',
                                                height: 4,
                                            },
                                            '& .MuiSlider-markActive': {
                                                backgroundColor: 'white', 
                                            }
                                        }}
                                    />
                                    
                                    {/* Score range indicator */}
                                    <Box sx={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        width: '100%', 
                                        mt: 1 
                                    }}>
                                        {/* <Typography variant="caption" color="silver">{t('minScoreLabel')}: {scoreLimits.min}</Typography>
                                        <Typography variant="caption" color="silver">{t('maxScoreLabel')}: {scoreLimits.max}</Typography> */}
                                    </Box>
                                </Box>
                            </Box>
                        </Grid>
                        {error && <Grid item xs={12} {...({} as any)}><Alert severity="error" variant="outlined" sx={{mt: 1}}>{error}</Alert></Grid>}
                    </Grid>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: '16px 24px' }}>
            <Button 
                    onClick={onClose} 
                    disabled={isLoading}
                    sx={{ 
                        color: 'silver', 
                        '&:hover': { 
                            color: 'white', 
                            backgroundColor: 'rgba(255, 255, 255, 0.08)' 
                        },
                        '&.Mui-disabled': {
                            color: 'rgba(192, 192, 192, 0.3)'
                        }
                    }}
                >
                    {t('cancel')}
                </Button>
                <Button 
                    onClick={handleSubmit} 
                    variant="contained" 
                    disabled={isLoading}
                    sx={{
                        backgroundColor: 'white',
                        color: 'black',
                        '&:hover': {
                            backgroundColor: '#e0e0e0'
                        },
                        '&.Mui-disabled': {
                            backgroundColor: 'rgba(255, 255, 255, 0.3)',
                            color: 'rgba(0, 0, 0, 0.6)'
                        }
                    }}
                >
                    {isLoading ? t('submitting') : t('sumbitRound')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default RoundEntryModal;
