import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container, Paper, Divider, Alert, Box, CircularProgress, Typography } from '@mui/material';

// Custom Hooks
import { useGameData } from './hooks/useGameData';
import { useRoundsData } from './hooks/useRoundsData';
import { useScoreTable } from './hooks/useScoreTable';
import { useDialogs } from './hooks/useDialogs';
import { usePlayerStats } from './hooks/usePlayerStats';

// Components
import NavigationHeader from './components/NavigationHeader';
import GameHeader from './components/GameHeader';
import { ActivePlayerList } from './components/PlayerSection/ActivePlayerList';
import { InactivePlayerList } from './components/PlayerSection/InactivePlayerList';
import ScoreTableSection from './components/ScoreTableSection';
import GameControls from './components/GameControls';
import BalanceTrendChart from '../../components/BalanceTrendChart';
import GameHistoryTable from '../../components/GameHistoryTable';
import RoundEntryModal from '../../components/RoundEntryModal';
import ConfirmationDialog from '../../components/ConfirmationDialog';

const GamePage: React.FC = () => {
    const { t } = useTranslation();
    const { gameId } = useParams<{ gameId: string }>();
    const navigate = useNavigate();
    
    // Custom hooks for data and functionality
    const {
        gameData,
        loadingGame,
        gameError,
        hasMasterToken,
        isStartingGame,
        startError,
        canAddRound,
        handleStartGame,
        fetchGameData,
    } = useGameData(gameId || '');
    
    const {
        rounds,
        loadingRounds,
        roundsError,
        handleRoundSubmitSuccess,
        isDeletingRound,
        deleteError,
    } = useRoundsData(gameId || '', gameData, fetchGameData);
    
    const {
        scoreTable,
        loadingScoreTable,
        scoreTableError,
        showScoreTable,
        setShowScoreTable
    } = useScoreTable(gameData);
    
    const { getPlayerStats } = usePlayerStats(rounds);
    
    const {
        isRoundModalOpen,
        handleOpenRoundModal,
        handleCloseRoundModal,
        isDeleteDialogOpen,
        roundToDelete,
        handleDeleteRoundRequest,
        handleCloseDeleteDialog,
        handleConfirmDelete,
        isNewGameDialogOpen,
        handleNewGameRequest,
        handleConfirmNewGame,
        handleCloseNewGameDialog
    } = useDialogs(gameId || '', handleRoundSubmitSuccess, canAddRound);
    
    // Extract admin token from URL hash if present
    useEffect(() => {
        if (!gameId) return;
        
        try {
            // With HashRouter, URL format is: baseUrl/#/path?queryParams
            // We need to extract query params from the hash portion
            const hash = window.location.hash;
            
            // Find where the query string starts (after the ?)
            const queryIndex = hash.indexOf('?');
            
            if (queryIndex !== -1) {
                // Extract query string portion
                const queryString = hash.substring(queryIndex + 1);
                const params = new URLSearchParams(queryString);
                const adminToken = params.get('admin');
                
                if (adminToken) {
                    console.log("Found admin token in URL");
                    // Save the token to localStorage
                    localStorage.setItem(`gameMasterToken_${gameId}`, adminToken);
                    
                    // Remove the token from URL for security
                    // Keep just the path part without the query params
                    const pathOnly = hash.substring(0, queryIndex);
                    window.history.replaceState(null, '', pathOnly);
                    
                    // Force refresh of game data to reflect new permissions
                    fetchGameData();
                    
                    // Optional: Show confirmation to the user
                    // For example, set a state that shows a temporary notification
                }
            }
        } catch (error) {
            console.error("Error processing admin token from URL:", error);
        }
    }, [gameId, fetchGameData]);
    
    // Combined loading state
    if (loadingGame && !gameData) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <CircularProgress sx={{ color: 'silver' }} />
            </Container>
        );
    }
    
    // Fatal error handling
    if (gameError && !gameData) {
        return (
            <Container maxWidth="sm" sx={{ mt: 4 }}>
                <Alert severity="error">
                    {`${t('gameError')}: ${gameError}`}
                </Alert>
                <NavigationHeader gameId={gameId || ''} navigate={navigate} />
            </Container>
        );
    }
    
    // Fallback if no game data
    if (!gameData) {
        return (
            <Container maxWidth="sm" sx={{ mt: 4 }}>
                <Alert severity="info">
                    {t('errorGameNotFound')}
                </Alert>
                <NavigationHeader gameId={gameId || ''} navigate={navigate} />
            </Container>
        );
    }
    
    // Prepare data for child components
    const activePlayers = gameData.gamePlayers?.filter(p => p.is_active) || [];
    const inactivePlayers = gameData.gamePlayers?.filter(p => !p.is_active) || [];
    const scoreLimits = { min: gameData.lower_limit_of_score, max: gameData.upper_limit_of_score };
    const activePlayersForModal = activePlayers.map(p => ({
        game_player_id: p.game_player_id,
        player_name_in_game: p.player_name_in_game,
        player_emoji_in_game: p.player_emoji_in_game,
        player_color_in_game: p.player_color_in_game,
        current_balance: p.current_balance
    }));
    
    return (
        <>
            <Container 
                maxWidth="lg" 
                sx={{ 
                    mt: { xs: 1, sm: 2, md: 4 },
                    mb: 4,
                    px: { xs: 1, sm: 2 } // Reduce horizontal padding on mobile
                }}
            >
                <NavigationHeader 
                    gameId={gameId || ''} 
                    navigate={navigate} 
                    onNewGameClick={handleNewGameRequest}
                />
                
                <Paper 
                    elevation={0} 
                    sx={{ 
                        p: { xs: 1.5, sm: 2, md: 3 }, 
                        backgroundColor: 'transparent', 
                        color: 'white',
                        overflow: 'hidden' // Prevent content overflow
                    }}
                >
                    {/* Error alerts */}
                    {gameError && !loadingGame && (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            {t('warningRefreshFailed', { error: gameError })}
                        </Alert>
                    )}
                    {startError && <Alert severity="error" sx={{ mb: 2 }}>{startError}</Alert>}
                    {deleteError && <Alert severity="error" sx={{ mb: 2 }}>{deleteError}</Alert>}

                    {/* Game header */}
                    <GameHeader gameData={gameData} scoreLimits={scoreLimits} />
                    
                    <Divider sx={{ my: 2, borderColor: 'rgba(192, 192, 192, 0.3)' }} />
                    
                    {/* Start game button (if in setup) */}
                    {gameData.game_status === 'setting_up' && (
                        <GameControls
                            type="start"
                            onAction={handleStartGame}
                            isLoading={isStartingGame}
                        />
                    )}
                    
                    {/* Player section */}
                    <Box sx={{ mt: 3 }}>
                        <Box sx={{ 
                            display: 'flex', 
                            flexDirection: { xs: 'column', sm: 'row' },
                            gap: { xs: 1, sm: 2 }
                        }}>
                            <ActivePlayerList 
                                activePlayers={activePlayers}
                                gameId={gameId || ''}
                                navigate={navigate}
                                getPlayerStats={getPlayerStats}
                            />
                            
                            {inactivePlayers.length > 0 && (
                                <InactivePlayerList 
                                    inactivePlayers={inactivePlayers}
                                    getPlayerStats={getPlayerStats}
                                />
                            )}
                        </Box>
                    </Box>
                    
                    <Divider sx={{ my: 2, borderColor: 'rgba(192, 192, 192, 0.3)' }} />
                    
                    {/* Add Round button */}
                    <GameControls
                        type="add-round"
                        onAction={handleOpenRoundModal}
                        isLoading={loadingGame || isStartingGame}
                        isDisabled={!canAddRound}
                        gameId={gameId} // Add this prop
                    />
                    
                    {/* Score table */}
                    <ScoreTableSection
                        showTable={showScoreTable}
                        setShowTable={setShowScoreTable}
                        scoreTable={scoreTable}
                        loading={loadingScoreTable}
                        error={scoreTableError}
                    />
                    
                    {/* Game history table */}
                    <Box sx={{ mt: 4 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <h2 style={{ margin: 0, color: 'white' }}>
                                {t('roundHistoryHeader')}
                            </h2>
                        </Box>
                        
                        <GameHistoryTable
                            rounds={rounds}
                            activePlayers={gameData.gamePlayers}
                            loading={loadingRounds}
                            error={roundsError}
                            onDeleteRequest={handleDeleteRoundRequest}
                            isDeleting={isDeletingRound}
                            gameId={gameId} // Add this prop
                            sx={{
                                '& .MuiTableHead-root': { backgroundColor: 'rgba(0, 0, 0, 0.2)' },
                                '& .MuiTableRow-root': {
                                    '&:nth-of-type(odd)': { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
                                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                                },
                                '& .MuiTableCell-root': { borderColor: 'rgba(192, 192, 192, 0.3)', color: 'white' }
                            }}
                        />
                    </Box>

                    {/* Balance trend chart */}
                    <Box sx={{ mt: 4 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography 
                                variant="h6" 
                                component="h2" 
                                sx={{ 
                                    margin: 0, 
                                    color: 'white',
                                    fontSize: { xs: '1.1rem', sm: '1.25rem' }
                                }}
                            >
                                {t('balanceTrendHeader')}
                            </Typography>
                        </Box>
                        
                        {loadingRounds ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                <CircularProgress size={32} sx={{ color: 'silver' }} />
                            </Box>
                        ) : roundsError ? (
                            <Alert severity="error" sx={{ mb: 2 }}>{roundsError}</Alert>
                        ) : (
                            <BalanceTrendChart 
                                rounds={rounds} 
                                players={gameData.gamePlayers}
                            />
                        )}
                    </Box>
                    
                </Paper>
            </Container>
            
            {/* Modals */}
            {gameData && (
                <RoundEntryModal
                    open={isRoundModalOpen}
                    onClose={handleCloseRoundModal}
                    onSubmitSuccess={handleRoundSubmitSuccess}
                    gameId={gameId || ''}
                    activePlayers={activePlayersForModal}
                    scoreLimits={scoreLimits}
                    scoreTable={scoreTable}
                />
            )}
            
            <ConfirmationDialog
                open={isDeleteDialogOpen}
                onClose={handleCloseDeleteDialog}
                onConfirm={handleConfirmDelete}
                title={t('deleteConfirmTitle', { 
                    roundNumber: roundToDelete?.round_number,
                    score: roundToDelete?.score_value,
                    player: roundToDelete?.winner?.player_name_in_game || 'Unknown',
                    money: roundToDelete?.roundStates?.find(
                        s => s.game_player_id === roundToDelete?.winner_game_player_id
                    )?.balance_change || 0
                })}
                message={t('deleteConfirmMessage')}
                confirmText={t('deleteButtonLabel')}
                isConfirming={isDeletingRound}
            />
            
            <ConfirmationDialog
                open={isNewGameDialogOpen}
                onClose={handleCloseNewGameDialog}
                onConfirm={handleConfirmNewGame}
                title={t('newGameConfirmTitle')}
                message={t('newGameConfirmMessage')}
                confirmText={t('newGameConfirmButton')}
            />
        </>
    );
};

export default GamePage;