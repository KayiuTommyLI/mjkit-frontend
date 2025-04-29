// src/components/GameHistoryTable.tsx
import React from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box, CircularProgress, Alert, Tooltip
} from '@mui/material';
// Import interfaces from GamePage or a shared types file
import { GamePlayerData, RoundData, RoundStateData } from '../pages/GamePage';
// Optionally import icons if adding delete buttons later
// import IconButton from '@mui/material/IconButton';
// import DeleteIcon from '@mui/icons-material/Delete';

interface GameHistoryTableProps {
    rounds: RoundData[];
    activePlayers: GamePlayerData[]; // Need full player data for headers/colors
    loading: boolean;
    error: string | null;
    // Add onDeleteRound prop later: onDeleteRound?: (roundId: string) => void;
}

// Helper function to format balance changes with color styling
const formatBalanceChange = (change: number | string | undefined): React.ReactNode => {
    if (change === undefined || change === null) return '-';
    const numChange = typeof change === 'string' ? parseFloat(change) : change;
    if (isNaN(numChange)) return '-';

    const formatted = `${numChange > 0 ? '+' : ''}${numChange.toFixed(1)}`;
    const color = numChange > 0 ? 'success.main' : (numChange < 0 ? 'error.main' : 'text.secondary');
    const fontWeight = numChange !== 0 ? 'bold' : 'normal';

    return <Typography variant="body2" component="span" sx={{ color, fontWeight }}>{formatted}</Typography>;
};

// Helper function to get player name (handles potential missing relations)
const getPlayerName = (playerId: string | null | undefined, players: GamePlayerData[]): string => {
    if (!playerId) return '-';
    const player = players.find(p => p.game_player_id === playerId);
    return player ? player.player_name_in_game : 'Unknown Player';
};

// Helper to display Win Type info
const getWinTypeDisplay = (round: RoundData, players: GamePlayerData[]): string => {
    const winnerName = round.winner?.player_name_in_game || getPlayerName(round.winner_game_player_id, players);
    switch (round.win_type) {
        case 'NORMAL':
            const loserName = round.loser?.player_name_in_game || getPlayerName(round.loser_game_player_id, players);
            return `${winnerName} wins off ${loserName}`;
        case 'SELF_DRAW_ALL_PAY':
            return `${winnerName} self-draw (All Pay)`;
        case 'SELF_DRAW_ONE_PAY':
             const specificLoserName = round.loser?.player_name_in_game || getPlayerName(round.loser_game_player_id, players);
             return `${winnerName} self-draw off ${specificLoserName}`;
        default:
            return round.win_type; // Fallback
    }
};


const GameHistoryTable: React.FC<GameHistoryTableProps> = ({
    rounds = [],
    activePlayers = [],
    loading,
    error
    // onDeleteRound, // Add later
}) => {

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress size={30} /></Box>;
    }

    if (error) {
        return <Alert severity="warning" sx={{ mt: 2 }}>Could not load rounds: {error}</Alert>;
    }

    if (rounds.length === 0) {
        return <Typography sx={{ mt: 2, p: 2, fontStyle: 'italic', textAlign: 'center' }} color="text.secondary">No rounds recorded yet.</Typography>;
    }

    // Create a map for quick lookup of round state by player ID within a round
    const getRoundStateMap = (roundStates: RoundStateData[]): Map<string, RoundStateData> => {
        return new Map(roundStates.map(state => [state.game_player_id, state]));
    };

    return (
        <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
            <Table size="small" aria-label="game history table">
                <TableHead sx={{ backgroundColor: 'action.hover' }}>
                    <TableRow>
                        <TableCell align="center" sx={{ fontWeight: 'bold', width: '5%' }}>#</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', width: '35%' }}>Details</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold', width: '10%' }}>Score</TableCell>
                        {/* Generate header cells for each active player */}
                        {activePlayers.map(player => (
                             <Tooltip title={player.player_name_in_game} key={player.game_player_id}>
                                <TableCell
                                    align="right"
                                    sx={{
                                        fontWeight: 'bold',
                                        borderLeft: '1px solid rgba(224, 224, 224, 1)', // Add vertical lines
                                        // Apply color border to header
                                        borderBottom: `3px solid ${player.player_color_in_game}`,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        maxWidth: '100px', // Adjust max width as needed
                                        px: 1, // Padding
                                    }}
                                >
                                    {/* Show only first part of name if too long */}
                                    {player.player_name_in_game.split(' ')[0]}
                                </TableCell>
                            </Tooltip>
                        ))}
                        {/* Add Action column later for delete */}
                        {/* <TableCell align="center" sx={{ fontWeight: 'bold', width: '5%' }}>Act</TableCell> */}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {/* Display rounds in reverse order (most recent last) */}
                    {rounds.slice().reverse().map((round) => {
                        const roundStateMap = getRoundStateMap(round.roundStates || []);
                        const winTypeDisplay = getWinTypeDisplay(round, activePlayers);

                        return (
                            <TableRow
                                key={round.round_id}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                hover
                            >
                                <TableCell align="center" component="th" scope="row">{round.round_number}</TableCell>
                                <TableCell>{winTypeDisplay}</TableCell>
                                <TableCell align="center">{round.score_value}</TableCell>
                                {/* Generate data cells for each active player */}
                                {activePlayers.map(player => {
                                    const state = roundStateMap.get(player.game_player_id);
                                    const balanceChange = state?.balance_change;
                                    return (
                                        <TableCell key={`${round.round_id}-${player.game_player_id}`} align="right" sx={{ borderLeft: '1px solid rgba(224, 224, 224, 1)', px: 1 }}>
                                            {formatBalanceChange(balanceChange)}
                                        </TableCell>
                                    );
                                })}
                                {/* Add Delete button cell later */}
                                {/* <TableCell align="center"> <IconButton size="small" color="error" onClick={() => onDeleteRound?.(round.round_id)}><DeleteIcon fontSize="small" /></IconButton> </TableCell> */}
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default GameHistoryTable;
