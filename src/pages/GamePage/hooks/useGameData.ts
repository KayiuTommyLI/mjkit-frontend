import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { API_URL } from '../../../config';
import { GameData } from '../../../types';

export const useGameData = (gameId: string) => {
    const { t } = useTranslation();
    const [gameData, setGameData] = useState<GameData | null>(null);
    const [loadingGame, setLoadingGame] = useState<boolean>(true);
    const [gameError, setGameError] = useState<string | null>(null);
    const [isStartingGame, setIsStartingGame] = useState<boolean>(false);
    const [startError, setStartError] = useState<string | null>(null);
    const [hasMasterToken, setHasMasterToken] = useState<boolean>(false);
    
    // Check for Master Token
    useEffect(() => {
        if (gameId) {
            const token = localStorage.getItem(`gameMasterToken_${gameId}`);
            setHasMasterToken(!!token);
        } else {
            setHasMasterToken(false);
        }
    }, [gameId]);
    
    // Fetch game data
    const fetchGameData = useCallback(async (showLoading = true) => {
        if (!gameId) {
            setGameError(t('errorNoGameId'));
            setLoadingGame(false);
            return;
        }
        
        if (showLoading) {
            setLoadingGame(true);
        }
        
        try {
            const response = await fetch(`${API_URL}/game/${gameId}`);
            
            if (!response.ok) {
                let errorMsg = `Game Data Error: ${response.status}`;
                try {
                    const data = await response.json();
                    errorMsg = data.message || JSON.stringify(data);
                } catch (e) {
                    errorMsg = `${response.status} ${response.statusText}`;
                }
                throw new Error(errorMsg);
            }
            
            const data = await response.json();
            
            // Process numeric values
            if (typeof data.max_money === 'string') {
                data.max_money = parseFloat(data.max_money);
            }
            
            // Sort players by order
            if (data.gamePlayers) {
                data.gamePlayers.sort((a: any, b: any) => a.player_order - b.player_order);
            }
            
            setGameData(data);
            setGameError(null);
            
            // Re-check token presence
            setHasMasterToken(!!localStorage.getItem(`gameMasterToken_${gameId}`));
            
        } catch (err: any) {
            console.error("Error fetching game data:", err);
            setGameError(err.message || 'Failed to fetch game data');
        } finally {
            setLoadingGame(false);
        }
    }, [gameId, t]);
    
    // Initial fetch
    useEffect(() => {
        fetchGameData();
    }, [fetchGameData]);
    
    // Start game handler
    const handleStartGame = useCallback(async () => {
        if (!gameId) {
            setStartError(t('errorCannotStartNoId'));
            return;
        }
        
        setIsStartingGame(true);
        setStartError(null);
        
        try {
            // Note: Game start is a special case - it doesn't need token initially
            // but returns a token upon success
            const response = await fetch(`${API_URL}/game/${gameId}/start`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (!response.ok) {
                let errorMsg = `Failed to start game: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.message || JSON.stringify(errorData);
                } catch (jsonError) {
                    errorMsg = `${response.status} ${response.statusText}`;
                }
                throw new Error(errorMsg);
            }
            
            const result = await response.json();
            const gameMasterToken = result.gameMasterToken;
            
            if (!gameMasterToken) {
                throw new Error("Game started but master token was not received");
            }
            
            localStorage.setItem(`gameMasterToken_${gameId}`, gameMasterToken);
            setHasMasterToken(true);
            
            // Re-fetch game data
            await fetchGameData(false);
        } catch (err: any) {
            setStartError(err.message || t('errorStartGame'));
        } finally {
            setIsStartingGame(false);
        }
    }, [gameId, fetchGameData, t]);
    
    const canAddRound = gameData?.game_status === 'active' && hasMasterToken;
    
    return {
        gameData,
        loadingGame,
        gameError,
        hasMasterToken,
        isStartingGame,
        startError,
        canAddRound,
        fetchGameData,
        handleStartGame
    };
};