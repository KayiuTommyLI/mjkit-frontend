// Common types used across components
export interface GamePlayerData {
    game_player_id: string;
    user_id: string | null;
    player_name_in_game: string;
    player_color_in_game: string;
    player_emoji_in_game?: string;
    current_balance: number | string; // Accept string due to potential decimal issue
    player_order: number;
    is_active: boolean;
}

export interface GameData {
    game_id: string;
    game_name?: string;
    max_money: number;
    upper_limit_of_score: number;
    lower_limit_of_score: number;
    half_money_rule: boolean;
    one_pay_all_rule: boolean;
    game_status: string; // 'setting_up', 'active', 'finished'
    gamePlayers: GamePlayerData[];
}

export interface RoundStateData {
    round_state_id: string;
    game_player_id: string;
    balance_change: number | string; // Allow string due to decimal
    player_state: string; // Use the PlayerState enum string values
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
    winner?: { game_player_id: string; player_name_in_game: string; };
    loser?: { game_player_id: string; player_name_in_game: string; } | null;
    roundStates: RoundStateData[];
}

export interface PlayerInfoForModal { 
    game_player_id: string; 
    player_name_in_game: string; 
}

export interface ScoreLimitsForModal { 
    min: number; 
    max: number; 
}