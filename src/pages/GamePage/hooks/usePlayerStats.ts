import { useCallback } from 'react';
import { RoundData } from '../../../types';
import { WinType } from '../../../components/RoundEntryModal';

export const usePlayerStats = (rounds: RoundData[]) => {
    const getPlayerStats = useCallback((playerId: string) => {
        const stats = {
            wins: { total: 0, self_draw: 0, direct: 0, one_pay: 0 },
            losses: { total: 0, direct: 0, one_pay: 0, self_draw: 0 }
        };
        
        if (!rounds.length) return stats;
        
        rounds.forEach(round => {
            // Count wins and categorize by type
            if (round.winner_game_player_id === playerId) {
                stats.wins.total++;
                
                // Categorize by win type using the enum
                if (round.win_type === WinType.SELF_DRAW_ALL_PAY) {
                    stats.wins.self_draw++;
                } else if (round.win_type === WinType.SELF_DRAW_ONE_PAY) {
                    stats.wins.one_pay++;
                } else {
                    // Default to NORMAL
                    stats.wins.direct++;
                }
            }
            
            // Count losses (player is the loser and it's not self-draw-all)
            if (round.loser_game_player_id === playerId) {
                stats.losses.total++;
                
                // Categorize loss by win type
                if (round.win_type === WinType.SELF_DRAW_ONE_PAY) {
                    stats.losses.one_pay++;
                } else {
                    stats.losses.direct++;
                }
            }
            
            // Handle special case: player lost in SELF_DRAW_ALL_PAY but isn't the designated loser
            if (round.win_type === WinType.SELF_DRAW_ALL_PAY && 
                round.winner_game_player_id !== playerId) {
                stats.losses.total++;
                stats.losses.self_draw = (stats.losses.self_draw || 0) + 1;
            }
        });
        
        return stats;
    }, [rounds]);
    
    return { getPlayerStats };
};