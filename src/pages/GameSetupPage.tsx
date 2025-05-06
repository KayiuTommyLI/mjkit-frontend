import { useState, useEffect, ChangeEvent, FormEvent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';

// MUI Imports
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { SelectChangeEvent } from '@mui/material/Select';
import Slider from '@mui/material/Slider';
import Radio from '@mui/material/Radio';
import FormControl from '@mui/material/FormControl';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Container from '@mui/material/Container';
import Alert from '@mui/material/Alert';
import { API_URL } from '../config';
import { inputStyles, whiteContainedButtonSx } from '../styles/formStyles';
import React from 'react';
import { EmojiColorPicker } from '../components/EmojiColorPicker';
import { InputAdornment } from '@mui/material';


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
    player_emoji_in_game: string;
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
  { name: 'Blue', value: '#0000FF' },
  { name: 'Red', value: '#FF0000' },
  { name: 'Magenta', value: '#FF00FF' },
  { name: 'Green', value: '#008000' },
  { name: 'DarkGray', value: '#A9A9A9' },
  { name: 'Cyan', value: '#00FFFF' },
  { name: 'Orange', value: '#FFA500' },
  { name: 'Yellow', value: '#FFFF00' },
  { name: 'Purple', value: '#800080' },
  { name: 'Pink', value: '#FFC1CC' },
];
const defaultPlayerNames = ['Player 1', 'Player 2', 'Player 3', 'Player 4'];
const initialOffset = 0; // Default initial offset for players
const maxMoneyOptions = [8, 16, 24, 32, 48, 64, 96, 128, 256, 512, 1024];  // 8 to 1024
const defaultEmoji = ['👺', '👻', '👼', '🐼', '🌝', '🤠', '🤡', '🦁', '🐮', '🐷'];
const MIN_PLAYERS = 4;
const MAX_PLAYERS = 10;

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
            initial_offset: initialOffset,
            emoji: defaultEmoji[index % defaultEmoji.length]
        }))
    );

    const [gameSettings, setGameSettings] = useState({
        max_money: defaultMaxMoney,
        upper_limit_of_score: defaultUpperLimit,
        lower_limit_of_score: defaultLowerLimit,
        half_money_rule: defaultHalfMoneyRule,
        one_pay_all_rule: false,
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
                onePayAllRule: String(gameSettings.one_pay_all_rule), // Add this line
            }).toString();

            try {
                const response = await fetch(`${API_URL}/game/score-preview?${queryParams}`);
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
    }, [gameSettings.max_money, gameSettings.upper_limit_of_score, gameSettings.lower_limit_of_score, 
        gameSettings.half_money_rule, gameSettings.one_pay_all_rule, i18n.language, t]);

    // Add this before the return statement in your component
    // Create logarithmically spaced positions for slider marks
    const logPositions = useMemo(() => {
        const minLog = Math.log(maxMoneyOptions[0]);
        const maxLog = Math.log(maxMoneyOptions[maxMoneyOptions.length - 1]);
        const range = maxLog - minLog;
        
        return maxMoneyOptions.map(value => {
            // Calculate position as percentage (0 to 100)
            const logVal = Math.log(value);
            const position = ((logVal - minLog) / range) * 100;
            return {
                value,
                position
            };
        });
    }, []);

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
        } else if (name === 'half_money_rule' || name === 'one_pay_all_rule') {
            processedValue = value === 'true';
        }
        // Handle game_name separately as it comes from TextField event
        if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
            if(name === 'game_name') processedValue = value;
        }
        setGameSettings(prev => ({ ...prev, [name]: processedValue }));
        if (error?.includes(t('Faan'))) setError(null); // Clear score limit errors
    };

    // Add emoji handler
    const handlePlayerEmojiChange = (index: number, emoji: string) => {
        const updatedPlayers = [...players];
        updatedPlayers[index].emoji = emoji;
        setPlayers(updatedPlayers);
    };

    const addPlayer = () => {
        if (players.length >= MAX_PLAYERS) return;
        
        // Create a new player with default values
        const newPlayer = {
            id: players.length,
            name: `Player ${players.length + 1}`,
            color: availableColors[players.length % availableColors.length].value,
            initial_offset: initialOffset,
            emoji: defaultEmoji[players.length % defaultEmoji.length]
        };
        
        setPlayers(prevPlayers => [...prevPlayers, newPlayer]);
    };
    
    const removePlayer = () => {
        if (players.length <= MIN_PLAYERS) return;
        
        setPlayers(prevPlayers => prevPlayers.slice(0, -1));
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
                player_emoji_in_game: player.emoji,
                player_order: index,
                initial_offset: player.initial_offset || 0,
            })),
        };

        try {
            const response = await fetch(`${API_URL}/game`, {
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
            const gameId = createdGame.game.game_id ?? 'UNKNOWN_ID';
            setApiSuccessMessage(t('SuccessGameCreation', { game_id: gameId }));

            localStorage.setItem(`gameMasterToken_${gameId}`, createdGame.gameMasterToken);
            console.log(`Game Master Token stored for game ${gameId}`);

            setTimeout(() => {
                if (gameId) {
                    navigate(`/game/${gameId}`);
                } else {
                   console.error("Game ID not found in response");
                   setError(t('errorCannotStartNoId')); // Add translation for this
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
                    {/* --- Right Column: Main Form --- */}
                    <Grid item xs={12} md={7}>
                        <Box 
                            component="form" 
                            id="gameSetupForm"
                            onSubmit={handleSubmit} 
                            noValidate 
                            sx={{ mt: 1 }}
                        >

                            {/* --- Player Setup --- */}
                            <Typography variant="h6" component="h2" gutterBottom sx={{ color: 'white' }}>
                                {t('player')}
                            </Typography>
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                justifyContent: 'space-between', 
                                mb: 2
                            }}>
                                <Typography variant="body2" color="silver">
                                    {t('playerCountLabel', { count: players.length })}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button 
                                        variant="outlined" 
                                        size="small" 
                                        onClick={removePlayer}
                                        disabled={players.length <= MIN_PLAYERS}
                                        sx={{
                                            minWidth: '36px',
                                            color: 'silver',
                                            borderColor: 'silver',
                                            '&:hover': {
                                                borderColor: 'white',
                                                color: 'white',
                                            },
                                            '&.Mui-disabled': {
                                                color: 'rgba(255, 255, 255, 0.3)',
                                                borderColor: 'rgba(255, 255, 255, 0.3)',
                                            }
                                        }}
                                    >
                                        -
                                    </Button>
                                    <Typography variant="body1" sx={{ minWidth: '20px', textAlign: 'center', color: 'white' }}>
                                        {players.length}
                                    </Typography>
                                    <Button 
                                        variant="outlined" 
                                        size="small"
                                        onClick={addPlayer}
                                        disabled={players.length >= MAX_PLAYERS}
                                        sx={{
                                            minWidth: '36px',
                                            color: 'silver',
                                            borderColor: 'silver',
                                            '&:hover': {
                                                borderColor: 'white',
                                                color: 'white',
                                            },
                                            '&.Mui-disabled': {
                                                color: 'rgba(255, 255, 255, 0.3)',
                                                borderColor: 'rgba(255, 255, 255, 0.3)',
                                            }
                                        }}
                                    >
                                        +
                                    </Button>
                                </Box>
                            </Box>
                            {players.map((player, index) => (
                                <Box
                                    key={player.id}
                                    sx={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        alignItems: 'center',
                                        gap: { xs: 1.5, sm: 2 },
                                        mb: 2,
                                        width: '100%'
                                    }}
                                >
                                    {/* 1. EmojiColorPicker - Make sure it has its own space */}
                                    <Box sx={{ 
                                        width: '40px',
                                        height: '40px',
                                        flexShrink: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <EmojiColorPicker
                                            // label={t('playerColorLabel')}
                                            value={player.color}
                                            onChange={(newColor) => handlePlayerColorChange(index, newColor)}
                                            emoji={player.emoji}
                                            onEmojiChange={(newEmoji) => handlePlayerEmojiChange(index, newEmoji)}
                                            colors={availableColors}
                                            noBorder={false}
                                        />
                                    </Box>
                                    
                                    {/* 2. Player Name TextField */}
                                    <Box sx={{ 
                                        flexGrow: 1, 
                                        flexShrink: 1,
                                        minWidth: { xs: '100%', sm: '180px' }
                                    }}>
                                        <TextField
                                            label={t('playerLabel', { index: index + 1 })}
                                            value={player.name}
                                            onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                                            required 
                                            variant="outlined" 
                                            size="small" 
                                            fullWidth
                                            sx={{
                                                ...inputStyles,
                                                ml: { xs: '40px', sm: 0 },
                                                mt: { xs: 1, sm: 0 }
                                            }}
                                        />
                                    </Box>
                                    
                                    {/* 3. Initial Offset TextField */}
                                    <Box sx={{ 
                                        flexShrink: 0,
                                        width: { xs: 'calc(100% - 40px)', sm: '110px' },
                                        ml: { xs: '40px', sm: 0 },
                                        mt: { xs: 1, sm: 0 }
                                    }}>
                                        <TextField
                                            label={t('playerInitialOffsetLabel')} 
                                            type="number" 
                                            value={player.initial_offset}
                                            onChange={(e) => handlePlayerOffsetChange(index, e.target.value)}
                                            variant="outlined" 
                                            size="small"
                                            fullWidth
                                            InputProps={{ 
                                                startAdornment: <InputAdornment position="start">
                                                    <Typography color="white">$</Typography>
                                                </InputAdornment> 
                                            }}
                                            // Fix step control with more precise configuration
                                            inputProps={{ 
                                                step: 0.1,  // Use number instead of string
                                                min: -999999,  // Add reasonable min/max
                                                max: 999999,
                                                style: { color: 'white' }  // Ensure text color consistency
                                            }} 
                                            sx={inputStyles}
                                        />
                                    </Box>
                                </Box>
                            ))}

                            {/* --- Game Rules --- */}
                            <Typography variant="h6" component="h2" gutterBottom sx={{mt: 3, color: 'white' }}>
                                {t('gameRulesLabel')}
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
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
                                <Grid item xs={12}>
                                    <Box sx={{ width: '100%', mt: 1, mb: 2 }}>
                                        <Typography variant="body2" color="silver" gutterBottom>
                                            {t('maxMoneyLabel')} ($)
                                        </Typography>
                                        
                                        <Box sx={{ 
                                            display: 'flex', 
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            px: 2
                                        }}>
                                            {/* Current value display */}
                                            <Typography variant="h5" color="white" sx={{ mb: 1 }}>
                                                ${gameSettings.max_money}
                                            </Typography>
                                            
                                            <Slider
                                                name="max_money"
                                                value={gameSettings.max_money}
                                                onChange={(_, value) => {
                                                    setGameSettings(prev => ({
                                                        ...prev,
                                                        max_money: value as number
                                                    }));
                                                }}
                                                step={null}
                                                marks={maxMoneyOptions.map(value => ({ value, label: '' }))}
                                                min={maxMoneyOptions[0]}
                                                max={maxMoneyOptions[maxMoneyOptions.length - 1]}
                                                sx={{
                                                    width: '100%',
                                                    color: 'white',
                                                    '& .MuiSlider-rail': { backgroundColor: 'rgba(255, 255, 255, 0.3)' },
                                                    '& .MuiSlider-track': { backgroundColor: 'white' },
                                                    '& .MuiSlider-thumb': {
                                                        backgroundColor: 'white',
                                                        '&:hover, &.Mui-focusVisible': {
                                                            boxShadow: '0 0 0 8px rgba(255, 255, 255, 0.16)'
                                                        }
                                                    },
                                                    '& .MuiSlider-mark': { backgroundColor: 'silver', height: 4 },
                                                    '& .MuiSlider-markActive': { backgroundColor: 'white' }
                                                }}
                                            />
                                            
                                            {/* Range indicators */}
                                            <Box sx={{ 
                                                display: 'flex', 
                                                justifyContent: 'space-between', 
                                                width: '100%', 
                                                mt: 0.5 
                                            }}>
                                                <Typography variant="caption" color="silver">${maxMoneyOptions[0]}</Typography>
                                                <Typography variant="caption" color="silver">${maxMoneyOptions[maxMoneyOptions.length - 1]}</Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Grid>
                                <Grid item xs={12}>
                                    <Box sx={{ width: '100%', mt: 1, mb: 2 }}>
                                        <Typography variant="body2" color="silver" gutterBottom>
                                            {t('maxScoreLabel')} 
                                        </Typography>
                                        
                                        <Box sx={{ 
                                            display: 'flex', 
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            px: 2
                                        }}>
                                            <Typography variant="h5" color="white" sx={{ mb: 1 }}>
                                                {gameSettings.upper_limit_of_score}
                                            </Typography>
                                            
                                            <Slider
                                                name="upper_limit_of_score"
                                                value={gameSettings.upper_limit_of_score}
                                                onChange={(_, value) => {
                                                    const newValue = value as number;
                                                    setGameSettings(prev => {
                                                        // Ensure lower limit isn't higher than upper limit
                                                        const lowerLimit = Math.min(prev.lower_limit_of_score, newValue);
                                                        return {
                                                            ...prev,
                                                            upper_limit_of_score: newValue,
                                                            lower_limit_of_score: lowerLimit
                                                        };
                                                    });
                                                }}
                                                step={1}
                                                marks
                                                min={3}
                                                max={30}
                                                sx={{
                                                    width: '100%',
                                                    color: 'white',
                                                    '& .MuiSlider-rail': { backgroundColor: 'rgba(255, 255, 255, 0.3)' },
                                                    '& .MuiSlider-track': { backgroundColor: 'white' },
                                                    '& .MuiSlider-thumb': {
                                                        backgroundColor: 'white',
                                                        '&:hover, &.Mui-focusVisible': {
                                                            boxShadow: '0 0 0 8px rgba(255, 255, 255, 0.16)'
                                                        }
                                                    },
                                                    '& .MuiSlider-markActive': { backgroundColor: 'white' }
                                                }}
                                            />
                                            
                                            <Box sx={{ 
                                                display: 'flex', 
                                                justifyContent: 'space-between', 
                                                width: '100%', 
                                                mt: 0.5 
                                            }}>
                                                <Typography variant="caption" color="silver">3</Typography>
                                                <Typography variant="caption" color="silver">30</Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Grid>
                                <Grid item xs={12}>
                                    <Box sx={{ width: '100%', mt: 1, mb: 2 }}>
                                        <Typography variant="body2" color="silver" gutterBottom>
                                            {t('minScoreLabel')} 
                                        </Typography>
                                        
                                        <Box sx={{ 
                                            display: 'flex', 
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            px: 2
                                        }}>
                                            <Typography variant="h5" color="white" sx={{ mb: 1 }}>
                                                {gameSettings.lower_limit_of_score}
                                            </Typography>
                                            
                                            <Slider
                                                name="lower_limit_of_score"
                                                value={gameSettings.lower_limit_of_score}
                                                onChange={(_, value) => {
                                                    setGameSettings(prev => ({
                                                        ...prev,
                                                        lower_limit_of_score: value as number
                                                    }));
                                                }}
                                                step={1}
                                                marks
                                                min={1}
                                                max={gameSettings.upper_limit_of_score}
                                                sx={{
                                                    width: '100%',
                                                    color: 'white',
                                                    '& .MuiSlider-rail': { backgroundColor: 'rgba(255, 255, 255, 0.3)' },
                                                    '& .MuiSlider-track': { backgroundColor: 'white' },
                                                    '& .MuiSlider-thumb': {
                                                        backgroundColor: 'white',
                                                        '&:hover, &.Mui-focusVisible': {
                                                            boxShadow: '0 0 0 8px rgba(255, 255, 255, 0.16)'
                                                        }
                                                    },
                                                    '& .MuiSlider-markActive': { backgroundColor: 'white' }
                                                }}
                                            />
                                            
                                            <Box sx={{ 
                                                display: 'flex', 
                                                justifyContent: 'space-between', 
                                                width: '100%', 
                                                mt: 0.5 
                                            }}>
                                                <Typography variant="caption" color="silver">1</Typography>
                                                <Typography variant="caption" color="silver">{gameSettings.upper_limit_of_score}</Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sx={{ mt: 2 }}>
                                    <Typography variant="body2" color="silver" gutterBottom>
                                        {t('scoreTypeLabel')}
                                    </Typography>
                                    
                                    <FormControl component="fieldset">
                                        <Box sx={{ display: 'flex', gap: 4 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Radio
                                                    checked={gameSettings.half_money_rule}
                                                    onChange={() => setGameSettings(prev => ({ ...prev, half_money_rule: true }))}
                                                    value="true"
                                                    name="half_money_rule"
                                                    sx={{
                                                        color: 'silver',
                                                        '&.Mui-checked': { color: 'white' },
                                                    }}
                                                />
                                                <Typography color="white">{t('halfAfter5Rule')}</Typography>
                                            </Box>
                                            
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Radio
                                                    checked={!gameSettings.half_money_rule}
                                                    onChange={() => setGameSettings(prev => ({ ...prev, half_money_rule: false }))}
                                                    value="false"
                                                    name="half_money_rule"
                                                    sx={{
                                                        color: 'silver',
                                                        '&.Mui-checked': { color: 'white' },
                                                    }}
                                                />
                                                <Typography color="white">{t('hotHotUpRule')}</Typography>
                                            </Box>
                                        </Box>
                                    </FormControl>
                                </Grid>
                                {/* <Grid item xs={12}>
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
                                </Grid> */}
                                <Grid item xs={12} sx={{ mt: 2 }}>
                                    <Typography variant="body2" color="silver" gutterBottom>
                                        {t('paymentRuleLabel')}
                                    </Typography>
                                    
                                    <FormControl component="fieldset">
                                        <Box sx={{ display: 'flex', gap: 4 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Radio
                                                    checked={!gameSettings.one_pay_all_rule}
                                                    onChange={() => setGameSettings(prev => ({ ...prev, one_pay_all_rule: false }))}
                                                    value="true"
                                                    name="one_pay_all_rule"
                                                    sx={{
                                                        color: 'silver',
                                                        '&.Mui-checked': { color: 'white' },
                                                    }}
                                                />
                                                <Typography color="white">{t("fullTungRule")}</Typography>
                                            </Box>
                                            
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Radio
                                                    checked={gameSettings.one_pay_all_rule}
                                                    onChange={() => setGameSettings(prev => ({ ...prev, one_pay_all_rule: true }))}
                                                    value="false"
                                                    name="one_pay_all_rule"
                                                    sx={{
                                                        color: 'silver',
                                                        '&.Mui-checked': { color: 'white' },
                                                    }}
                                                />
                                                <Typography color="white">{t("halfTungRule")}</Typography>
                                            </Box>
                                        </Box>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Box>
                    </Grid>
                    {/* --- Left Column: Score Preview --- */}
                    <Grid item xs={12} md={5}>
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
                            mb: 2 // Add margin bottom for spacing
                        }}>
                            {scorePreview.length > 0 ? scorePreview.join('\n') : t('calculatingPreview')} {/* Use translation */}
                        </Paper>
                        
                        {/* --- Submit Button (Moved from right column) --- */}
                        <Button
                            type="submit"
                            form="gameSetupForm" // Important: Connect to form by ID
                            disabled={isLoading}
                            variant="contained"
                            size="large"
                            fullWidth
                            sx={{ ...whiteContainedButtonSx, mt: 1 }}
                        >
                            {isLoading ? t('creatingGameButton') : t('createGameButton')}
                        </Button>
                        
                        {/* Also move error messages under the button */}
                        <Box sx={{ mt: 2, minHeight: '40px' }}>
                            {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
                            {offsetError && <Alert severity="error" sx={{ mb: 1 }}>{offsetError}</Alert>}
                            {apiSuccessMessage && <Alert severity="success">{apiSuccessMessage}</Alert>}
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
};

export default GameSetupPage;