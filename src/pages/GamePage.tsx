// src/pages/GamePage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// MUI Imports (ensure all needed are imported)
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DeleteIcon from '@mui/icons-material/Delete'; // For delete button in table

import ConfirmationDialog from '../components/ConfirmationDialog'; // Import confirmation dialog

// Import the modal and the new table component
import RoundEntryModal from '../components/RoundEntryModal';
import GameHistoryTable from '../components/GameHistoryTable'; // <-- Import table component
import { Collapse, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

// --- Interfaces ---
// (Keep existing GamePlayerData and GameData interfaces)
interface GamePlayerData {
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
export interface PlayerInfoForModal { game_player_id: string; player_name_in_game: string; }
export interface ScoreLimitsForModal { min: number; max: number; }

interface ScorePreviewItem {
    score: number;
    money: number;
}

const GamePage: React.FC = () => {
    const { gameId } = useParams<{ gameId: string }>();
    const navigate = useNavigate();

    // State for game details
    const [gameData, setGameData] = useState<GameData | null>(null);
    const [loadingGame, setLoadingGame] = useState<boolean>(true); // Separate loading for game
    const [gameError, setGameError] = useState<string | null>(null);

    // --- NEW: State for Rounds Data ---
    const [rounds, setRounds] = useState<RoundData[]>([]);
    const [loadingRounds, setLoadingRounds] = useState<boolean>(true); // Separate loading for rounds
    const [roundsError, setRoundsError] = useState<string | null>(null);
    // --- END NEW ---

    // --- NEW: State for Score Table ---
    const [scoreTable, setScoreTable] = useState<ScorePreviewItem[]>([]);
    const [loadingScoreTable, setLoadingScoreTable] = useState<boolean>(false); // Only load when gameData is available
    const [scoreTableError, setScoreTableError] = useState<string | null>(null);
    const [showScoreTable, setShowScoreTable] = useState<boolean>(false); // State to toggle visibility
    // --- END NEW ---

    // State for Start Game action
    const [startError, setStartError] = useState<string | null>(null);
    const [isStartingGame, setIsStartingGame] = useState<boolean>(false);

    // State for Modal
    const [isRoundModalOpen, setIsRoundModalOpen] = useState(false);

    // State for Master Token presence
    const [hasMasterToken, setHasMasterToken] = useState<boolean>(false);

    // --- NEW: State for Delete Confirmation ---
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
    const [roundToDelete, setRoundToDelete] = useState<RoundData | null>(null);
    const [isDeletingRound, setIsDeletingRound] = useState<boolean>(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    // --- END NEW ---

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
            setGameError('No Game ID provided in URL.');
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
                fetch(`http://localhost:3000/games/${gameId}`),
                fetch(`http://localhost:3000/games/${gameId}/rounds`)
            ]);

            // Process Game Response
            if (!gameRes.ok) {
                let errorMsg = `Game Data Error: ${gameRes.status}`;
                try { const d = await gameRes.json(); errorMsg = d.message || JSON.stringify(d); } catch (e) { errorMsg = `${gameRes.status} ${gameRes.statusText}`; }
                throw new Error(errorMsg); // Throw to be caught below
            }
            const gameResult: GameData = await gameRes.json();
            if (typeof gameResult.max_money === 'string') {
                gameResult.max_money = parseFloat(gameResult.max_money);
            }
            if (gameResult.gamePlayers) gameResult.gamePlayers.sort((a, b) => a.player_order - b.player_order);
            setGameData(gameResult);
            console.log("Fetched and set game data:", gameResult);
            setLoadingGame(false);

            // Process Rounds Response
            if (!roundsRes.ok) {
                let errorMsg = `Rounds Data Error: ${roundsRes.status}`;
                try { const d = await roundsRes.json(); errorMsg = d.message || JSON.stringify(d); } catch (e) { errorMsg = `${roundsRes.status} ${roundsRes.statusText}`; }
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
                    const scoreRes = await fetch(`http://localhost:3000/games/score-preview?${queryParams}`);
                    if (!scoreRes.ok) {
                         let errorMsg = `Score Table Error: ${scoreRes.status}`;
                         try { const d = await scoreRes.json(); errorMsg = d.message || JSON.stringify(d); } catch (e) { errorMsg = `${scoreRes.status} ${scoreRes.statusText}`; }
                         throw new Error(errorMsg);
                    }
                    const scoreResult: ScorePreviewItem[] = await scoreRes.json();
                    setScoreTable(scoreResult);
                    console.log("Fetched score table data:", scoreResult);
                } catch (scoreErr: any) {
                     console.error("Error fetching score table:", scoreErr);
                     setScoreTableError(scoreErr.message || 'Failed to load score table.');
                     setScoreTable([]);
                } finally {
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
    }, [gameId]); // Dependency array includes gameId

    // Initial fetch on mount
    useEffect(() => {
        fetchAllGameData();
    }, [fetchAllGameData]); // Use the combined fetch function

    // --- Keep Start Game Handler as is, but it calls fetchAllGameData ---
    const handleStartGame = useCallback(async () => {
        if (!gameId) {
            setStartError("Cannot start game: Game ID missing.");
            return;
        }
        setIsStartingGame(true); setStartError(null);
        try {
            const response = await fetch(`http://localhost:3000/games/${gameId}/start`, { method: 'POST' });
            if (!response.ok) {
                let errorMsg = `Failed to start game: ${response.status}`;
                 try { const errorData = await response.json(); errorMsg = errorData.message || JSON.stringify(errorData); }
                 catch (jsonError) { errorMsg = `${response.status} ${response.statusText}`; }
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
        } catch (err: any) { /* ... error handling ... */ }
        finally { setIsStartingGame(false); }
    }, [gameId, fetchAllGameData]);


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


    // --- NEW: Delete Round Handlers ---
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
            const response = await fetch(`http://localhost:3000/games/${gameId}/rounds/${roundToDelete.round_id}`, {
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
                    try { const errorData = await response.json(); errorMsg = errorData.message || JSON.stringify(errorData); }
                    catch (jsonError) { errorMsg = `${response.status} ${response.statusText}`; }
                    throw new Error(errorMsg);
                }
            }
             console.log(`Round ${roundToDelete.round_number} deleted successfully.`);
             // Refresh data after successful deletion
             await fetchAllGameData(false);

        } catch (err: any) {
            console.error("Failed to delete round:", err);
            setDeleteError(err.message || 'Failed to delete round.');
        } finally {
            setIsDeletingRound(false);
            setIsDeleteDialogOpen(false); // Close dialog regardless of success/fail
            setRoundToDelete(null);
        }
    }, [gameId, roundToDelete, fetchAllGameData]); // Dependencies for the handler


    // --- Render Logic ---
    // Combined initial loading state
    if (loadingGame && !gameData) {
        return ( <Container sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Container> );
    }
    // Fatal error if game data failed to load
    if (gameError && !gameData) {
        return ( <Container maxWidth="sm" sx={{ mt: 4 }}><Alert severity="error">Error: {gameError}</Alert><Button variant="outlined" onClick={() => navigate('/')} sx={{ mt: 2 }} startIcon={<ArrowBackIcon />}>Back to Setup</Button></Container> );
    }
    // Fallback if gameData is somehow null after loading
    if (!gameData) {
         return ( <Container maxWidth="sm" sx={{ mt: 4 }}><Alert severity="info">Game not found or failed to load.</Alert><Button variant="outlined" onClick={() => navigate('/')} sx={{ mt: 2 }} startIcon={<ArrowBackIcon />}>Back to Setup</Button></Container> );
    }

    // Prepare data for display and modal
    const activePlayers = gameData.gamePlayers?.filter(p => p.is_active) || [];
    const scoreLimits = { min: gameData.lower_limit_of_score, max: gameData.upper_limit_of_score };
    const activePlayersForModal: PlayerInfoForModal[] = activePlayers.map(p => ({
         game_player_id: p.game_player_id,
         player_name_in_game: p.player_name_in_game
     }));
    const canAddRound = gameData.game_status === 'active' && hasMasterToken;

    return (
        <>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                 <Button variant="outlined" onClick={() => navigate('/')} sx={{ mb: 2 }} startIcon={<ArrowBackIcon />}>
                     New Game Setup
                 </Button>
                 <Button variant="text" onClick={() => navigate('/score-reference')} sx={{ mb: 2, ml: 1 }}>
                    Score Reference
                </Button>
                <Paper elevation={3} sx={{ p: { xs: 2, md: 3 } }}>
                    {/* Display non-fatal fetch error if occurred during refresh */}
                     {gameError && !loadingGame && <Alert severity="warning" sx={{ mb: 2 }}>Could not refresh game data: {gameError}</Alert>}
                     {/* Display start game error */}
                     {startError && <Alert severity="error" sx={{ mb: 2 }}>{startError}</Alert>}

                     {/* Display delete error */}
                     {deleteError && <Alert severity="error" sx={{ mb: 2 }}>{deleteError}</Alert>}

                    {/* ... Game Title, Rules display ... */}
                     <Divider sx={{ my: 2 }} />
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
                     <Typography variant="h6" component="h2" gutterBottom>Active Players</Typography>
                     {/* ... Player List rendering ... */}
                     {/* *** This is the section that renders the list *** */}
                     {activePlayers.length > 0 ? (
                         <List dense={false}>
                             {activePlayers.map((player) => (
                                <ListItem key={player.game_player_id} divider>
                                    <ListItemAvatar>
                                        {/* Display color avatar */}
                                        <Avatar sx={{ bgcolor: player.player_color_in_game, width: 32, height: 32, border: '1px solid grey' }}> </Avatar>
                                    </ListItemAvatar>
                                    {/* Display name and balance */}
                                    <ListItemText
                                        primary={player.player_name_in_game}
                                        secondary={`Balance: $${parseFloat(player.current_balance as any).toFixed(2)}`} // ParseFloat fix
                                    />
                                </ListItem>
                            ))}
                        </List>
                     ) : (
                         // This message shows if activePlayers array is empty
                         <Typography sx={{ mt: 2 }} color="text.secondary">No active players found.</Typography>
                     )}
                     <Divider sx={{ my: 2 }} />
                     {/* --- Add Round Button (Conditional) --- */}
                     <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                         <Button
                             variant="contained" color="primary" size="large"
                             onClick={handleOpenRoundModal}
                             disabled={loadingGame || isStartingGame || !canAddRound} // Updated disabled logic
                         >
                             Add Round Result
                         </Button>
                    </Box>
                    
                    {/* === NEW: Collapsible Score Table Section === */}
                    <Box sx={{mt: 4}}>
                        <Button
                            onClick={() => setShowScoreTable(!showScoreTable)}
                            endIcon={showScoreTable ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            size="small"
                            sx={{ textTransform: 'none', mb: 1 }}
                        >
                            {showScoreTable ? 'Hide' : 'Show'} Score Table for Current Rules
                        </Button>
                        <Collapse in={showScoreTable} timeout="auto" unmountOnExit>
                            {loadingScoreTable ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress size={24} /></Box>
                            ) : scoreTableError ? (
                                <Alert severity="error" sx={{ mb: 2 }}>{scoreTableError}</Alert>
                            ) : (
                                <TableContainer component={Paper} variant="outlined" sx={{ maxWidth: 300, margin: 'auto' }}>
                                    <Table size="small" aria-label="score reference table">
                                        <TableHead sx={{ backgroundColor: 'action.hover' }}>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Fan</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Money ($)</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {scoreTable.length > 0 ? (
                                                scoreTable.map((item) => (
                                                    <TableRow key={item.score} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                        <TableCell>{item.score}</TableCell>
                                                        <TableCell align="right">${item.money.toFixed(1)}</TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                     <TableCell colSpan={2} align="center">No data.</TableCell>
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
                        <Typography variant="h6" component="h2" gutterBottom>Round History</Typography>
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
                title="Confirm Delete Round"
                message={`Are you sure you want to delete Round #${roundToDelete?.round_number}? This action cannot be undone.`}
                confirmText="Delete"
                isConfirming={isDeletingRound} // Pass loading state for delete confirmation
            />
        </>
    );
};

export default GamePage;
