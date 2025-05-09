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
import { Paper, Slider, Divider } from '@mui/material';
import { API_URL } from '../config';
import { useTranslation } from 'react-i18next';
import { inputStyles } from '../styles/formStyles';
import { apiRequest } from '../utils/api';

// Define WinType enum matching your backend
export enum WinType {
  NORMAL = 'NORMAL',
  SELF_DRAW_ALL_PAY = 'SELF_DRAW_ALL_PAY',
  SELF_DRAW_ONE_PAY = 'SELF_DRAW_ONE_PAY',
}

// Update the PlayerInfoForModal interface to include emoji, color and balance
interface PlayerInfoForModal {
    game_player_id: string;
    player_name_in_game: string;
    player_emoji_in_game?: string;
    player_color_in_game: string;
    current_balance?: number | string;
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
    scoreTable?: Array<{score: number; money: number}>;
}

const RoundEntryModal: React.FC<RoundEntryModalProps> = ({
    open,
    onClose,
    onSubmitSuccess,
    gameId,
    activePlayers = [],
    scoreLimits = { min: 1, max: 13 },
    scoreTable = []
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
    const [isTableLoading, setIsTableLoading] = useState(false);

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

    // Calculate money value based on score and win type
    const calculateMoneyValue = (score: number, type: WinType): number => {
        // Use the fetched score table if available
        const matchingEntry = scoreTable.find(entry => entry.score === score);
        const baseValue = matchingEntry ? matchingEntry.money : Math.pow(2, score); // Fallback calculation
        
        switch (type) {
            case WinType.NORMAL:
                return baseValue; // One player pays
            case WinType.SELF_DRAW_ALL_PAY:
                return baseValue / 2 * 3; // All three others pay
            case WinType.SELF_DRAW_ONE_PAY:
                return baseValue / 2 * 3; // One player pays
            default:
                return baseValue;
        }
    };
    
    
    // Get total money value
    const moneyValue = calculateMoneyValue(scoreValue, winType);
    const perPlayerPayment = moneyValue / 3;

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
            await apiRequest(`game/${gameId}/rounds`, gameId, {
                method: 'POST',
                body: payload,
                requiresAuth: true
            });
            
            onSubmitSuccess();
            onClose();
        } catch (err: any) { 
            console.error("Failed to submit round:", err);
            setError(err.message || t('errorSubmitFailed'));
        } finally { 
            setIsLoading(false); 
        }
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
            maxWidth="sm" 
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
                        {/* Win Type Radio */}
                        <Grid item xs={12}>
                            <FormControl component="fieldset" margin="dense" disabled={isLoading}>
                                <Typography component="legend" variant="body2" sx={{ mb: 0.5, color: 'silver' }}>
                                    {t("winTypeLabel")}
                                </Typography>
                                <RadioGroup row name="win_type" value={winType} onChange={handleWinTypeChange} 
                                sx={{ gap: 2}}>
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

                        {/* Winner Radio Group */}
                        <Grid item xs={12}>
                            <Typography component="legend" variant="body2" sx={{ mb: 1, color: 'silver' }}>
                                {t("winnerLabel")}
                            </Typography>
                            <Box sx={{ 
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                                gap: 2
                            }}>
                                {activePlayers.map(player => (
                                    <Box 
                                        key={player.game_player_id}
                                        onClick={() => {
                                            if (!isLoading) {
                                                setWinnerId(player.game_player_id);
                                                if (loserId === player.game_player_id && winType !== WinType.SELF_DRAW_ALL_PAY) {
                                                    setLoserId('');
                                                }
                                                setError(null);
                                            }
                                        }}
                                        sx={{ 
                                            cursor: isLoading ? 'not-allowed' : 'pointer',
                                            border: '2px solid',
                                            borderColor: winnerId === player.game_player_id 
                                                ? 'white' 
                                                : 'rgba(192, 192, 192, 0.3)',
                                            borderRadius: '8px',
                                            p: 1.5,
                                            backgroundColor: winnerId === player.game_player_id 
                                                ? 'rgba(255, 255, 255, 0.08)'
                                                : 'rgba(0, 0, 0, 0.2)',
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                                backgroundColor: winnerId === player.game_player_id 
                                                    ? 'rgba(255, 255, 255, 0.12)'
                                                    : 'rgba(255, 255, 255, 0.04)'
                                            },
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        {/* Selection indicator overlay */}
                                        {winnerId === player.game_player_id && (
                                            <Box sx={{ 
                                                position: 'absolute', 
                                                top: 0, 
                                                right: 0,
                                                borderWidth: '0 20px 20px 0',
                                                borderStyle: 'solid',
                                                borderColor: 'transparent white transparent transparent',
                                            }}/>
                                        )}
                                        
                                        {/* Player content */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <Box 
                                                sx={{ 
                                                    width: 40, 
                                                    height: 40,
                                                    borderRadius: '50%',
                                                    bgcolor: player.player_color_in_game || 'gray',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '1.5rem',
                                                    mr: 1.5
                                                }}
                                            >
                                                {player.player_emoji_in_game || ''}
                                            </Box>
                                            <Box sx={{ overflow: 'hidden' }}>
                                                <Typography 
                                                    variant="subtitle1" 
                                                    sx={{ 
                                                        color: 'white',
                                                        fontWeight: winnerId === player.game_player_id ? 'bold' : 'normal',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis'
                                                    }}
                                                >
                                                    {player.player_name_in_game}
                                                </Typography>
                                                {/* Display balance if available */}
                                                {player.current_balance !== undefined && (
                                                    <Typography 
                                                        variant="body2" 
                                                        sx={{ 
                                                            color: parseFloat(String(player.current_balance)) >= 0 
                                                                ? '#90EE90' 
                                                                : '#FFA07A',
                                                            fontWeight: 'bold'
                                                        }}
                                                    >
                                                        ${parseFloat(String(player.current_balance)).toFixed(2)}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        </Grid>

                        {/* Loser selection with similar player cards */}
                        {isLoserRequired && (
                            <Grid item xs={12}>
                                <Typography component="legend" variant="body2" sx={{ mt: 2, mb: 1, color: 'silver' }}>
                                    {t("loserLabel")}
                                </Typography>
                                <Box sx={{ 
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                                    gap: 2
                                }}>
                                    {loserOptions.map(player => (
                                        <Box 
                                            key={player.game_player_id}
                                            onClick={() => {
                                                if (!isLoading) {
                                                    setLoserId(player.game_player_id);
                                                    setError(null);
                                                }
                                            }}
                                            sx={{ 
                                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                                border: '2px solid',
                                                borderColor: loserId === player.game_player_id 
                                                    ? 'white' 
                                                    : 'rgba(192, 192, 192, 0.3)',
                                                borderRadius: '8px',
                                                p: 1.5,
                                                backgroundColor: loserId === player.game_player_id 
                                                    ? 'rgba(255, 255, 255, 0.08)'
                                                    : 'rgba(0, 0, 0, 0.2)',
                                                transition: 'all 0.2s',
                                                '&:hover': {
                                                    backgroundColor: loserId === player.game_player_id 
                                                        ? 'rgba(255, 255, 255, 0.12)'
                                                        : 'rgba(255, 255, 255, 0.04)'
                                                },
                                                position: 'relative',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            {/* Selection indicator overlay */}
                                            {loserId === player.game_player_id && (
                                                <Box sx={{ 
                                                    position: 'absolute', 
                                                    top: 0, 
                                                    right: 0,
                                                    borderWidth: '0 20px 20px 0',
                                                    borderStyle: 'solid',
                                                    borderColor: 'transparent white transparent transparent',
                                                }}/>
                                            )}
                                            
                                            {/* Player content */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <Box 
                                                    sx={{ 
                                                        width: 40, 
                                                        height: 40,
                                                        borderRadius: '50%',
                                                        bgcolor: player.player_color_in_game || 'gray',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '1.5rem',
                                                        mr: 1.5
                                                    }}
                                                >
                                                    {player.player_emoji_in_game || ''}
                                                </Box>
                                                <Box sx={{ overflow: 'hidden' }}>
                                                    <Typography 
                                                        variant="subtitle1" 
                                                        sx={{ 
                                                            color: 'white',
                                                            fontWeight: loserId === player.game_player_id ? 'bold' : 'normal',
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis'
                                                        }}
                                                    >
                                                        {player.player_name_in_game}
                                                    </Typography>
                                                    {/* Display balance if available */}
                                                    {player.current_balance !== undefined && (
                                                        <Typography 
                                                            variant="body2" 
                                                            sx={{ 
                                                                color: parseFloat(String(player.current_balance)) >= 0 
                                                                    ? '#90EE90' 
                                                                    : '#FFA07A',
                                                                fontWeight: 'bold'
                                                            }}
                                                        >
                                                            ${parseFloat(String(player.current_balance)).toFixed(2)}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            </Grid>
                        )}

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
                                    
                                    {/* Money value display */}
                                    <Box sx={{ 
                                        mt: 2,
                                        p: 1, 
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: '4px',
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                        width: '100%',
                                        textAlign: 'center'
                                    }}>
                                        <Typography variant="body1" color="silver">
                                            {t('moneyValue')}:
                                        </Typography>
                                        <Typography variant="h5" color="lightgreen" sx={{ fontWeight: 'bold' }}>
                                            ${moneyValue}
                                        </Typography>
                                        
                                        {winType === WinType.SELF_DRAW_ALL_PAY && (
                                            <Typography variant="body2" color="silver" sx={{ mt: 0.5 }}>
                                                {t('perPlayer', { money: perPlayerPayment })}
                                            </Typography>
                                        )}
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
