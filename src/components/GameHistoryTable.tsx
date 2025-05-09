// src/components/GameHistoryTable.tsx
import React from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Box, IconButton, CircularProgress, Typography, Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next'; // Import translation hook
import { RoundData } from 'src/types';

interface GameHistoryTableProps {
    rounds: RoundData[];
    activePlayers: any[];
    loading: boolean;
    error: string | null;
    onDeleteRequest: (round: RoundData) => void;
    isDeleting: boolean;
    sx?: any;
    gameId?: string; // Add this prop
}

const GameHistoryTable: React.FC<GameHistoryTableProps> = ({
    rounds,
    activePlayers,
    loading,
    error,
    onDeleteRequest,
    isDeleting,
    sx = {},
    gameId = '', // Add this parameter
}) => {
    const { t } = useTranslation(); // Add translation hook
    
    // Create map of player IDs to player details for quick lookup
    const playerMap = React.useMemo(() => {
        const map = new Map();
        activePlayers.forEach(player => {
            map.set(player.game_player_id, player);
        });
        return map;
    }, [activePlayers]);

    // Sort rounds by round number in descending order (newest first)
    const sortedRounds = React.useMemo(() => {
        return [...rounds].sort((a, b) => b.round_number - a.round_number);
    }, [rounds]);

    // Get all unique player IDs from all rounds
    const allPlayerIds = React.useMemo(() => {
        const playerIds = new Set<string>();
        
        // Add all active players first to ensure they're included
        activePlayers.forEach(player => {
            playerIds.add(player.game_player_id);
        });
        
        // Then add any other players from round states
        rounds.forEach(round => {
            round.roundStates?.forEach(state => {
                playerIds.add(state.game_player_id);
            });
        });
        
        return Array.from(playerIds);
    }, [rounds, activePlayers]);

    // Function to get player column value
    const getPlayerValue = (round: RoundData, playerId: string) => {
        const state = round.roundStates?.find(s => s.game_player_id === playerId);
        if (!state) return null;
        
        const value = parseFloat(String(state.balance_change));
        return {
            value,
            formattedValue: value === 0 ? '0.0' : value.toFixed(1),
            positive: value > 0
        };
    };

    // Common text styles for larger fonts
    const cellTextStyle = {
        fontSize: '1rem', // Larger base font size
    };
    
    const headerTextStyle = {
        ...cellTextStyle,
        fontSize: '1.1rem', // Even larger header font
        fontWeight: 'bold'
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={32} sx={{ color: 'silver' }} />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error" sx={{ mb: 2, fontSize: '1rem' }}>{error}</Alert>;
    }

    if (sortedRounds.length === 0) {
        return (
            <Paper elevation={0} sx={{ p: 2, backgroundColor: 'rgba(0,0,0,0.2)', color: 'silver', textAlign: 'center' }}>
                <Typography variant="body1" sx={{ fontSize: '1rem' }}>
                    {t('noRoundsRecorded', 'No rounds recorded yet.')}
                </Typography>
            </Paper>
        );
    }

    // Add this check for master token
    const hasMasterToken = gameId ? !!localStorage.getItem(`gameMasterToken_${gameId}`) : false;

    return (
        // Add this responsive styling to make the table work on small screens
        <TableContainer 
            component={Paper} 
            sx={{
                backgroundColor: 'transparent',
                overflowX: 'auto', // Allow horizontal scrolling
                '&::-webkit-scrollbar': {
                    height: '4px'
                },
                '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '2px'
                },
                // Minimum width ensures columns don't compress too much
                '& .MuiTable-root': {
                    minWidth: '500px'
                },
                ...sx 
            }}
        >
            <Table size="medium" aria-label="round history table"> {/* Changed from small to medium */}
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ color: 'white', ...headerTextStyle, width: '40px' }}>
                            {t('roundNumber')}
                        </TableCell>
                        {/* <TableCell sx={{ color: 'white', ...headerTextStyle, minWidth: '180px' }}>
                            {t('details')}
                        </TableCell> */}
                        <TableCell sx={{ color: 'white', ...headerTextStyle, width: '80px', textAlign: 'center' }}>
                            {t('Faan')}
                        </TableCell>
                        
                        {/* Player columns with their colors */}
                        {allPlayerIds.map(playerId => {
                            const player = playerMap.get(playerId);
                            return (
                                <TableCell 
                                    key={playerId}
                                    align="center"
                                    sx={{ 
                                        color: 'white',
                                        ...headerTextStyle,
                                        width: '70px',
                                        backgroundColor: player?.player_color_in_game || 'transparent',
                                        opacity: 0.9,
                                        border: '1px solid rgba(192, 192, 192, 0.3)',
                                        fontSize: '2rem',
                                    }}
                                >
                                    {player?.player_emoji_in_game || ''}
                                </TableCell>
                            );
                        })}
                        
                        <TableCell sx={{ color: 'white', ...headerTextStyle, width: '70px', textAlign: 'center' }}>
                            
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {sortedRounds.map((round) => (
                        <TableRow 
                            key={round.round_id}
                            sx={{ 
                                '&:nth-of-type(odd)': { backgroundColor: 'rgba(0, 0, 0, 0.1)' },
                                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
                                height: '56px', // Increased row height
                            }}
                        >
                            <TableCell sx={{ color: 'silver', ...cellTextStyle }}>
                                {round.round_number}
                            </TableCell>
                            {/* <TableCell sx={{ color: 'silver', ...cellTextStyle }}>
                                {round.winner ? (
                                    <>
                                        {t('playerWinsScoreFans', {
                                            player: playerMap.get(round.winner_game_player_id)?.player_name_in_game || t('player', 'Player'),
                                            score: round.score_value,
                                            fans: round.score_value > 1 ? t('fans', 'fans') : t('fan', 'fan')
                                        })}
                                        {round.loser_game_player_id && t('offPlayer', {
                                            player: playerMap.get(round.loser_game_player_id)?.player_name_in_game || t('player', 'Player')
                                        })}
                                        {round.win_type === 'self_draw' && t('selfDraw', ' (self-draw)')}
                                        {round.win_type === 'pao' && t('pao', ' (pao)')}
                                    </>
                                ) : t('noWinnerDetails', 'No winner details')}
                            </TableCell> */}
                            <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold', ...cellTextStyle }}>
                                {round.score_value}
                            </TableCell>
                            
                            {/* Player balance changes with colored values */}
                            {allPlayerIds.map(playerId => {
                                const playerValue = getPlayerValue(round, playerId);
                                return (
                                    <TableCell 
                                        key={playerId} 
                                        align="center"
                                        sx={{ 
                                            ...cellTextStyle,
                                            color: playerValue?.value === 0 
                                                ? 'silver !important' 
                                                : playerValue?.positive 
                                                    ? '#90EE90 !important' // Green for positive
                                                    : '#FFA07A !important', // Red for negative 
                                            fontWeight: 'bold',
                                            fontSize: '1.1rem', // Make balance changes slightly larger
                                            '&&': { // Double ampersand increases specificity
                                                color: playerValue?.value === 0 
                                                    ? 'silver' 
                                                    : playerValue?.positive 
                                                        ? '#90EE90' 
                                                        : '#FFA07A',
                                            }
                                        }}
                                    >
                                        {playerValue !== null ? 
                                            (playerValue.value > 0 ? `+${playerValue.formattedValue}` : playerValue.formattedValue) 
                                            : '0.0'}
                                    </TableCell>
                                );
                            })}
                            
                            {/* Delete action button */}
                            <TableCell sx={{ width: '60px', textAlign: 'center', ...cellTextStyle }}>
                                {hasMasterToken && (
                                    <IconButton
                                        onClick={() => onDeleteRequest(round)}
                                        disabled={isDeleting}
                                        sx={{ color: 'rgba(220, 53, 69, 0.7)', '&:hover': { color: '#dc3545' } }}
                                        title={t('deleteRound', 'Delete round')}
                                    >
                                        <DeleteIcon fontSize="medium" />
                                    </IconButton>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default GameHistoryTable;
