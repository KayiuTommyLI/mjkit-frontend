import React from 'react';
import { Box, Typography, Button, List } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { NavigateFunction } from 'react-router-dom';
import { GamePlayerData } from '../../../../types';
import { PlayerCard } from './PlayerCard';

// Import the style constant
const outlinedSilverButtonSx = { 
    color: 'silver', 
    borderColor: 'silver', 
    '&:hover': { 
        color: 'white', 
        borderColor: 'white', 
        backgroundColor: 'rgba(255, 255, 255, 0.08)' 
    } 
};

interface ActivePlayerListProps {
    activePlayers: GamePlayerData[];
    gameId: string;
    navigate: NavigateFunction;
    getPlayerStats: (playerId: string) => any;
}

const getPositionText = (index: number, t: any) => {
    const positions = {
        0: t('east', 'East'),
        1: t('south', 'South'),
        2: t('west', 'West'),
        3: t('north', 'North')
    };
    return positions[index as keyof typeof positions] || String(index + 1);
};

export const ActivePlayerList: React.FC<ActivePlayerListProps> = ({
    activePlayers,
    gameId,
    navigate,
    getPlayerStats
}) => {
    const { t } = useTranslation();
    
    return (
        <Box sx={{ 
            flex: '1 1 75%',
            border: '0px',
            borderRadius: 1,
            bgcolor: 'rgba(0, 30, 0, 0.1)'
        }}>
            <Typography variant="h6" component="h2" gutterBottom sx={{ 
                color: 'white', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center'
            }}>
                {t('activePlayersHeader')}
                
                <Button 
                    variant="outlined" 
                    onClick={() => navigate(`/game/${gameId}/players`)} 
                    sx={{
                        ...outlinedSilverButtonSx,
                        fontSize: '0.8rem',
                        py: 0.5
                    }}
                >
                    {t('managePlayersLabel')}
                </Button>
            </Typography>
            
            {activePlayers.length > 0 ? (
                <List dense={false}>
                    {activePlayers.map((player, index) => (
                        <PlayerCard
                            key={player.game_player_id}
                            player={player}
                            position={getPositionText(index, t)}
                            stats={getPlayerStats(player.game_player_id)}
                            type="active"
                        />
                    ))}
                </List>
            ) : (
                <Typography sx={{ p: 2, textAlign: 'center' }} color="text.secondary">
                    {t('noActivePlayers')}
                </Typography>
            )}
        </Box>
    );
};