import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';

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
import { API_URL } from '../config';
import { InputAdornment } from '@mui/material';
import { MuiColorInput } from 'mui-color-input';

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
    initial_offset?: number;
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
  { name: 'Red', value: '#FF0000' },
  { name: 'Blue', value: '#0000FF' },
  { name: 'Yellow', value: '#FFFF00' },
  { name: 'Magenta', value: '#FF00FF' },
  { name: 'Cyan', value: '#00FFFF' },
  { name: 'Green', value: '#008000' },
  { name: 'DarkGray', value: '#A9A9A9' },
  { name: 'Purple', value: '#800080' },
  { name: 'Orange', value: '#FFA500' },
  { name: 'Pink', value: '#FFC1CC' },
];
const defaultPlayerNames = ['Player 1', 'Player 2', 'Player 3', 'Player 4'];
const initialOffset = 0; // Default initial offset for players
const maxMoneyOptions = [8, 16, 24, 32, 48, 64, 96, 128, 256, 512, 1024];  // 8 to 1024
const scoreLimitOptions = Array.from({ length: 28 }, (_, i) => i + 3);  // 3 to 30
const minScoreOptions = Array.from({ length: 8 }, (_, i) => i + 1);  // 1 to 8

// Style object for TextFields/Selects (to avoid repetition)
const inputStyles = {
    '& label.Mui-focused': { color: 'white' },
    '& .MuiInputLabel-root': { color: 'silver' }, // Label color
    '& .MuiOutlinedInput-root': {
        '& fieldset': { borderColor: 'silver' }, // Border color
        '&:hover fieldset': { borderColor: 'white' },
        '&.Mui-focused fieldset': { borderColor: 'white' },
        '& input': { color: 'white' }, // Input text color (for TextField)
        '& .MuiSelect-select': { color: 'white' }, // Select value color
        '& .MuiSvgIcon-root': { color: 'silver'} // Select dropdown arrow color
    },
     '& .MuiInputAdornment-root p': { color: 'silver' } // Adornment color (for offset)
};

