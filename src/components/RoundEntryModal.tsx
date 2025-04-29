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

const RoundEntryModal: React.FC<RoundEntryModalProps> = ({
    open,
    onClose,
    onSubmitSuccess,
    gameId,
    activePlayers = [],
    scoreLimits = { min: 1, max: 1 }
}) => {
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
        if (!winnerId) { setError('Winner is required.'); return; }
        if (isLoserRequired && !loserId) { setError('Loser is required for this win type.'); return; }
        if (!scoreOptions.includes(scoreValue)) { setError(`Score must be between ${scoreLimits.min} and ${scoreLimits.max}.`); return; }
        if (!gameId) { setError('Game ID is missing.'); return; }

        setIsLoading(true);

        const payload = {
            winner_game_player_id: winnerId,
            loser_game_player_id: isLoserRequired && loserId ? loserId : null, // <-- Use null if not required
            win_type: winType,  // <-- Use enum value
            score_value: scoreValue,  // <-- Use number directly
            }

        const gameMasterToken = localStorage.getItem(`gameMasterToken_${gameId}`);
        if (!gameMasterToken) {
            setError('Game Master Token not found. Please ensure the game was started correctly.'); // <-- Set error state
            setIsLoading(false); // <-- Stop loading
            return; // <-- Exit function
        }

        console.log("Submitting round payload:", payload);
        console.log("Using game master token: Present");

        try {
            const response = await fetch(`http://localhost:3000/games/${gameId}/rounds`, { 
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
            setError(err.message || 'Failed to submit round.');
         }
        finally { setIsLoading(false); }
    };


    // --- *** ADD DEBUG LOG BEFORE RENDER *** ---
    console.log("--- Rendering RoundEntryModal ---");
    console.log("Current winnerId:", winnerId);
    console.log("Calculated loserOptions:", loserOptions.map(p => p.player_name_in_game)); // Log names for readability

    // --- Render ---
    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Add Round Result</DialogTitle>
            <DialogContent>
                 <Box component="form" noValidate sx={{ mt: 1 }}>
                    {/* Use Grid container for overall form layout */}
                    <Grid container spacing={2}>
                        {/* Winner Select */}
                        <Grid item xs={12}> {/* Use item here for direct children sizing */}
                            <FormControl fullWidth required margin="dense" disabled={!activePlayers.length || isLoading}>
                                <InputLabel id="winner-label">Winner</InputLabel>
                                <Select labelId="winner-label" value={winnerId} label="Winner" onChange={handleWinnerChange} >
                                    {activePlayers.map(p => (<MenuItem key={p.game_player_id} value={p.game_player_id}>{p.player_name_in_game}</MenuItem>))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Win Type Radio */}
                        <Grid item xs={12}> {/* Use item here */}
                             <FormControl component="fieldset" margin="dense" disabled={isLoading}>
                                <Typography component="legend" variant="body2" sx={{ mb: 0.5 }}>Win Type</Typography>
                                <RadioGroup row name="win_type" value={winType} onChange={handleWinTypeChange} >
                                     <FormControlLabel value={WinType.NORMAL} control={<Radio size="small"/>} label="Normal" sx={{ mr: 0.5 }}/>
                                     <FormControlLabel value={WinType.SELF_DRAW_ALL_PAY} control={<Radio size="small"/>} label="Self-Draw (All)" sx={{ mr: 0.5 }}/>
                                     <FormControlLabel value={WinType.SELF_DRAW_ONE_PAY} control={<Radio size="small"/>} label="Self-Draw (One)" />
                                </RadioGroup>
                            </FormControl>
                        </Grid>

                        {/* Loser Select (Conditional) */}
                         <Grid item xs={12}> {/* Use item here */}
                            <FormControl fullWidth required={isLoserRequired} margin="dense" disabled={!isLoserRequired || isLoading}>
                                <InputLabel id="loser-label">Loser</InputLabel>
                                <Select labelId="loser-label" value={loserId ?? ''} label="Loser" onChange={handleLoserChange} >
                                     <MenuItem value="" disabled><em>{isLoserRequired ? 'Select Loser' : '(Not Applicable)'}</em></MenuItem>
                                    {loserOptions.map(p => (<MenuItem key={p.game_player_id} value={p.game_player_id}>{p.player_name_in_game}</MenuItem>))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Score Select */}
                         <Grid item xs={12}> {/* Use item here */}
                             <FormControl fullWidth required margin="dense" disabled={isLoading}>
                                 <InputLabel id="score-label">Score (Fan)</InputLabel>
                                 <Select labelId="score-label" value={scoreValue} label="Score (Fan)" onChange={handleScoreChange} >
                                    {scoreOptions.length > 0 ? scoreOptions.map(score => (
                                        <MenuItem key={score} value={score}>{score}</MenuItem>
                                     )) : <MenuItem value="" disabled>No valid scores</MenuItem>}
                                </Select>
                            </FormControl>
                        </Grid>

                         {error && <Grid item xs={12}><Alert severity="error" variant="outlined" sx={{mt: 1}}>{error}</Alert></Grid>}
                    </Grid>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: '16px 24px' }}>
                <Button onClick={onClose} disabled={isLoading}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={isLoading}>
                    {isLoading ? 'Submitting...' : 'Submit Round'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default RoundEntryModal;
