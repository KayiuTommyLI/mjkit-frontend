import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { v4 as uuidv4 } from 'uuid';

import React, { /*...,*/ useNavigate } from 'react-router-dom'; // <-- Import useNavigate

// MUI Imports
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Container from '@mui/material/Container';
import Alert from '@mui/material/Alert';

// Assuming ScorePreviewItem is defined here or imported
interface ScorePreviewItem {
    score: number;
    money: number;
}

// --- Interfaces (Match CreateGameDto structure) ---
interface InitialPlayerDto {
    user_id: string;
    player_name_in_game: string;
    player_color_in_game: string;
    player_order: number;
}

interface CreateGamePayload {
    max_money: number;
    upper_limit_of_score: number;
    lower_limit_of_score: number;
    half_money_rule: boolean;
    one_pay_all_rule?: boolean;
    five_player_mode_rule?: boolean;
    game_name?: string;
    initial_players: InitialPlayerDto[];
}

// --- Default Values ---
const defaultMaxMoney = 64;
const defaultUpperLimit = 10;
const defaultLowerLimit = 3;
const defaultHalfMoneyRule = true;
const availableColors = [
    { name: 'Red', value: '#FF0000' }, { name: 'Blue', value: '#0000FF' },
    { name: 'Yellow', value: '#FFFF00' }, { name: 'Magenta', value: '#FF00FF' },
    { name: 'Cyan', value: '#00FFFF' }, { name: 'Green', value: '#008000' },
    { name: 'DarkGray', value: '#A9A9A9' },
];
const defaultPlayerNames = ['Player 1', 'Player 2', 'Player 3', 'Player 4'];
const maxMoneyOptions = [16, 24, 32, 48, 64, 96, 128];
const scoreLimitOptions = Array.from({ length: 18 }, (_, i) => i + 3); // 3 to 20
const minScoreOptions = Array.from({ length: 5 }, (_, i) => i + 1); // 1 to 5

