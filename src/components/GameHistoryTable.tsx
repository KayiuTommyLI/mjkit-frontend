// src/components/GameHistoryTable.tsx
import React, { useState } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Box, IconButton, CircularProgress, Typography, Alert,
    ToggleButtonGroup, ToggleButton, Tooltip, useTheme, useMediaQuery
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ViewListIcon from '@mui/icons-material/ViewList';
import TableRowsIcon from '@mui/icons-material/TableRows';
import { useTranslation } from 'react-i18next';
import { RoundData } from 'src/types';

interface GameHistoryTableProps {
    rounds: RoundData[];
    activePlayers: any[];
    loading: boolean;
    error: string | null;
    onDeleteRequest: (round: RoundData) => void;
    isDeleting: boolean;
    sx?: any;
    gameId?: string;
}

const GameHistoryTable: React.FC<GameHistoryTableProps> = ({
    rounds,
    activePlayers,
    loading,
    error,
    onDeleteRequest,
    isDeleting,
    sx = {},
    gameId = '',
}) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [viewMode, setViewMode] = useState<'standard' | 'rotated'>('rotated');
    const [expandedPlayerId, setExpandedPlayerId] = useState<string | null>(null);
    
    const playerMap = React.useMemo(() => {
        const map = new Map();
        activePlayers.forEach(player => {
            map.set(player.game_player_id, player);
        });
        return map;
    }, [activePlayers]);

    const sortedRounds = React.useMemo(() => {
        return [...rounds].sort((a, b) => b.round_number - a.round_number);
    }, [rounds]);

    const allPlayerIds = React.useMemo(() => {
        const playerIds = new Set<string>();
        
        activePlayers.forEach(player => {
            playerIds.add(player.game_player_id);
        });
        
        rounds.forEach(round => {
            round.roundStates?.forEach(state => {
                playerIds.add(state.game_player_id);
            });
        });
        
        return Array.from(playerIds);
    }, [rounds, activePlayers]);

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

    const cellTextStyle = {
        fontSize: '1rem',
    };
    
    const headerTextStyle = {
        ...cellTextStyle,
        fontSize: '1.1rem',
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

    const hasMasterToken = gameId ? !!localStorage.getItem(`gameMasterToken_${gameId}`) : false;

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                <Tooltip title={t('toggleTableView', 'Toggle Table View')}>
                    <ToggleButtonGroup
                        value={viewMode}
                        exclusive
                        onChange={(_, newMode) => newMode && setViewMode(newMode)}
                        size="small"
                        sx={{
                            '& .MuiToggleButton-root': {
                                color: 'silver', // Make the icons silver
                                borderColor: 'rgba(192, 192, 192, 0.5)'
                            },
                            '& .MuiToggleButton-root.Mui-selected': {
                                color: 'white',  // Selected icon will be white
                                backgroundColor: 'rgba(255, 255, 255, 0.15)'
                            }
                        }}
                    >
                        <ToggleButton value="standard">
                            <ViewListIcon fontSize="small" />
                        </ToggleButton>
                        <ToggleButton value="rotated">
                            <TableRowsIcon fontSize="small" />
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Tooltip>
            </Box>
            
            <TableContainer 
                component={Paper} 
                sx={{
                    backgroundColor: 'transparent',
                    overflowX: 'auto',
                    '&::-webkit-scrollbar': {
                        height: '4px'
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '2px'
                    },
                    '& .MuiTable-root': {
                        minWidth: viewMode === 'standard' ? '500px' : '300px'
                    },
                    ...sx
                }}
            >
                {viewMode === 'standard' ? (
                    <Table size="medium" aria-label="round history table">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ color: 'white', ...headerTextStyle, width: '40px' }}>
                                    {t('roundNumber')}
                                </TableCell>
                                <TableCell sx={{ color: 'white', ...headerTextStyle, width: '80px', textAlign: 'center' }}>
                                    {t('Faan')}
                                </TableCell>
                                
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
                                        height: '56px',
                                    }}
                                >
                                    <TableCell sx={{ color: 'silver', ...cellTextStyle }}>
                                        {round.round_number}
                                    </TableCell>
                                    <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold', ...cellTextStyle }}>
                                        {round.score_value}
                                    </TableCell>
                                    
                                    {allPlayerIds.map(playerId => {
                                        const playerValue = getPlayerValue(round, playerId);
                                        return (
                                            <TableCell 
                                                key={playerId} 
                                                align="center"
                                                sx={{ 
                                                    ...cellTextStyle,
                                                    color: playerValue?.value === 0 
                                                        ? 'white !important'  // Changed from silver to white
                                                        : playerValue?.positive 
                                                            ? '#52C41A !important'  // Brighter green
                                                            : '#FF4D4F !important',  // Brighter red
                                                    fontWeight: 'bold',
                                                    fontSize: '1.1rem',
                                                    '&&': {
                                                        color: playerValue?.value === 0 
                                                            ? 'white'  // Changed from silver to white
                                                            : playerValue?.positive 
                                                                ? '#52C41A'  // Brighter green
                                                                : '#FF4D4F',  // Brighter red
                                                    }
                                                }}
                                            >
                                                {playerValue !== null ? 
                                                    (playerValue.value > 0 ? `+${playerValue.formattedValue}` : playerValue.formattedValue) 
                                                    : '0.0'}
                                            </TableCell>
                                        );
                                    })}
                                    
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
                ) : (
                    <Table size="medium" aria-label="round history table rotated">
                        <TableHead>
                            <TableRow>
                                <TableCell 
                                    sx={{ 
                                        color: 'white', 
                                        ...headerTextStyle, 
                                        width: '100px',
                                        padding: '8px 16px'
                                    }}
                                >
                                    {t('player', 'Player')}
                                </TableCell>
                                
                                {sortedRounds.map((round) => (
                                    <TableCell 
                                        key={round.round_id}
                                        align="center"
                                        sx={{ 
                                            color: 'white',
                                            ...headerTextStyle,
                                            minWidth: '65px',
                                            backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                            borderBottom: '2px solid rgba(255,255,255,0.1)',
                                            position: 'relative',
                                            paddingBottom: hasMasterToken ? '24px' : '16px' // Add extra padding for delete button
                                        }}
                                    >
                                        <Box>
                                            <Typography component="div" variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                                                #{round.round_number}
                                            </Typography>
                                            <Typography component="div" variant="body2" sx={{ fontSize: '0.8rem', opacity: 0.8 }}>
                                                {round.score_value} {t('Faan')}
                                            </Typography>
                                            
                                            {/* Delete button for each round */}
                                            {hasMasterToken && (
                                                <IconButton
                                                    size="small"
                                                    onClick={() => onDeleteRequest(round)}
                                                    disabled={isDeleting}
                                                    sx={{ 
                                                        color: 'rgba(220, 53, 69, 0.7)',
                                                        '&:hover': { color: '#dc3545' },
                                                        position: 'absolute',
                                                        bottom: '2px',
                                                        left: '50%',
                                                        transform: 'translateX(-50%) scale(0.8)',
                                                        padding: '2px'
                                                    }}
                                                    title={t('deleteRound', 'Delete round')}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            )}
                                        </Box>
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {allPlayerIds.map(playerId => {
                                const player = playerMap.get(playerId);
                                return (
                                    <TableRow 
                                        key={playerId}
                                        sx={{ 
                                            '&:nth-of-type(odd)': { backgroundColor: 'rgba(0, 0, 0, 0.1)' },
                                            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
                                            height: '60px',
                                        }}
                                    >
                                        <TableCell 
                                            sx={{ 
                                                padding: '8px',
                                                backgroundColor: 'transparent', // Change from player color to transparent
                                                borderLeft: `2px solid ${player?.player_color_in_game || 'transparent'}`, // Add colored border as indicator
                                                position: 'sticky',
                                                left: 0,
                                                zIndex: 2
                                            }}
                                        >
                                            <Box sx={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: 1 
                                            }}>
                                                {/* Emoji with colored circular background - make clickable */}
                                                <Tooltip title={player?.player_name_in_game} placement="top">
                                                    <Box 
                                                        sx={{ 
                                                            width: 32, 
                                                            height: 32, 
                                                            borderRadius: '50%', 
                                                            backgroundColor: player?.player_color_in_game,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            border: '1px solid rgba(255,255,255,0.2)',
                                                            cursor: 'pointer',
                                                            transition: 'transform 0.2s',
                                                            '&:hover': {
                                                                transform: 'scale(1.1)',
                                                            }
                                                        }}
                                                        onClick={() => setExpandedPlayerId(expandedPlayerId === playerId ? null : playerId)}
                                                    >
                                                        <Typography 
                                                            sx={{ 
                                                                fontSize: '1.2rem',
                                                                lineHeight: 1
                                                            }}
                                                        >
                                                            {player?.player_emoji_in_game}
                                                        </Typography>
                                                    </Box>
                                                </Tooltip>
                                                
                                                {/* Player name only shows when clicked */}
                                                {expandedPlayerId === playerId && (
                                                    <Typography 
                                                        sx={{ 
                                                            color: 'white',
                                                            fontSize: '0.9rem',
                                                            fontWeight: 'bold',
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            maxWidth: '80px',
                                                            animation: 'fadeIn 0.3s',
                                                            '@keyframes fadeIn': {
                                                                '0%': { opacity: 0, transform: 'translateX(-5px)' },
                                                                '100%': { opacity: 1, transform: 'translateX(0)' }
                                                            }
                                                        }}
                                                    >
                                                        {player?.player_name_in_game}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </TableCell>
                                        
                                        {sortedRounds.map(round => {
                                            const playerValue = getPlayerValue(round, playerId);
                                            return (
                                                <TableCell 
                                                    key={`${round.round_id}-${playerId}`}
                                                    align="center"
                                                    sx={{ 
                                                        ...cellTextStyle,
                                                        color: playerValue?.value === 0 
                                                            ? 'white !important'  // Changed from silver to white
                                                            : playerValue?.positive 
                                                                ? '#52C41A !important'  // Brighter green
                                                                : '#FF4D4F !important',  // Brighter red
                                                        fontWeight: 'bold',
                                                        fontSize: '1rem',
                                                        backgroundColor: playerValue?.value !== 0 
                                                            ? `rgba(${playerValue?.positive ? '0, 255, 0' : '255, 0, 0'}, 0.05)`
                                                            : 'transparent',
                                                        '&&': {
                                                            color: playerValue?.value === 0 
                                                                ? 'white'  // Changed from silver to white
                                                                : playerValue?.positive 
                                                                    ? '#52C41A'  // Brighter green
                                                                    : '#FF4D4F',  // Brighter red
                                                        }
                                                    }}
                                                    
                                                >
                                                    {playerValue !== null ? 
                                                        (playerValue.value > 0 ? `+${playerValue.formattedValue}` : playerValue.formattedValue) 
                                                        : '0.0'}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}
            </TableContainer>
        </>
    );
};

export default GameHistoryTable;