// --- Component ---
const GameSetupPage: React.FC = () => {
    const navigate = useNavigate(); // <-- Get the navigate function
    const { t, i18n } = useTranslation();

    // --- State ---
    const [players, setPlayers] = useState(() =>
        defaultPlayerNames.map((name, index) => ({
            id: index,
            name: name,
            color: availableColors[index % availableColors.length].value,
            initial_offset: initialOffset
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
    const [offsetError, setOffsetError] = useState<string | null>(null);

    // --- Effects (Score Preview Fetch) ---
    useEffect(() => {
        const fetchScorePreview = async () => {
            if (gameSettings.lower_limit_of_score > gameSettings.upper_limit_of_score || gameSettings.upper_limit_of_score <= 0) {
                setScorePreview([t('errorInvalidScoreLimit')]);
                return;
            }
            const queryParams = new URLSearchParams({
                maxMoney: String(gameSettings.max_money),
                upperLimitOfScore: String(gameSettings.upper_limit_of_score),
                lowerLimitOfScore: String(gameSettings.lower_limit_of_score),
                halfMoneyRule: String(gameSettings.half_money_rule),
            }).toString();

            try {
                const response = await fetch(`${API_URL}/games/score-preview?${queryParams}`);
                if (!response.ok) {
                    let errorMsg = `HTTP error! status: ${response.status}`;
                    try {
                        const errorData = await response.json();
                        errorMsg = errorData.message || JSON.stringify(errorData);
                    } catch (jsonError) {  errorMsg = `${response.status} ${response.statusText}`; }
                    throw new Error(errorMsg);
                }
                const data: ScorePreviewItem[] = await response.json();
                const previewStrings = data.map(item => `${item.score} ${t('Faan')}: $${item.money.toFixed(1)}`);
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
    }, [gameSettings.max_money, gameSettings.upper_limit_of_score, gameSettings.lower_limit_of_score, gameSettings.half_money_rule, i18n.language, t]);

    // --- Handlers ---
    const handlePlayerNameChange = (index: number, value: string) => {
        const newPlayers = [...players];
        newPlayers[index].name = value;
        setPlayers(newPlayers);
        if (error === t('errorPlayerNameEmpty') || error === t('errorPlayerNameUnique')) setError(null);
    };

    const handlePlayerColorChange = (index: number, newColor: string) => {
        const newPlayers = [...players];
        newPlayers[index].color = newColor;
        setPlayers(newPlayers);
    };

    const handlePlayerOffsetChange = (index: number, value: string) => {
        const newPlayers = [...players];
        const parsedValue = parseFloat(value);
        newPlayers[index].initial_offset = isNaN(parsedValue) ? 0 : parsedValue; // Store as number
        setPlayers(newPlayers);
        if (offsetError) setOffsetError(null);
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
        if (error?.includes(t('Faan'))) setError(null); // Clear score limit errors
    };

    // --- Validation ---
    const validateInputs = (): boolean => {
        const names = players.map(p => p.name.trim());
        if (names.some(name => name === '')) { 
          setError(t('errorPlayerNameEmpty')); 
          return false; 
        }
        if (new Set(names).size !== names.length) { 
          setError(t('errorPlayerNameUnique')); 
          return false; 
        }
        if (gameSettings.lower_limit_of_score > gameSettings.upper_limit_of_score) { 
          setError(t('errorMinGreaterMax')); 
          return false; 
        }
        // --- Offset Sum Validation ---
        const totalOffset = players.reduce((sum, player) => {
            // Ensure we are summing numbers, treat potential NaN/undefined as 0
            const offsetValue = Number(player.initial_offset) || 0;
            return sum + offsetValue;
        }, 0);

        // Use a small tolerance for floating-point comparison
        if (Math.abs(totalOffset) > 0.001) {
            setOffsetError(t('errorOffsetSum'));
            return false; // Stop the game creation process
        } else {
            setOffsetError(null); // Clear any previous error if the sum is now correct
        }
        setError(null);
        return true;
    };

    // --- Submit ---
    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        setError(null);
        setApiSuccessMessage(null);
        setOffsetError(null);

        if (!validateInputs()) return;

        setIsLoading(true);

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
                initial_offset: player.initial_offset || 0,
            })),
        };

        try {
            const response = await fetch(`${API_URL}/games`, {
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
             const gameId = createdGame?.game_id ?? 'UNKNOWN_ID';
            setApiSuccessMessage(t('SuccessGameCreation', { gameId }));

            setTimeout(() => {
                if (createdGame?.game_id) {
                    navigate(`/game/${createdGame.game_id}`);
                } else {
                   console.error("Game ID not found in response");
                   setError(t('errorCreateGameIdMissing')); // Add translation for this
                   setIsLoading(false);
                }
            }, 1500); // 1.5 second delay

        } catch (err: any) {
            console.error('Failed to create game:', err);
            setError(err.message || t('errorCreateGame'));
            setIsLoading(false);
        } 
    };
    // --- Render ---
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper 
                elevation={0} 
                sx={{ 
                    p: 3, 
                    backgroundColor: 'transparent', 
                    color: 'white', 
                }}
            >
                <Typography variant="h4" component="h1" gutterBottom>
                    {t('gameSetupTitle')}
                </Typography>

                <Grid container spacing={4}> {/* Increased spacing */}

                    {/* --- Left Column: Score Preview --- */}
                    <Grid item xs={12} md={5} component="div">
                        <Typography variant="h6" component="h2" gutterBottom sx={{ mt: 1 }}> {/* Adjusted mt */}
                            {t('scorePreviewTitle')}
                        </Typography>
                        <Paper variant="outlined" sx={{
                            p: 2,
                            minHeight: '200px', // Adjust as needed
                            maxHeight: 'calc(100vh - 300px)', // Example max height, adjust based on surrounding elements
                            overflowY: 'auto', // Make it scrollable if content exceeds maxHeight
                            whiteSpace: 'pre-wrap',
                            backgroundColor: 'transparent',
                            fontFamily: 'monospace',
                            lineHeight: 1.6, // Improve readability
                            fontSize: '1.2rem',
                            color: 'silver', // Set text color to silver
                        }}>
                            {scorePreview.length > 0 ? scorePreview.join('\n') : t('calculatingPreview')} {/* Use translation */}
                        </Paper>
                    </Grid>

                    {/* --- Right Column: Main Form --- */}
                    <Grid item xs={12} md={7} component="div">
                        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>

                            {/* --- Player Setup --- */}
                            <Typography variant="h6" component="h2" gutterBottom sx={{ color: 'white' }}>
                                {t('player')}
                            </Typography>
                            {players.map((player, index) => (
                                <Box
                                    key={player.id} // Key on the root element in the map
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5,
                                        mb: 2 // Adjust spacing as needed (margin-bottom: 16px)
                                    }}
                                >
                                    {/* Player Name TextField */}
                                    <TextField
                                        label={t('playerLabel', { index: index + 1 })}
                                        value={player.name}
                                        onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                                        required variant="outlined" size="small" 
                                        sx={{
                                            ...inputStyles, 
                                            flexGrow: 1
                                        }}
                                    />
                                    {/* MuiColorInput */}
                                    <MuiColorInput
                                        label={t('playerColorLabel')} value={player.color}
                                        onChange={(newColor) => handlePlayerColorChange(index, newColor)}
                                        format="hex" variant="outlined" size="small" isAlphaHidden
                                        sx={{ 
                                            width: '110px', // Keep overall width (or adjust slightly e.g., 115px)
                                            // Base label/border styles
                                            '& label.Mui-focused': { color: 'white' },
                                            '& .MuiInputLabel-root': { color: 'silver' },
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': { borderColor: 'silver' },
                                                '&:hover fieldset': { borderColor: 'white' },
                                                '&.Mui-focused fieldset': { borderColor: 'white' },
                                            },
                                            // Adjusted input styles to prevent overlap
                                            '& .MuiInputBase-input': {
                                                color: 'transparent',      // Hide text
                                                caretColor: 'currentColor',// Show cursor
                                                cursor: 'pointer',
                                                width: 'auto', // Allow minimal width based on padding
                                                paddingLeft: '1px', // Minimal padding left
                                                paddingRight: '0px', // No padding right
                                                // Removed marginLeft: '-8px' which might have caused overlap
                                            }
                                        }}
                                    />
                                    {/* Initial Offset TextField */}
                                    <TextField
                                        label={t('playerInitialOffsetLabel')} type="number" value={player.initial_offset}
                                        onChange={(e) => handlePlayerOffsetChange(index, e.target.value)}
                                        variant="outlined" size="small"
                                        InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                                        inputProps={{ step: "0.1" }} 
                                        sx={{ ...inputStyles, width: 100 }}
                                    />
                                </Box>
                            ))}

                            {/* --- Game Rules --- */}
                            <Typography variant="h6" component="h2" gutterBottom sx={{mt: 3, color: 'white' }}>
                                {t('gameRulesLabel')}
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} component="div">
                                    <TextField
                                        label={t('gameNameLabel')}
                                        name="game_name"
                                        value={gameSettings.game_name}
                                        onChange={handleSettingChange}
                                        fullWidth
                                        variant="outlined"
                                        size="small"
                                        sx={inputStyles}
                                    />
                                </Grid>
                                <Grid item xs={12} component="div">
                                    <FormControl fullWidth size="small" sx={{...inputStyles, minWidth: 120 }}>
                                        <InputLabel>{t('maxMoneyLabel')} ($)</InputLabel>
                                        <Select
                                            name="max_money"
                                            value={gameSettings.max_money}
                                            label={`${t('maxMoneyLabel')} ($)`}
                                            onChange={handleSettingChange}
                                            
                                        >
                                            {maxMoneyOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} component="div">
                                    <FormControl fullWidth size="small" sx={{...inputStyles, minWidth: 120 }}>
                                        <InputLabel>{t('maxScoreLabel')}</InputLabel>
                                        <Select
                                            name="upper_limit_of_score"
                                            value={gameSettings.upper_limit_of_score}
                                            label={t('maxScoreLabel')}
                                            onChange={handleSettingChange}
                                            
                                        >
                                            {scoreLimitOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} component="div">
                                    <FormControl fullWidth size="small" sx={{...inputStyles, minWidth: 120 }}>
                                        <InputLabel>{t('minScoreLabel')}</InputLabel>
                                        <Select
                                            name="lower_limit_of_score"
                                            value={gameSettings.lower_limit_of_score}
                                            label={t('minScoreLabel')}
                                            onChange={handleSettingChange}
                                            
                                        >
                                            {minScoreOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} component="div">
                                    <FormControl fullWidth size="small" sx={{...inputStyles, minWidth: 120 }}>
                                        <InputLabel>{t('scoreTypeLabel')}</InputLabel>
                                        <Select
                                            name="half_money_rule"
                                            value={String(gameSettings.half_money_rule)}
                                            label={t('scoreTypeLabel')}
                                            onChange={handleSettingChange}
                                        >
                                            <MenuItem value="true">{t('halfAfter5Rule')}</MenuItem>
                                            <MenuItem value="false">{t('hotHotUpRule')}</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            
                            </Grid>

                            {/* --- Error Display --- */}
                            <Box sx={{ mt: 2, minHeight: '40px' }}>
                                {error && <Alert severity="error" sx={{ mb: 1 , color: 'white' }}>{error}</Alert>}
                                {offsetError && <Alert severity="error" sx={{ mb: 1 , color: 'white' }}>{offsetError}</Alert>}
                                {apiSuccessMessage && <Alert severity="success">{apiSuccessMessage}</Alert>}
                            </Box>

                            {/* --- Submit Button --- */}
                            <Button
                                type="submit"
                                disabled={isLoading}
                                variant="contained"
                                size="large"
                                sx={{ mt: 2, mb: 2 , backgroundColor: 'white', color: 'black', '&:hover': { backgroundColor: '#f0f0f0' } }}
                            >
                                {isLoading ? t('creatingGameButton') : t('createGameButton')}
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
};

export default GameSetupPage;