// --- Component ---
const GameSetupPage: React.FC = () => {
    const navigate = useNavigate(); // <-- Get the navigate function

    // --- State ---
    const [players, setPlayers] = useState(() =>
        defaultPlayerNames.map((name, index) => ({
            id: index,
            name: name,
            color: availableColors[index % availableColors.length].value,
        }))
    );

    const [gameSettings, setGameSettings] = useState({
        max_money: defaultMaxMoney,
        upper_limit_of_score: defaultUpperLimit,
        lower_limit_of_score: defaultLowerLimit,
        half_money_rule: defaultHalfMoneyRule,
        game_name: '',
    });

    const [scorePreview, setScorePreview] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [apiSuccessMessage, setApiSuccessMessage] = useState<string | null>(null);


    // --- Effects (Score Preview Fetch) ---
    useEffect(() => {
        const fetchScorePreview = async () => {
            if (gameSettings.lower_limit_of_score > gameSettings.upper_limit_of_score || gameSettings.upper_limit_of_score <= 0) {
                setScorePreview(['Invalid score limits']);
                return;
            }
            const queryParams = new URLSearchParams({
                maxMoney: String(gameSettings.max_money),
                upperLimitOfScore: String(gameSettings.upper_limit_of_score),
                lowerLimitOfScore: String(gameSettings.lower_limit_of_score),
                halfMoneyRule: String(gameSettings.half_money_rule),
            }).toString();

            try {
                const response = await fetch(`http://localhost:3000/games/score-preview?${queryParams}`); // Use your backend URL
                if (!response.ok) {
                    let errorMsg = `HTTP error! status: ${response.status}`;
                    try {
                        const errorData = await response.json();
                        errorMsg = errorData.message || JSON.stringify(errorData);
                    } catch (jsonError) {  errorMsg = `${response.status} ${response.statusText}`; }
                    throw new Error(errorMsg);
                }
                const data: ScorePreviewItem[] = await response.json();
                const previewStrings = data.map(item => `${item.score} Fan: $${item.money.toFixed(1)}`);
                setScorePreview(previewStrings);
                setError(null); // Clear previous fetch errors on success
            } catch (err: any) {
                console.error("Error fetching score preview. Raw error:", err);
                console.error("Error message property:", err.message);
                const displayError = `Preview Error: ${err.message || 'Network Error'}`;
                setError(displayError); // Show fetch error to user
                setScorePreview([displayError]);
            }
        };
        fetchScorePreview();
    }, [gameSettings.max_money, gameSettings.upper_limit_of_score, gameSettings.lower_limit_of_score, gameSettings.half_money_rule]);

    // --- Handlers ---
    const handlePlayerNameChange = (index: number, value: string) => {
        const newPlayers = [...players];
        newPlayers[index].name = value;
        setPlayers(newPlayers);
        if (error?.includes('Player names')) setError(null); // Clear name errors
    };

    const handlePlayerColorChange = (index: number, event: SelectChangeEvent) => {
        const newPlayers = [...players];
        newPlayers[index].color = event.target.value;
        setPlayers(newPlayers);
    };

    const handleSettingChange = (event: SelectChangeEvent<string | number> | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        let processedValue: string | number | boolean = value;

        if (name === 'max_money' || name === 'upper_limit_of_score' || name === 'lower_limit_of_score') {
            processedValue = Number(value);
        } else if (name === 'half_money_rule') {
            processedValue = value === 'true';
        }
        // Handle game_name separately as it comes from TextField event
         if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
              if(name === 'game_name') processedValue = value;
         }


        setGameSettings(prev => ({ ...prev, [name]: processedValue }));
        if (error?.includes('score')) setError(null); // Clear score limit errors
    };

    // --- Validation ---
    const validateInputs = (): boolean => {
        const names = players.map(p => p.name.trim());
        if (names.some(name => name === '')) { setError('Player names cannot be empty.'); return false; }
        if (new Set(names).size !== names.length) { setError('Player names must be unique.'); return false; }
        if (gameSettings.lower_limit_of_score > gameSettings.upper_limit_of_score) { setError('Minimum score cannot be greater than maximum score.'); return false; }
        setError(null);
        return true;
    };

    // --- Submit ---
    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (!validateInputs()) return;

        setIsLoading(true);
        setError(null);
        setApiSuccessMessage(null);

        const payload: CreateGamePayload = {
            max_money: gameSettings.max_money,
            upper_limit_of_score: gameSettings.upper_limit_of_score,
            lower_limit_of_score: gameSettings.lower_limit_of_score,
            half_money_rule: gameSettings.half_money_rule,
            game_name: gameSettings.game_name || undefined,
            initial_players: players.map((player, index) => ({
                user_id: uuidv4(),
                player_name_in_game: player.name.trim(),
                player_color_in_game: player.color,
                player_order: index,
            })),
        };

        try {
            const response = await fetch('http://localhost:3000/games', { // Replace with your backend URL
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                let errorMsg = `HTTP error! status: ${response.status}`;
                 try {
                     const errorData = await response.json();
                     errorMsg = errorData.message || JSON.stringify(errorData);
                 } catch (jsonError) { errorMsg = `${response.status} ${response.statusText}`; }
                throw new Error(errorMsg);
            }
            const createdGame = await response.json();
            console.log('Game created successfully:', createdGame);
            setApiSuccessMessage(`Game created! ID: ${createdGame.game_id}. Redirecting soon...`);
            
            // --- REPLACE alert WITH NAVIGATION ---
            // alert(`Game created! ID: ${createdGame.game_id}`); // Remove or comment out alert
            // Navigate to the new game page after a short delay (optional)
            setTimeout(() => {
              navigate(`/game/${createdGame.game_id}`); // Redirect to game page
            }, 1500); // 1.5 second delay

        } catch (err: any) {
            console.error('Failed to create game:', err);
            setError(err.message || 'Failed to create game. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // --- Render ---
    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Setup New Mahjong Game
                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>

                    {/* --- Player Setup --- */}
                    <Typography variant="h6" component="h2" gutterBottom sx={{mt: 2}}>
                        Players
                    </Typography>
                    <Grid container spacing={2}>
                        {players.map((player, index) => (
                            <Grid xs={12} sm={6} key={player.id}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <TextField
                                        label={`Player ${index + 1} Name`}
                                        value={player.name}
                                        onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                                        required
                                        fullWidth
                                        variant="outlined"
                                        size="small"
                                    />
                                    <FormControl size="small" sx={{ minWidth: 120 }}>
                                        <InputLabel>Color</InputLabel>
                                        <Select
                                            value={player.color}
                                            label="Color"
                                            onChange={(e) => handlePlayerColorChange(index, e)}
                                        >
                                            {availableColors.map(color => (
                                                <MenuItem key={color.value} value={color.value}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                         <Box component="span" sx={{ width: 16, height: 16, bgcolor: color.value, mr: 1, border: '1px solid grey' }} />
                                                         {color.name}
                                                    </Box>
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>

                    {/* --- Game Rules --- */}
                     <Typography variant="h6" component="h2" gutterBottom sx={{mt: 3}}>
                        Game Rules
                    </Typography>
                     <Grid container spacing={2}>
                         <Grid xs={12}>
                             <TextField
                                 label="Game Name (Optional)"
                                 name="game_name"
                                 value={gameSettings.game_name}
                                 onChange={handleSettingChange}
                                 fullWidth
                                 variant="outlined"
                                 size="small"
                             />
                         </Grid>
                         <Grid xs={6} sm={3}>
                              <FormControl fullWidth size="small">
                                 <InputLabel>Max Money ($)</InputLabel>
                                 <Select
                                     name="max_money"
                                     value={gameSettings.max_money}
                                     label="Max Money ($)"
                                     onChange={handleSettingChange}
                                 >
                                      {maxMoneyOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                                 </Select>
                             </FormControl>
                         </Grid>
                         <Grid xs={6} sm={3}>
                              <FormControl fullWidth size="small">
                                 <InputLabel>Max Score (Fan)</InputLabel>
                                 <Select
                                     name="upper_limit_of_score"
                                     value={gameSettings.upper_limit_of_score}
                                     label="Max Score (Fan)"
                                     onChange={handleSettingChange}
                                 >
                                      {scoreLimitOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                                 </Select>
                             </FormControl>
                         </Grid>
                          <Grid xs={6} sm={3}>
                              <FormControl fullWidth size="small">
                                 <InputLabel>Min Score (Fan)</InputLabel>
                                 <Select
                                     name="lower_limit_of_score"
                                     value={gameSettings.lower_limit_of_score}
                                     label="Min Score (Fan)"
                                     onChange={handleSettingChange}
                                 >
                                      {minScoreOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                                 </Select>
                             </FormControl>
                         </Grid>
                          <Grid xs={6} sm={3}>
                             <FormControl fullWidth size="small">
                                 <InputLabel>Score Rule</InputLabel>
                                 <Select
                                     name="half_money_rule"
                                     value={String(gameSettings.half_money_rule)}
                                     label="Score Rule"
                                     onChange={handleSettingChange}
                                 >
                                     <MenuItem value="true">Half Money After 5</MenuItem>
                                     <MenuItem value="false">Hot Hot Up</MenuItem>
                                 </Select>
                             </FormControl>
                         </Grid>
                         {/* Add controls for one_pay_all_rule, five_player_mode_rule if needed */}
                    </Grid>

                     {/* --- Score Preview --- */}
                     <Typography variant="h6" component="h2" gutterBottom sx={{mt: 3}}>
                        Score Preview
                    </Typography>
                     <Paper variant="outlined" sx={{ p: 2, minHeight: '100px', whiteSpace: 'pre-wrap', backgroundColor: '#f9f9f9' }}>
                          {scorePreview.join('\n') || 'Calculating preview...'}
                     </Paper>

                     {/* --- Error Display --- */}
                     {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                     {apiSuccessMessage && <Alert severity="success" sx={{ mt: 2 }}>{apiSuccessMessage}</Alert>}


                    {/* --- Submit Button --- */}
                    <Button
                        type="submit"
                        disabled={isLoading}
                        variant="contained"
                        size="large"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        {isLoading ? 'Creating Game...' : 'Create Game'}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default GameSetupPage;