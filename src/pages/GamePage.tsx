// src/pages/GamePage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Import useTranslation

// MUI Imports
import {
    Container, Typography, Paper, Box, List, ListItem, ListItemText, ListItemAvatar,
    Avatar, CircularProgress, Alert, Button, Divider, IconButton, Collapse,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material'; // Consolidated imports
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DeleteIcon from '@mui/icons-material/Delete';

import ConfirmationDialog from '../components/ConfirmationDialog'; // Import confirmation dialog
import RoundEntryModal from '../components/RoundEntryModal';
import GameHistoryTable from '../components/GameHistoryTable'; // <-- Import table component
import { API_URL } from '../config';
import { inputStyles } from '../styles/formStyles';

// --- Interfaces ---
// (Keep existing GamePlayerData and GameData interfaces)
export interface GamePlayerData {
    game_player_id: string;
    user_id: string | null;
    player_name_in_game: string;
    player_color_in_game: string;
    current_balance: number | string; // Accept string due to potential decimal issue
    player_order: number;
    is_active: boolean;
}
interface GameData {
    game_id: string;
    game_name?: string;
    max_money: number;
    upper_limit_of_score: number;
    lower_limit_of_score: number;
    half_money_rule: boolean;
    game_status: string; // 'setting_up', 'active', 'finished'
    gamePlayers: GamePlayerData[];
}
// --- NEW: Interfaces for Round Data ---
// Ensure these match the structure returned by GET /games/:id/rounds
export interface RoundStateData {
    round_state_id: string;
    game_player_id: string;
    balance_change: number | string; // Allow string due to decimal
    player_state: string; // Use the PlayerState enum string values
    // Include gamePlayer details if nested in API response and needed
    // gamePlayer?: { game_player_id: string; player_name_in_game: string; user_id: string | null };
}
export interface RoundData {
    round_id: string;
    round_number: number;
    score_value: number;
    win_type: string; // Use WinType enum string values
    winner_game_player_id: string;
    loser_game_player_id: string | null;
    submitted_by_game_player_id: string | null; // Updated to be nullable
    created_at: string; // ISO date string
    is_deleted: boolean;
    // Include nested relations if available and needed (ensure backend loads them)
    winner?: { game_player_id: string; player_name_in_game: string; };
    loser?: { game_player_id: string; player_name_in_game: string; } | null;
    // submitted_by?: { game_player_id: string; player_name_in_game: string; } | null; // Relation might be null now
    roundStates: RoundStateData[];
}
// Keep PlayerInfoForModal and ScoreLimitsForModal
export interface PlayerInfoForModal { 
    game_player_id: string; 
    player_name_in_game: string; 
}
export interface ScoreLimitsForModal { 
    min: number; 
    max: number; 
}

interface ScorePreviewItem {
    score: number;
    money: number;
}


// // Reusable input styles (If needed for any inputs on this page, or import from shared)
// const inputStyles = { 
//     '& label.Mui-focused': { color: 'white' },
//     '& .MuiInputLabel-root': { color: 'silver' }, // Label color
//     '& .MuiOutlinedInput-root': {
//         '& fieldset': { borderColor: 'silver' }, // Border color
//         '&:hover fieldset': { borderColor: 'white' },
//         '&.Mui-focused fieldset': { borderColor: 'white' },
//         '& input': { color: 'white' }, // Input text color (for TextField)
//         '& .MuiSelect-select': { color: 'white' }, // Select value color
//         '& .MuiSvgIcon-root': { color: 'silver'} // Select dropdown arrow color
//     },
//      '& .MuiInputAdornment-root p': { color: 'silver' } // Adornment color (for offset) 
// };

const outlinedSilverButtonSx = { 
    color: 'silver', 
    borderColor: 'silver', 
    '&:hover': { 
        color: 'white', 
        borderColor: 'white', 
        backgroundColor: 'rgba(255, 255, 255, 0.08)' 
    } 
};

const textSilverButtonSx = { 
    color: 'silver', 
    '&:hover': { 
        color: 'white', 
        backgroundColor: 'rgba(255, 255, 255, 0.08)' 
    } 
};

const containedWhiteButtonSx = { 
    backgroundColor: 'white', 
    color: 'black', 
    '&:hover': { 
        backgroundColor: '#e0e0e0' 
    } 
};


const GamePage: React.FC = () => {
    const { gameId } = useParams<{ gameId: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation(); // Initialize translation

    // State for game details
    const [gameData, setGameData] = useState<GameData | null>(null);
    const [loadingGame, setLoadingGame] = useState<boolean>(true); // Separate loading for game
    const [gameError, setGameError] = useState<string | null>(null);

    // --- State for Rounds Data ---
    const [rounds, setRounds] = useState<RoundData[]>([]);
    const [loadingRounds, setLoadingRounds] = useState<boolean>(true); // Separate loading for rounds
    const [roundsError, setRoundsError] = useState<string | null>(null);


    // --- State for Score Table ---
    const [scoreTable, setScoreTable] = useState<ScorePreviewItem[]>([]);
    const [loadingScoreTable, setLoadingScoreTable] = useState<boolean>(false); // Only load when gameData is available
    const [scoreTableError, setScoreTableError] = useState<string | null>(null);
    const [showScoreTable, setShowScoreTable] = useState<boolean>(false); // State to toggle visibility

    // State for Start Game action
    const [startError, setStartError] = useState<string | null>(null);
    const [isStartingGame, setIsStartingGame] = useState<boolean>(false);

    // State for Modal
    const [isRoundModalOpen, setIsRoundModalOpen] = useState(false);

    // State for Master Token presence
    const [hasMasterToken, setHasMasterToken] = useState<boolean>(false);

    // --- State for Delete Confirmation ---
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
    const [roundToDelete, setRoundToDelete] = useState<RoundData | null>(null);
    const [isDeletingRound, setIsDeletingRound] = useState<boolean>(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    // Check for Master Token on Load/GameId Change
    useEffect(() => {
        if (gameId) {
            const token = localStorage.getItem(`gameMasterToken_${gameId}`);
            setHasMasterToken(!!token);
        } else {
            setHasMasterToken(false);
        }
    }, [gameId]);


    // --- *** UPDATED Fetch Function *** ---
    // Fetches both game details and rounds data, potentially in parallel
    const fetchAllGameData = useCallback(async (showLoadingSpinner = true) => {
        if (!gameId) {
            setGameError(t('errorNoGameId'));
            setLoadingGame(false);
            setLoadingRounds(false);
            return;
        }
        console.log(`Fetching all data for game ID: ${gameId}`);
        if (showLoadingSpinner) {
            setLoadingGame(true);
            setLoadingRounds(true);
        }
        // Clear previous errors before fetching
        setGameError(null);
        setRoundsError(null);
        setStartError(null);
        setScoreTableError(null);

        let fetchedGameData: GameData | null = null;

        try {
            // Fetch game details and rounds concurrently
            const [gameRes, roundsRes] = await Promise.all([
                fetch(`${API_URL}/games/${gameId}`),
                fetch(`${API_URL}/games/${gameId}/rounds`)
            ]);

            // Process Game Response
            if (!gameRes.ok) {
                let errorMsg = `Game Data Error: ${gameRes.status}`;
                try { 
                    const d = await gameRes.json(); 
                    errorMsg = d.message || JSON.stringify(d); 
                }
                catch (e) { 
                    errorMsg = `${gameRes.status} ${gameRes.statusText}`; 
                }
                throw new Error(errorMsg); // Throw to be caught below
            }
            const gameResult: GameData = await gameRes.json();
            if (typeof gameResult.max_money === 'string') {
                gameResult.max_money = parseFloat(gameResult.max_money);
            }
            if (gameResult.gamePlayers) 
                gameResult.gamePlayers.sort((a, b) => a.player_order - b.player_order);

            setGameData(gameResult);
            console.log("Fetched and set game data:", gameResult);
            setLoadingGame(false);

            // Process Rounds Response
            if (!roundsRes.ok) {
                let errorMsg = `Rounds Data Error: ${roundsRes.status}`;
                try { 
                    const d = await roundsRes.json(); 
                    errorMsg = d.message || JSON.stringify(d); 
                } 
                catch (e) { 
                    errorMsg = `${roundsRes.status} ${roundsRes.statusText}`; 
                }
                // Set rounds error, but don't throw if game data was successful
                setRoundsError(errorMsg);
                setRounds([]);
                console.error("Error fetching rounds:", errorMsg);
            } else {
                const roundsResult: RoundData[] = await roundsRes.json();
                setRounds(roundsResult);
                console.log("Fetched rounds data:", roundsResult);
            }
            setLoadingRounds(false); // Rounds data loaded or failed

            // --- Fetch Score Table Data (using if gameResult loaded) ---
            if ( gameResult ) {
                fetchedGameData = gameResult; // Store the fetched game data for later use
                // Only fetch score table if game data is available 
                setLoadingScoreTable(true);
                setScoreTableError(null);
                const queryParams = new URLSearchParams({
                    maxMoney: String(fetchedGameData.max_money),
                    upperLimitOfScore: String(fetchedGameData.upper_limit_of_score),
                    lowerLimitOfScore: String(fetchedGameData.lower_limit_of_score),
                    halfMoneyRule: String(fetchedGameData.half_money_rule),
                }).toString();
                try {
                    const scoreRes = await fetch(`${API_URL}/games/score-preview?${queryParams}`);
                    if (!scoreRes.ok) {
                         let errorMsg = `Score Table Error: ${scoreRes.status}`;
                         try { 
                            const d = await scoreRes.json(); 
                            errorMsg = d.message || JSON.stringify(d); 
                        } 
                        catch (e) { 
                            errorMsg = `${scoreRes.status} ${scoreRes.statusText}`; 
                        }
                         throw new Error(errorMsg);
                    }
                    const scoreResult: ScorePreviewItem[] = await scoreRes.json();
                    setScoreTable(scoreResult);
                    console.log("Fetched score table data:", scoreResult);
                    setLoadingScoreTable(false);
                } catch (scoreErr: any) {
                     console.error("Error fetching score table:", scoreErr);
                     setScoreTableError(scoreErr.message || 'Failed to load score table.');
                     setScoreTable([]);
                     setLoadingScoreTable(false);
                } 
            }
            // --- End Score Table Fetch ---
            
            // Re-check token presence
            setHasMasterToken(!!localStorage.getItem(`gameMasterToken_${gameId}`));

        } catch (err: any) {
            console.error("Error fetching game/rounds data:", err);
            // Set combined error state if either fetch failed critically
            setGameError(err.message || 'Failed to fetch essential game data.');
            setGameData(null);
            setRounds([]);
            setLoadingGame(false);
            setLoadingRounds(false);
        }
        finally { 
            if (showLoadingSpinner) { 
                setLoadingGame(false); 
                setLoadingRounds(false); 
            } 
            setDeleteError(null);
        }
    }, [gameId, t]); // Dependency array includes gameId

    // Initial fetch on mount
    useEffect(() => {
        fetchAllGameData();
    }, [fetchAllGameData]); // Use the combined fetch function

    // --- Keep Start Game Handler as is, but it calls fetchAllGameData ---
    const handleStartGame = useCallback(async () => {
        if (!gameId) {
            setStartError(t('errorCannotStartNoId'));
            return;
        }
        setIsStartingGame(true); 
        setStartError(null);
        try {
            const response = await fetch(`${API_URL}/games/${gameId}/start`, { method: 'POST' });
            if (!response.ok) {
                let errorMsg = `Failed to start game: ${response.status}`;
                 try { 
                    const errorData = await response.json(); 
                    errorMsg = errorData.message || JSON.stringify(errorData); 
                }
                 catch (jsonError) { 
                    errorMsg = `${response.status} ${response.statusText}`; 
                }
                 throw new Error(errorMsg); // Throw to be caught below
            }
            const result = await response.json();
            const gameMasterToken = result.gameMasterToken;
            if (!gameMasterToken) {
                throw new Error("Game started but master token was not received from backend.");
            }
            localStorage.setItem(`gameMasterToken_${gameId}`, gameMasterToken);
            setHasMasterToken(true);
            console.log(`Game Master Token stored for game ${gameId}`);
            await fetchAllGameData(false); // Refresh ALL data
        } catch (err: any) { 
            setStartError(err.message || t('errorStartGame')); 
        }
        finally { 
            setIsStartingGame(false); 
        }
    }, [gameId, fetchAllGameData, t]);

    // --- Update Modal Handlers ---
    const handleOpenRoundModal = () => {
        // Check if game is active AND if token exists (basic check)
        const tokenExists = !!localStorage.getItem(`gameMasterToken_${gameId}`);
        if (gameData?.game_status === 'active' && tokenExists) {
             setIsRoundModalOpen(true); // Open the modal if game is active and token exists
        } else if (gameData?.game_status !== 'active') {
             // Optionally show a more user-friendly message (e.g., using a Snackbar or Alert)
             alert(`Cannot add round, game status is: ${gameData?.game_status || 'Unknown'}. Please start the game first.`);
        } else if (!tokenExists) {
             // Optionally show a more user-friendly message
             alert('Cannot add round: Game Master Token not found. Please ensure the game is started.');
        }
    };

    const handleCloseRoundModal = () => setIsRoundModalOpen(false);
    // Refresh ALL data on successful submission
    const handleRoundSubmitSuccess = useCallback(() => {
        console.log("Round submitted, re-fetching all game data...");
        fetchAllGameData(false); // Re-fetch both game and rounds data
    }, [fetchAllGameData]);

    // --- Delete Round Handlers ---
    const handleDeleteRoundRequest = useCallback((round: RoundData) => {
        console.log("Requesting delete for round:", round.round_number);
        setRoundToDelete(round); // Store the round details
        setDeleteError(null); // Clear previous delete errors
        setIsDeleteDialogOpen(true); // Open confirmation dialog
    }, []); // No dependencies needed as it just sets state

    const handleCloseDeleteDialog = () => {
        setIsDeleteDialogOpen(false);
        setRoundToDelete(null); // Clear the round to delete
    };

    const handleConfirmDelete = useCallback(async () => {
        if (!roundToDelete || !gameId) {
            setDeleteError("Cannot delete: Round or Game ID missing.");
            setIsDeleteDialogOpen(false);
            return;
        }

        const gameMasterToken = localStorage.getItem(`gameMasterToken_${gameId}`);
        if (!gameMasterToken) {
            setDeleteError("Cannot delete: Game Master Token not found.");
            setIsDeleteDialogOpen(false);
            return;
        }

        setIsDeletingRound(true);
        setDeleteError(null);
        console.log(`Attempting to delete round ID: ${roundToDelete.round_id}`);

        try {
            const response = await fetch(`${API_URL}/games/${gameId}/rounds/${roundToDelete.round_id}`, {
                method: 'DELETE',
                headers: {
                    'x-game-master-token': gameMasterToken,
                },
            });

            if (!response.ok) {
                // Status 204 (No Content) is success for DELETE, check for others
                if (response.status === 204) {
                     // Success handled in finally block by refreshing data
                } else {
                    let errorMsg = `Error deleting round: ${response.status}`;
                    try { 
                        const errorData = await response.json(); 
                        errorMsg = errorData.message || JSON.stringify(errorData); 
                    }
                    catch (jsonError) { 
                        errorMsg = `${response.status} ${response.statusText}`; 
                    }
                    throw new Error(errorMsg);
                }
            }
             console.log(`Round ${roundToDelete.round_number} deleted successfully.`);
             // Refresh data after successful deletion
             await fetchAllGameData(false);

        } catch (err: any) {
            console.error("Failed to delete round:", err);
            setDeleteError(err.message || t('errorDeleteFailed'));
        } finally {
            setIsDeletingRound(false);
            setIsDeleteDialogOpen(false); // Close dialog regardless of success/fail
            setRoundToDelete(null);
        }
    }, [gameId, roundToDelete, fetchAllGameData, t]); // Dependencies for the handler


    // --- Render Logic ---
    // Combined initial loading state
    if (loadingGame && !gameData) {
        return ( 
            <Container sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <CircularProgress  sx={{ color: 'silver' }}/>
            </Container> 
            );
    }
    // Fatal error if game data failed to load
    if (gameError && !gameData) {
        return ( 
            <Container maxWidth="sm" sx={{ mt: 4 }}>
                <Alert severity="error">
                    {`${t('gameError')}: ${gameError}`}
                </Alert>
                <Button variant="outlined" 
                        onClick={() => navigate('/')} sx={{ ...outlinedSilverButtonSx, mt: 2 }} startIcon={<ArrowBackIcon />}>
                    {t('backButtonLabel')}
                </Button>
            </Container> 
            );
    }
    // Fallback if gameData is somehow null after loading
    if (!gameData) {
         return ( 
            <Container maxWidth="sm" sx={{ mt: 4 }}>
                <Alert severity="info">
                    {t('errorGameNotFound')}
                </Alert>
                <Button variant="outlined" 
                    onClick={() => navigate('/')} sx={{ ...outlinedSilverButtonSx, mt: 2 }} startIcon={<ArrowBackIcon />}>
                    {t('backButtonLabel')}
                </Button>
            </Container> 
        );
    }

    // Prepare data for display and modal
    const activePlayers = gameData.gamePlayers?.filter(p => p.is_active) || [];
    const scoreLimits = { 
        min: gameData.lower_limit_of_score, 
        max: gameData.upper_limit_of_score 
    };
    const activePlayersForModal: PlayerInfoForModal[] = activePlayers.map(p => ({
         game_player_id: p.game_player_id,
         player_name_in_game: p.player_name_in_game
     }));
    const canAddRound = gameData.game_status === 'active' && hasMasterToken;

    return (
        <>
            <Container maxWidth="lg" sx={{ mt: {xs: 2, sm: 4}, mb: 4 }}>
                {/* Style Navigation Buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', flexWrap: 'wrap', mb: 2, gap: 1 }}>
                    <Button variant="outlined" onClick={() => navigate('/')} sx={outlinedSilverButtonSx} startIcon={<ArrowBackIcon />}>
                        {t('newGameSetupButtonLabel')}
                    </Button>
                    <Button variant="text" onClick={() => navigate('/score-reference')}  sx={outlinedSilverButtonSx}>
                        {t('scoreRefButtonLabel')} 
                    </Button>
                </Box>
                <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, backgroundColor: 'transparent', color: 'white' }}>
                    {/* Display non-fatal fetch error if occurred during refresh */}
                     {gameError && !loadingGame && 
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            {t('warningRefreshFailed', { error: gameError })}
                        </Alert>
                    }
                     {/* Display start game error */}
                     {startError && 
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {startError}
                        </Alert>
                    }

                     {/* Display delete error */}
                     {deleteError && 
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {deleteError}
                        </Alert>
                    }

                    {/* ... Game Title, Rules display ... */}
                    <Typography variant="h5" sx={{ color: 'white', mb: 1 }}>
                        {gameData.game_name || t('gameDefaultTitle')}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'silver', mb: 1 }}>
                        {t('gameRuleSummary', {
                            min: scoreLimits.min, 
                            max: scoreLimits.max, 
                            maxMoney: gameData.max_money, 
                            rule: gameData.half_money_rule ? t('halfAfter5Rule') : t('hotHotUpRule')
                            }
                        )}
                    </Typography>
                    
                    <Divider sx={{ my: 2 , borderColor: 'rgba(192, 192, 192, 0.3)' }} />

                     {/* ... Start Game Button (Conditional) ... */}
                     {gameData.game_status === 'setting_up' && (
                        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                            <Button
                                variant="contained"
                                color="secondary" // Or another distinct color
                                onClick={handleStartGame} // <-- Calls the handler
                                disabled={isStartingGame}
                                startIcon={<PlayCircleOutlineIcon />}
                            >
                                {isStartingGame ? 'Starting...' : 'Start Game & Get Master Token'}
                            </Button>
                        </Box>
                    )}
                    <Typography variant="h6" component="h2" gutterBottom sx={{ color: 'white' }}>
                        {t('activePlayersHeader')}
                    </Typography>
                     {/* ... Player List rendering ... */}
                     {/* *** This is the section that renders the list *** */}
                    {activePlayers.length > 0 ? (
                        <List dense={false}>
                            {activePlayers.map((player) => (
                            <ListItem key={player.game_player_id} divider sx={{ borderBottomColor: 'rgba(192, 192, 192, 0.2)' }}>
                                <ListItemAvatar>
                                    {/* Display color avatar */}
                                    <Avatar sx={{ bgcolor: player.player_color_in_game, width: 32, height: 32, border: '1px solid silver' }}> </Avatar>
                                </ListItemAvatar>
                                {/* Display name and balance */}
                                <ListItemText
                                    primary={player.player_name_in_game}
                                    secondary={`${t('balanceLabel')}: $${parseFloat(player.current_balance as any).toFixed(2)}`} // ParseFloat fix
                                    primaryTypographyProps={{ sx: { color: 'white' } }} // Style text
                                    secondaryTypographyProps={{ sx: { color: 'silver' } }} // Style text
                                />
                            </ListItem>
                        ))}
                    </List>
                    ) : (
                        // This message shows if activePlayers array is empty
                        <Typography sx={{ mt: 2 }} color="text.secondary">
                            {t('noActivePlayers')}
                        </Typography>
                    )}

                     <Divider sx={{ my: 2 , borderColor: 'rgba(192, 192, 192, 0.3)' }} />

                     {/* --- Add Round Button --- */}
                     <Box sx={{ mt: 3, mb: 3, display: 'flex', justifyContent: 'center' }}>
                         <Button
                             variant="contained" color="primary" size="large"
                             onClick={handleOpenRoundModal}
                             disabled={loadingGame || isStartingGame || !canAddRound} // Updated disabled logic
                             sx={containedWhiteButtonSx}
                         >
                            {t('addRoundButtonLabel')}
                         </Button>
                    </Box>
                    
                    {/* === Collapsible Score Table Section === */}
                    <Box sx={{mt: 4}}>
                        <Button
                            onClick={() => setShowScoreTable(!showScoreTable)}
                            endIcon={showScoreTable ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            size="small"
                            sx={{ ...textSilverButtonSx, textTransform: 'none', mb: 1 }}
                        >
                            {showScoreTable ?  t('hideScoreTableButton') : t('showScoreTableButton')}
                        </Button>
                        <Collapse in={showScoreTable} timeout="auto" unmountOnExit>
                            {loadingScoreTable ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                    <CircularProgress size={24} sx={{color: 'silver'}}/>
                                </Box>
                            ) : scoreTableError ? (
                                <Alert severity="error" sx={{ mb: 2 }}>{scoreTableError}</Alert>
                            ) : (
                                <TableContainer component={Paper} variant="outlined" sx={{ backgroundColor: 'transparent', borderColor: 'rgba(192, 192, 192, 0.5)', margin: 'auto', maxWidth: 'fit-content' }}>
                                    <Table size="small" aria-label={t('scoreRefTableAriaLabel')}>
                                        {/* <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold', color: 'white', borderBottomColor: 'rgba(192, 192, 192, 0.5)' }}>{t('scoreLabel')}</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'white', borderBottomColor: 'rgba(192, 192, 192, 0.5)' }}>{t('moneyLabel')}</TableCell>
                                            </TableRow>
                                        </TableHead> */}
                                        <TableBody>
                                            {scoreTable.length > 0 ? (
                                                scoreTable.map((item) => (
                                                    <TableRow key={item.score} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                        <TableCell sx={{ color: 'silver', borderBottomColor: 'rgba(192, 192, 192, 0.3)' }}>{item.score} {t('Faan')}</TableCell>
                                                        <TableCell align="right" sx={{ color: 'white', borderBottomColor: 'rgba(192, 192, 192, 0.3)' }}>${item.money.toFixed(1)}</TableCell>                                                    
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                     <TableCell colSpan={2} align="center">{t('scoreRefNoData')}</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </Collapse>
                     </Box>
                     {/* === End Score Table Section === */}

                    {/* === Render GameHistoryTable === */}
                     <Box sx={{mt: 4}}>
                        <Typography variant="h6" component="h2" gutterBottom sx={{ color: 'white' }}>{t('roundHistoryHeader')}</Typography>
                        {/* Pass rounds and active players data */}
                        <GameHistoryTable
                            rounds={rounds}
                            activePlayers={activePlayers} // Pass full player data for headers/colors
                            loading={loadingRounds} // Use separate loading state for rounds
                            error={roundsError} // Pass separate rounds error
                            onDeleteRequest={handleDeleteRoundRequest} // <-- Pass delete handler
                            isDeleting={isDeletingRound} // Pass loading state for delete
                        />
                    </Box>
                    {/* === End GameHistoryTable === */}

                </Paper>
            </Container>

            {/* --- Render the Modal --- */}
            {gameData && (
                 <RoundEntryModal
                    open={isRoundModalOpen}
                    onClose={handleCloseRoundModal}
                    onSubmitSuccess={handleRoundSubmitSuccess} // Pass the combined success handler
                    gameId={gameId}
                    activePlayers={activePlayersForModal}
                    scoreLimits={scoreLimits}
                />
            )}
            
            {/* --- Render the Delete Confirmation Dialog --- */}
            <ConfirmationDialog
                open={isDeleteDialogOpen}
                onClose={handleCloseDeleteDialog}
                onConfirm={handleConfirmDelete}
                title={t('deleteConfirmTitle')} 
                message={t('deleteConfirmMessage', { roundNumber: roundToDelete?.round_number, score: roundToDelete?.score_value, player: roundToDelete?.winner })}
                confirmText={t('deleteButtonLabel')} 
                isConfirming={isDeletingRound} // Pass loading state for delete confirmation
            />
        </>
    );
};

export default GamePage;
