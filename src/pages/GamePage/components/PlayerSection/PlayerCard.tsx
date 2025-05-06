import React from 'react';
import { ListItem, ListItemAvatar, Avatar, ListItemText, Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { GamePlayerData } from '../../../../types';

interface PlayerCardProps {
    player: GamePlayerData;
    stats: any;
    position?: string;
    type: 'active' | 'inactive';
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, stats, position, type }) => {
    const { t } = useTranslation();
    const isActive = type === 'active';
    
    const renderStats = () => {
        if (isActive) {
            return (
                <Box sx={{ mt: 0.5, display: 'flex', gap: 2, fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                    {/* Win statistics */}
                    <Box>
                        <Box component="span" sx={{ 
                            display: 'inline-flex',
                            alignItems: 'center',
                            color: '#90EE90', 
                            mr: 0.5
                        }}>
                            <span role="img" aria-label="Wins">🏆</span>
                            <Typography variant="caption" sx={{ ml: 0.3 }}>
                                {stats.wins.total}
                            </Typography>
                        </Box>
                        
                        {stats.wins.total > 0 && (
                            <Typography variant="caption" component="span">
                                {stats.wins.direct > 0 && 
                                    `${t('directWin')}: ${stats.wins.direct} `}
                                {stats.wins.self_draw > 0 && 
                                    `${t('selfDraw')}: ${stats.wins.self_draw} `}
                                {stats.wins.one_pay > 0 && 
                                    `${t('paoWin')}: ${stats.wins.one_pay}`}
                            </Typography>
                        )}
                    </Box>
                    
                    {/* Loss statistics */}
                    <Box>
                        <Box component="span" sx={{ 
                            display: 'inline-flex',
                            alignItems: 'center',
                            color: '#FFA07A', 
                            mr: 0.5
                        }}>
                            <span role="img" aria-label="Losses">❌</span>
                            <Typography variant="caption" sx={{ ml: 0.3 }}>
                                {stats.losses.total}
                            </Typography>
                        </Box>
                        
                        {stats.losses.total > 0 && (
                            <Typography variant="caption" component="span">
                                {stats.losses.direct > 0 && 
                                    `${t('directLoss')}: ${stats.losses.direct} `}
                                {stats.losses.one_pay > 0 && 
                                    `${t('paoLoss')}: ${stats.losses.one_pay}`}
                            </Typography>
                        )}
                    </Box>
                </Box>
            );
        }
        
        // Compact stats for inactive players
        return (
            <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                <Box component="span" sx={{ color: '#90EE90', mr: 0.5 }}>
                    W:{stats.wins.total}
                </Box>
                <Box component="span" sx={{ color: '#FFA07A' }}>
                    L:{stats.losses.total}
                </Box>
            </Typography>
        );
    };
    
    return (
        <ListItem
            divider
            sx={{ 
                borderBottomColor: 'rgba(192, 192, 192, 0.2)',
                py: isActive ? 2 : 0.5,
                px: isActive ? 3 : 0.5,
                position: 'relative',
                opacity: isActive ? 1 : 0.7,
                borderBottom: isActive ? undefined : '1px solid rgba(255, 255, 255, 0.03)'
            }}
        >
            {isActive && position && (
                <Box sx={{
                    position: 'absolute',
                    left: '0px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 'auto',
                    minWidth: '45px',
                    height: '24px',
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '20px',
                    color: '#fff',
                    ml: -1
                }}>
                    {position}
                </Box>
            )}
            
            <ListItemAvatar sx={{ minWidth: isActive ? undefined : '30px', ml: isActive ? 5 : 0 }}>
                <Avatar sx={{ 
                    bgcolor: player.player_color_in_game, 
                    width: isActive ? 40 : 24, 
                    height: isActive ? 40 : 24,
                    border: isActive ? '1px solid silver' : undefined,
                    fontSize: isActive ? '1.5rem' : '0.875rem'
                }}>
                    {player.player_emoji_in_game || ''}
                </Avatar>
            </ListItemAvatar>
            
            <ListItemText
                primary={
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography 
                            variant={isActive ? "subtitle1" : "caption"}
                            noWrap={!isActive}
                            sx={{ 
                                color: isActive ? 'white' : 'rgba(255, 255, 255, 0.7)',
                                display: 'block'
                            }}
                        >
                            {player.player_name_in_game}
                        </Typography>
                        
                        {renderStats()}
                    </Box>
                }
                disableTypography
                secondary={
                    <Box sx={{ mt: isActive ? 1 : 0 }}>
                        <Typography 
                            variant={isActive ? "h5" : "caption"}
                            sx={{ 
                                color: parseFloat(String(player.current_balance)) >= 0 
                                    ? (isActive ? '#90EE90' : 'rgba(144, 238, 144, 0.8)')
                                    : (isActive ? '#FFA07A' : 'rgba(255, 160, 122, 0.8)'),
                                fontWeight: 'bold',
                                fontSize: isActive ? undefined : '1.3rem'
                            }}
                        >
                            ${parseFloat(player.current_balance as any).toFixed(2)}
                        </Typography>
                    </Box>
                }
                primaryTypographyProps={{ margin: 0 }}
                sx={{ my: 0 }}
            />
        </ListItem>
    );
};