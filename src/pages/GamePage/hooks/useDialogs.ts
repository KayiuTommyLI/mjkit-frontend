import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../../config';
import { RoundData } from '../../../types';

export const useDialogs = (
    gameId: string,
    onRoundSuccess: () => void,
    canAddRound: boolean
) => {
    const navigate = useNavigate();
    
    // Round modal state
    const [isRoundModalOpen, setIsRoundModalOpen] = useState<boolean>(false);
    
    // Delete dialog state
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
    const [roundToDelete, setRoundToDelete] = useState<RoundData | null>(null);
    const [isDeletingRound, setIsDeletingRound] = useState<boolean>(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    
    // New game dialog state
    const [isNewGameDialogOpen, setIsNewGameDialogOpen] = useState<boolean>(false);
    
    // Round modal handlers
    const handleOpenRoundModal = useCallback(() => {
        if (canAddRound) {
            setIsRoundModalOpen(true);
        } else {
            // Show error message based on condition
            if (!gameId) {
                alert('Game ID is missing.');
            } else {
                const tokenExists = !!localStorage.getItem(`gameMasterToken_${gameId}`);
                if (!tokenExists) {
                    alert('Cannot add round: Game Master Token not found. Please ensure the game is started.');
                } else {
                    alert('Cannot add round, game is not active. Please start the game first.');
                }
            }
        }
    }, [canAddRound, gameId]);
    
    const handleCloseRoundModal = useCallback(() => {
        setIsRoundModalOpen(false);
    }, []);
    
    // Delete dialog handlers
    const handleDeleteRoundRequest = useCallback((round: RoundData) => {
        setRoundToDelete(round);
        setDeleteError(null);
        setIsDeleteDialogOpen(true);
    }, []);
    
    const handleCloseDeleteDialog = useCallback(() => {
        setIsDeleteDialogOpen(false);
        setRoundToDelete(null);
    }, []);
    
    const handleConfirmDelete = useCallback(async () => {
        if (!roundToDelete || !gameId) {
            setDeleteError("Cannot delete: Round or Game ID missing.");
            setIsDeleteDialogOpen(false);
            return;
        }

        const gameMasterToken = localStorage.getItem(`gameMasterToken_${gameId}`);
        if (!gameMasterToken) {
            setDeleteError("Cannot delete: Game Master Token not found.");
            setIsDeleteDialogOpen(false);
            return;
        }

        setIsDeletingRound(true);
        setDeleteError(null);

        try {
            const response = await fetch(`${API_URL}/game/${gameId}/rounds/${roundToDelete.round_id}`, {
                method: 'DELETE',
                headers: {
                    'x-game-master-token': gameMasterToken,
                },
            });

            if (!response.ok && response.status !== 204) {
                let errorMsg = `Error deleting round: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.message || JSON.stringify(errorData);
                } catch (jsonError) {
                    errorMsg = `${response.status} ${response.statusText}`;
                }
                throw new Error(errorMsg);
            }
            
            // Call success handler to refresh data
            onRoundSuccess();

        } catch (err: any) {
            console.error("Failed to delete round:", err);
            setDeleteError(err.message || 'Failed to delete round');
        } finally {
            setIsDeletingRound(false);
            setIsDeleteDialogOpen(false);
            setRoundToDelete(null);
        }
    }, [gameId, roundToDelete, onRoundSuccess]);
    
    // New game dialog handlers
    const handleNewGameRequest = useCallback(() => {
        setIsNewGameDialogOpen(true);
    }, []);
    
    const handleConfirmNewGame = useCallback(() => {
        setIsNewGameDialogOpen(false);
        navigate('/');
    }, [navigate]);
    
    const handleCloseNewGameDialog = useCallback(() => {
        setIsNewGameDialogOpen(false);
    }, []);
    
    return {
        isRoundModalOpen,
        handleOpenRoundModal,
        handleCloseRoundModal,
        isDeleteDialogOpen,
        roundToDelete,
        handleDeleteRoundRequest,
        handleCloseDeleteDialog,
        handleConfirmDelete,
        isDeletingRound,
        deleteError,
        isNewGameDialogOpen,
        handleNewGameRequest,
        handleConfirmNewGame,
        handleCloseNewGameDialog
    };
};