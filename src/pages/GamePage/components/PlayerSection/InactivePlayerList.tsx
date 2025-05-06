import React from 'react';
import { Box, Typography, List } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { GamePlayerData } from '../../../../types';
import { PlayerCard } from './PlayerCard';

interface InactivePlayerListProps {
    inactivePlayers: GamePlayerData[];
    getPlayerStats: (playerId: string) => any;
}

export const InactivePlayerList: React.FC<InactivePlayerListProps> = ({
    inactivePlayers,
    getPlayerStats
}) => {
    const { t } = useTranslation();
    
    if (inactivePlayers.length === 0) return null;
    
    return (
        <Box sx={{ 
            flex: '0 0 25%', 
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: 1,
            bgcolor: 'rgba(30, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <Typography 
                variant="subtitle2" 
                sx={{ 
                    color: 'rgba(255, 255, 255, 0.7)', 
                    p: 0.5, 
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    fontSize: '0.75rem',
                    textAlign: 'center'
                }}
            >
                {t('inactivePlayersHeader')}
            </Typography>
            
            <List dense={true} sx={{ pt: 0, px: 0.5 }}>
                {inactivePlayers.map(player => (
                    <PlayerCard
                        key={player.game_player_id}
                        player={player}
                        stats={getPlayerStats(player.game_player_id)}
                        type="inactive"
                    />
                ))}
            </List>
        </Box>
    );
};