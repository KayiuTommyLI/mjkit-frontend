import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { API_URL } from '../../../config';
import { RoundData, GameData } from '../../../types';
import { apiRequest } from '../../../utils/api';

// Update the function signature to accept fetchGameData
export const useRoundsData = (gameId: string, gameData: GameData | null, fetchGameData: () => void) => {
    const { t } = useTranslation();
    const [rounds, setRounds] = useState<RoundData[]>([]);
    const [loadingRounds, setLoadingRounds] = useState<boolean>(true);
    const [roundsError, setRoundsError] = useState<string | null>(null);
    const [isDeletingRound, setIsDeletingRound] = useState<boolean>(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    
    // Fetch rounds data
    const fetchRoundsData = useCallback(async (showLoading = true) => {
        if (!gameId) {
            setRoundsError(t('errorNoGameId'));
            setLoadingRounds(false);
            return;
        }
        
        if (showLoading) {
            setLoadingRounds(true);
        }
        
        try {
            const response = await fetch(`${API_URL}/game/${gameId}/rounds`);
            
            if (!response.ok) {
                let errorMsg = `Rounds Data Error: ${response.status}`;
                try {
                    const data = await response.json();
                    errorMsg = data.message || JSON.stringify(data);
                } catch (e) {
                    errorMsg = `${response.status} ${response.statusText}`;
                }
                throw new Error(errorMsg);
            }
            
            const data = await response.json();
            setRounds(data);
            setRoundsError(null);
            
        } catch (err: any) {
            console.error("Error fetching rounds data:", err);
            setRoundsError(err.message || 'Failed to fetch rounds data');
            setRounds([]);
        } finally {
            setLoadingRounds(false);
        }
    }, [gameId, t]);
    
    // Initial fetch
    useEffect(() => {
        fetchRoundsData();
    }, [fetchRoundsData]);
    
    // Handle round submission success
    const handleRoundSubmitSuccess = useCallback(() => {
        // Fetch the rounds data
        fetchRoundsData();
        
        // ALSO fetch the game data to update player balances
        fetchGameData();
        
    }, [fetchRoundsData, fetchGameData]);
    
    // Handle delete round
    const handleDeleteRound = useCallback(async (roundToDelete: RoundData | null) => {
        if (!roundToDelete || !gameId) {
            setDeleteError("Cannot delete: Round or Game ID missing.");
            return;
        }

        setIsDeletingRound(true);
        setDeleteError(null);

        try {
            await apiRequest(`game/${gameId}/rounds/${roundToDelete.round_id}`, gameId, {
                method: 'DELETE',
                requiresAuth: true
            });
            
            // Refresh data after successful deletion
            await fetchRoundsData(false);
        } catch (err: any) {
            console.error("Failed to delete round:", err);
            setDeleteError(err.message || t('errorDeleteFailed'));
        } finally {
            setIsDeletingRound(false);
        }
    }, [gameId, fetchRoundsData, t]);
    
    return {
        rounds,
        loadingRounds,
        roundsError,
        isDeletingRound,
        deleteError,
        fetchRoundsData,
        handleRoundSubmitSuccess,
        handleDeleteRound
    };
};