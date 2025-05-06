import { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../../../config';
import { GameData } from '../../../types';

interface ScoreTableItem {
    score: number;
    money: number;
}

export const useScoreTable = (gameData: GameData | null) => {
    const [scoreTable, setScoreTable] = useState<ScoreTableItem[]>([]);
    const [loadingScoreTable, setLoadingScoreTable] = useState<boolean>(false);
    const [scoreTableError, setScoreTableError] = useState<string | null>(null);
    const [showScoreTable, setShowScoreTable] = useState<boolean>(false);
    
    // Fetch score table
    const fetchScoreTable = useCallback(async () => {
        if (!gameData) return;
        
        setLoadingScoreTable(true);
        setScoreTableError(null);
        
        try {
            const queryParams = new URLSearchParams({
                maxMoney: String(gameData.max_money),
                upperLimitOfScore: String(gameData.upper_limit_of_score),
                lowerLimitOfScore: String(gameData.lower_limit_of_score),
                halfMoneyRule: String(gameData.half_money_rule),
                onePayAllRule: String(gameData.one_pay_all_rule || false),
            }).toString();
            
            const response = await fetch(`${API_URL}/game/score-preview?${queryParams}`);
            
            if (!response.ok) {
                let errorMsg = `Score Table Error: ${response.status}`;
                try {
                    const data = await response.json();
                    errorMsg = data.message || JSON.stringify(data);
                } catch (e) {
                    errorMsg = `${response.status} ${response.statusText}`;
                }
                throw new Error(errorMsg);
            }
            
            const data = await response.json();
            setScoreTable(data);
            
        } catch (err: any) {
            console.error("Error fetching score table:", err);
            setScoreTableError(err.message || 'Failed to load score table.');
            setScoreTable([]);
        } finally {
            setLoadingScoreTable(false);
        }
    }, [gameData]);
    
    // Fetch score table when gameData changes
    useEffect(() => {
        if (gameData) {
            fetchScoreTable();
        }
    }, [gameData, fetchScoreTable]);
    
    return {
        scoreTable,
        loadingScoreTable,
        scoreTableError,
        showScoreTable,
        setShowScoreTable,
        fetchScoreTable
    };
};