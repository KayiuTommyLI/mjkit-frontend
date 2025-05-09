import React, { useMemo, useState, useRef, useEffect } from 'react';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import { useTranslation } from 'react-i18next';

// Define RoundData interface locally
interface RoundData {
    round_number: number;
    roundStates?: {
        game_player_id: string;
        balance_change: number | string;
    }[];
}

// Define GamePlayerData interface locally
interface GamePlayerData {
    game_player_id: string;
    player_name_in_game: string;
    player_emoji_in_game?: string | null;
    player_color_in_game: string;
}

interface BalanceTrendChartProps {
    rounds: RoundData[];
    players: GamePlayerData[];
}

interface ProcessedDataPoint {
    roundNumber: number;
    [playerKey: string]: number | string;
}

const BalanceTrendChart: React.FC<BalanceTrendChartProps> = ({ rounds, players }) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    
    // Reference to chart container for scrolling
    const chartContainerRef = useRef<HTMLDivElement>(null);
    
    // Calculate minimum width based on data points
    const minChartWidth = useMemo(() => {
        // Ensure at least 800px width on mobile or more for many data points
        const pointCount = rounds.length + 1; // +1 for initial point
        return Math.max(200, pointCount * (isMobile ? 100 : 60));
    }, [rounds.length, isMobile]);

    // Process data for chart
    const chartData = useMemo(() => {
        // Map of player ID to accumulated balance
        const playerBalances = new Map<string, number>();
        
        // Initialize with starting balances
        players.forEach(player => {
            playerBalances.set(player.game_player_id, 0);
        });

        // Sort rounds by round number
        const sortedRounds = [...rounds].sort((a, b) => a.round_number - b.round_number);
        
        // Create data points with initial state (round 0)
        const dataPoints: ProcessedDataPoint[] = [{
            roundNumber: 0,
            ...Object.fromEntries([...playerBalances.entries()])
        }];

        // Process each round and accumulate balances
        sortedRounds.forEach(round => {
            const dataPoint: ProcessedDataPoint = {
                roundNumber: round.round_number
            };

            // Copy previous balances
            [...playerBalances.entries()].forEach(([playerId, balance]) => {
                // Find balance change for this player in this round
                const stateForPlayer = round.roundStates?.find(s => s.game_player_id === playerId);
                const balanceChange = stateForPlayer 
                    ? parseFloat(String(stateForPlayer.balance_change)) 
                    : 0;
                
                // Update accumulated balance
                const newBalance = balance + balanceChange;
                playerBalances.set(playerId, newBalance);
                
                // Add to data point
                dataPoint[playerId] = newBalance;
            });

            dataPoints.push(dataPoint);
        });

        return dataPoints;
    }, [rounds, players]);

    // Scroll to the right end of chart when data changes
    useEffect(() => {
        if (chartContainerRef.current && isMobile && rounds.length > 3) {
            // Small delay to ensure rendering is complete
            const timer = setTimeout(() => {
                if (chartContainerRef.current) {
                    chartContainerRef.current.scrollLeft = chartContainerRef.current.scrollWidth;
                }
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [chartData, isMobile, rounds.length]);

    // Nothing to display if no rounds
    if (rounds.length === 0) {
        return (
            <Box sx={{ 
                textAlign: 'center', 
                p: 3, 
                bgcolor: 'rgba(0, 0, 0, 0.2)',
                borderRadius: 1
            }}>
                <Typography variant="body2" color="text.secondary">
                    {t('noRoundsForChart', 'No rounds recorded yet to display chart.')}
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ 
            width: '100%',
            height: isMobile ? 250 : 400, // Reduced height on mobile
            mt: 2,
            bgcolor: 'rgba(0, 0, 0, 0.2)',
            borderRadius: 1,
            p: { xs: 1, sm: 2 }, // Reduce padding on mobile
            overflow: 'hidden',
            display: 'flex', 
            flexDirection: 'column'
        }}>
            {/* Instructions for mobile users */}
            {isMobile && rounds.length > 3 && (
                <Typography
                    variant="caption"
                    color="silver"
                    align="center"
                    sx={{ mb: 1, fontSize: '0.7rem', opacity: 0.8 }}
                >
                    {t('swipeChartInstruction', 'Swipe horizontally to view all rounds')}
                </Typography>
            )}
            
            {/* Scrollable container */}
            <Box 
                ref={chartContainerRef}
                sx={{ 
                    width: '100%', 
                    height: '100%',
                    overflowX: 'auto',
                    overflowY: 'hidden',
                    // Hide scrollbar for cleaner look but maintain functionality
                    '&::-webkit-scrollbar': {
                        height: '6px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '3px',
                    }
                }}
            >
                {/* Fixed width container based on data points */}
                <Box sx={{ 
                    // width: isMobile ? `${minChartWidth}px` : '100%',
                    width: '100%',
                    height: '100%',
                }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={chartData}
                            margin={{
                                top: 5,
                                right: 30,
                                left: isMobile ? 0 : 20,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis 
                                dataKey="roundNumber" 
                                stroke="silver"
                                // Adjust label for mobile
                                label={isMobile ? undefined : {
                                    value: t('roundNumber'),
                                    position: 'insideBottomRight',
                                    offset: -5,
                                    fill: 'silver'
                                }}
                                tick={{ fontSize: isMobile ? 10 : 12 }}
                            />
                            <YAxis 
                                stroke="silver"
                                // Adjust label for mobile
                                label={isMobile ? undefined : {
                                    value: t('balanceLabel') + " ($)",
                                    angle: -90,
                                    position: 'insideLeft',
                                    fill: 'silver'
                                }}
                                tick={{ fontSize: isMobile ? 10 : 12 }}
                                width={isMobile ? 30 : 60}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'rgba(0, 0, 0, 0.85)', 
                                    border: '1px solid silver',
                                    borderRadius: '4px',
                                    color: 'white',
                                    fontSize: isMobile ? '12px' : '14px',
                                }}
                                formatter={(value, name) => {
                                    // Find player name by ID
                                    const player = players.find(p => p.game_player_id === name);
                                    const playerName = player ? player.player_name_in_game : name;
                                    return [`$${value}`, playerName];
                                }}
                                labelFormatter={(label) => `${t('roundInBalanceTrend', { round: label })} `}
                            />
                            <Legend 
                                content={(props) => {
                                    const { payload } = props;
                                    return (
                                        <div style={{ 
                                            textAlign: 'center', 
                                            padding: '10px 0', 
                                            color: 'silver',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            gap: isMobile ? '8px' : '15px',
                                            flexWrap: 'wrap',
                                            fontSize: isMobile ? '11px' : '14px',
                                        }}>
                                            {payload?.map((entry, index) => {
                                                const player = players.find(p => p.game_player_id === entry.value);
                                                if (!player) return null;
                                                
                                                return (
                                                    <span 
                                                        key={`legend-item-${index}`}
                                                        style={{ 
                                                            display: 'inline-flex', 
                                                            alignItems: 'center', 
                                                            marginRight: isMobile ? '5px' : '10px',
                                                            color: entry.color
                                                        }}
                                                    >
                                                        <span 
                                                            style={{ 
                                                                marginRight: '4px', 
                                                                fontSize: isMobile ? '14px' : '16px'
                                                            }}
                                                        >
                                                            {player.player_emoji_in_game || ''}
                                                        </span>
                                                        <span>{
                                                            isMobile && player.player_name_in_game.length > 6 
                                                                ? `${player.player_name_in_game.substring(0, 5)}…` 
                                                                : player.player_name_in_game
                                                        }</span>
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    );
                                }}
                            />
                            {players.map(player => (
                                <Line
                                    key={player.game_player_id}
                                    type="monotone"
                                    dataKey={player.game_player_id}
                                    name={player.game_player_id}
                                    stroke={player.player_color_in_game}
                                    activeDot={{ r: isMobile ? 6 : 8 }}
                                    strokeWidth={isMobile ? 1.5 : 2}
                                    dot={{ fill: player.player_color_in_game, r: isMobile ? 3 : 4 }}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </Box>
            </Box>
        </Box>
    );
};

export default BalanceTrendChart;