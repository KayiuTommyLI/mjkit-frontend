import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
    Container, Typography, Paper, Box, Alert, Button, 
    Avatar, CircularProgress, Switch, FormControlLabel
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

// Import DND kit instead of react-beautiful-dnd
import {
    DndContext, 
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { API_URL } from '../config';
import { t } from 'i18next';

// Add this import at the top of the file
import { apiRequest } from '../utils/api';

// Define GamePlayerData interface locally
interface GamePlayerData {
  game_player_id: string;
  player_name_in_game: string;
  player_emoji_in_game: string;
  player_color_in_game: string;
  current_balance: string | number;
  is_active: boolean;
  player_order: number;
}

// Sortable player item component
const SortablePlayerItem = ({ player, index, toggleActive, playersArray, activePlayers, hasMasterToken }) => {
    const { 
        attributes, 
        listeners, 
        setNodeRef, 
        transform, 
        transition,
        isDragging
    } = useSortable({ 
        id: player.game_player_id,
        disabled: !hasMasterToken
    });
    
    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        marginBottom: '1px',
        padding: '10px',
        paddingLeft: '70px', // Increase left padding for both indicator and drag handle
        backgroundColor: player.is_active 
            ? 'rgba(0, 70, 0, 0.3)' 
            : 'rgba(40, 40, 40, 0.3)',
        borderRadius: '0px',
        opacity: isDragging ? 0.8 : player.is_active ? 1 : (hasMasterToken ? 0.6 : 0.4), // Dim more if no token
        zIndex: isDragging ? 999 : 1,
        borderBottom: '1px solid rgba(80, 80, 80, 0.2)',
        position: 'relative',
        cursor: hasMasterToken ? 'inherit' : 'not-allowed' // Change cursor to indicate disabled state
    };

    // If active, add an index indicator with compass direction - use relative position in active players
    const getPositionText = (player) => {
        if (!player.is_active) return '';
        
        // Find this player's position in the active players array
        const activeIndex = activePlayers.findIndex(p => p.game_player_id === player.game_player_id);
        
        if (activeIndex === -1) return '';
        
        const positions = {
            0: t('east'),
            1: t('south'), 
            2: t('west'),
            3: t('north')
        };
        
        return positions[activeIndex] || String(activeIndex + 1);
    };

    // Position the active player indicator to the far left
    const indexIndicator = player.is_active ? (
        <div style={{
            position: 'absolute',
            left: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: 'auto',
            minWidth: '40px',
            padding: '2px 5px',
            height: '24px',
            borderRadius: '4px',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '24px',
            whiteSpace: 'nowrap',
            color: '#fff'
        }}>
            {getPositionText(player)}
        </div>
    ) : null;
    
    return (
        <div ref={setNodeRef} style={style}>
            {/* Show compass indicator */}
            {indexIndicator}
            
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                {/* Position drag handle to the right of the compass indicator */}
                <div 
                    {...(hasMasterToken ? attributes : {})} 
                    {...(hasMasterToken ? listeners : {})} 
                    style={{ 
                        position: 'absolute',
                        left: '55px', // Position after the compass indicator
                        top: '50%',
                        transform: 'translateY(-50%)',
                        cursor: hasMasterToken ? 'grab' : 'not-allowed',
                        opacity: hasMasterToken ? 1 : 0.5
                    }}
                >
                    <DragIndicatorIcon sx={{ color: 'silver' }} />
                </div>
                
                <Avatar 
                    sx={{ 
                        bgcolor: player.player_color_in_game,
                        fontSize: '1.5rem',
                        width: 40, 
                        height: 40,
                        mr: 2,
                        ml: 1 // Add margin to separate from drag handle
                    }}
                >
                    {player.player_emoji_in_game || ''}
                </Avatar>
                
                <Box sx={{ flexGrow: 1 }}>
                    <Typography>{player.player_name_in_game}</Typography>
                    <Typography variant="h6" sx={{ 
                        color: parseFloat(String(player.current_balance)) >= 0 
                            ? '#90EE90' 
                            : '#FFA07A',
                        fontWeight: 'bold'
                    }}>
                        ${parseFloat(String(player.current_balance)).toFixed(2)}
                    </Typography>
                </Box>
                
                <Switch 
                    checked={player.is_active}
                    onChange={() => hasMasterToken && toggleActive(player.game_player_id)}
                    disabled={!hasMasterToken}
                    sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                            color: 'white'
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: 'white'
                        },
                        '& .Mui-disabled': {
                            opacity: 0.5
                        }
                    }}
                />
            </Box>
            
            {!hasMasterToken && (
                <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    zIndex: 2,
                    pointerEvents: 'none'
                }}/>
            )}
        </div>
    );
};

// Add token checking in the main component
const PlayersManagementPage: React.FC = () => {
    const { gameId } = useParams<{ gameId: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();
    
    const [players, setPlayers] = useState<GamePlayerData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState<boolean>(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
    const [autoActivateNotification, setAutoActivateNotification] = useState<string | null>(null);
    
    // Add this state to check for master token
    const [hasMasterToken, setHasMasterToken] = useState<boolean>(false);
    
    // Configure sensors for drag interactions
    const sensors = useSensors(
        useSensor(PointerSensor, {
            // Disable drag if no master token
            activationConstraint: {
                delay: 250,
                tolerance: 5,
                distance: hasMasterToken ? 0 : Number.POSITIVE_INFINITY // Prevents dragging if no token
            }
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );
    
    // Check for the master token when component mounts
    useEffect(() => {
        if (gameId) {
            const token = localStorage.getItem(`gameMasterToken_${gameId}`);
            setHasMasterToken(!!token);
        }
    }, [gameId]);
    
    // Group players by active status
    const { activePlayers, inactivePlayers } = useMemo(() => {
        const active = players.filter(p => p.is_active);
        const inactive = players.filter(p => !p.is_active);
        return { activePlayers: active, inactivePlayers: inactive };
    }, [players]);
    
    // Fetch all players (active and inactive)
    const fetchPlayers = useCallback(async () => {
        if (!gameId) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch(`${API_URL}/game/${gameId}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch game data: ${response.status}`);
            }
            
            const gameData = await response.json();
            // Sort players by order
            const allPlayers = [...gameData.gamePlayers].sort((a, b) => a.player_order - b.player_order);
            setPlayers(allPlayers);
        } catch (err: any) {
            setError(err.message || 'Failed to load players');
        } finally {
            setLoading(false);
        }
    }, [gameId]);
    
    useEffect(() => {
        fetchPlayers();
    }, [fetchPlayers]);
    
    // Auto-handle player count to maintain exactly 4 active players
    useEffect(() => {
        // Case 1: Too few active players - need to activate some
        if (activePlayers.length < 4 && inactivePlayers.length > 0) {
            const playersNeeded = 4 - activePlayers.length;
            const updatedPlayers = [...players];
            const sortedInactive = [...inactivePlayers].sort((a, b) => a.player_order - b.player_order);
            
            // Track which players will be activated
            const activatedPlayers: string[] = [];
            
            for (let i = 0; i < Math.min(playersNeeded, sortedInactive.length); i++) {
                const playerIndex = updatedPlayers.findIndex(
                    p => p.game_player_id === sortedInactive[i].game_player_id
                );
                if (playerIndex !== -1) {
                    updatedPlayers[playerIndex] = {
                        ...updatedPlayers[playerIndex],
                        is_active: true
                    };
                    activatedPlayers.push(updatedPlayers[playerIndex].player_name_in_game);
                }
            }
            
            if (activatedPlayers.length > 0) {
                const reordered = updatedPlayers.map((player, index) => ({
                    ...player,
                    player_order: index
                }));
                
                setPlayers(reordered);
                
                // Show notification
                setAutoActivateNotification(
                    t('autoActivatedPlayerCount', {length : activatedPlayers.length, player : activatedPlayers.join(', ')})
                );
                // Clear notification after 5 seconds
                setTimeout(() => setAutoActivateNotification(null), 5000);
            }
        }
        // Case 2: Too many active players - need to deactivate some
        else if (activePlayers.length > 4) {
            const excessCount = activePlayers.length - 4;
            const updatedPlayers = [...players];
            // Sort active players by order (highest first) to deactivate from the end
            const sortedActive = [...activePlayers].sort((a, b) => b.player_order - a.player_order);
            
            // Track which players will be deactivated
            const deactivatedPlayers: string[] = [];
            
            // Deactivate excess players starting from highest order number
            for (let i = 0; i < excessCount; i++) {
                const playerIndex = updatedPlayers.findIndex(
                    p => p.game_player_id === sortedActive[i].game_player_id
                );
                if (playerIndex !== -1) {
                    updatedPlayers[playerIndex] = {
                        ...updatedPlayers[playerIndex],
                        is_active: false
                    };
                    deactivatedPlayers.push(updatedPlayers[playerIndex].player_name_in_game);
                }
            }
            
            if (deactivatedPlayers.length > 0) {
                const reordered = updatedPlayers.map((player, index) => ({
                    ...player,
                    player_order: index
                }));
                
                setPlayers(reordered);
                
                // Show notification
                setAutoActivateNotification(
                    t('autoDeactivatedPlayerCount', { length: deactivatedPlayers.length, player: deactivatedPlayers.join(', ') })
                );
                // Clear notification after 5 seconds
                setTimeout(() => setAutoActivateNotification(null), 5000);
            }
        }
    }, [activePlayers.length, inactivePlayers.length, players]);
    
    // Handle drag end - updated to toggle active status when dragged between sections
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        
        if (!over || active.id === over.id) {
            return;
        }
        
        setPlayers(players => {
            // Find the dragged player and the destination player
            const draggedPlayer = players.find(p => p.game_player_id === active.id);
            const targetPlayer = players.find(p => p.game_player_id === over.id);
            
            if (!draggedPlayer || !targetPlayer) return players;
            
            // Check if the player is being moved between active and inactive sections
            if (draggedPlayer.is_active !== targetPlayer.is_active) {
                // Toggle the dragged player's active status to match the target section
                draggedPlayer.is_active = targetPlayer.is_active;
            }
            
            // Find indices for array movement
            const oldIndex = players.findIndex(p => p.game_player_id === active.id);
            const newIndex = players.findIndex(p => p.game_player_id === over.id);
            
            // Create reordered array using arrayMove helper
            const reordered = arrayMove(players, oldIndex, newIndex);
            
            // Update player_order values
            return reordered.map((player, index) => ({
                ...player,
                player_order: index
            }));
        });
    };
    
    // Toggle player active status with auto-balancing
    const togglePlayerActive = (playerId: string) => {
        const updatedPlayers = [...players];
        const playerIndex = updatedPlayers.findIndex(p => p.game_player_id === playerId);
        
        if (playerIndex === -1) return;
        
        const player = updatedPlayers[playerIndex];
        const currentActiveCount = updatedPlayers.filter(p => p.is_active).length;
        
        // Case 1: Trying to activate an inactive player
        if (!player.is_active) {
            // If we already have 4 active players, deactivate the last one first
            if (currentActiveCount >= 4) {
                // Find the highest-order active player to deactivate
                const sortedActive = [...updatedPlayers.filter(p => p.is_active)]
                    .sort((a, b) => b.player_order - a.player_order);
                
                if (sortedActive.length > 0) {
                    const lastActiveIndex = updatedPlayers.findIndex(
                        p => p.game_player_id === sortedActive[0].game_player_id
                    );
                    updatedPlayers[lastActiveIndex].is_active = false;
                }
            }
            
            // Now activate the selected player
            updatedPlayers[playerIndex].is_active = true;
        } 
        // Case 2: Trying to deactivate an active player
        else {
            // If this would leave us with less than 4 active players, activate another inactive player
            if (currentActiveCount <= 4) {
                // Find the first inactive player by order to activate
                const sortedInactive = [...updatedPlayers.filter(p => !p.is_active)]
                    .sort((a, b) => a.player_order - b.player_order);
                
                // Only allow deactivation if there's another player to activate
                if (sortedInactive.length > 0) {
                    const firstInactiveIndex = updatedPlayers.findIndex(
                        p => p.game_player_id === sortedInactive[0].game_player_id
                    );
                    updatedPlayers[firstInactiveIndex].is_active = true;
                    
                    // Deactivate the selected player
                    updatedPlayers[playerIndex].is_active = false;
                } else {
                    // No inactive players available, show an error
                    setSaveError("Cannot deactivate - need exactly 4 active players and no more players available.");
                    return;
                }
            } else {
                // We have more than 4 active players, safe to deactivate
                updatedPlayers[playerIndex].is_active = false;
            }
        }
        
        // Update player order values
        const reordered = updatedPlayers.map((player, index) => ({
            ...player,
            player_order: index
        }));
        
        setPlayers(reordered);
    };
    
    // Save changes to the server
    const saveChanges = async () => {
        if (!gameId) return;
        
        // Validate active player count
        const activePlayerCount = players.filter(p => p.is_active).length;
        if (activePlayerCount !== 4) {
            setSaveError(`You must have exactly 4 active players. Currently you have ${activePlayerCount}.`);
            return;
        }
        
        setSaving(true);
        setSaveError(null);
        setSaveSuccess(false);
        
        const gameMasterToken = localStorage.getItem(`gameMasterToken_${gameId}`);
        if (!gameMasterToken) {
            setSaveError('Master token not found. You need game master privileges.');
            setSaving(false);
            return;
        }
        
        try {
            const playerUpdates = players.map(player => ({
                game_player_id: player.game_player_id,
                player_order: player.player_order,
                is_active: player.is_active
            }));
            
            await apiRequest(`game/${gameId}/players/update-order`, gameId, {
                method: 'PATCH',
                body: { players: playerUpdates },
                requiresAuth: true
            });
            
            setSaveSuccess(true);
            // Navigate back to game page after brief delay
            setTimeout(() => navigate(`/game/${gameId}`), 1000);
        } catch (err: any) {
            setSaveError(err.message || 'Failed to save changes');
        } finally {
            setSaving(false);
        }
    };
    
    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <CircularProgress sx={{ color: 'silver' }}/>
            </Container>
        );
    }
    
    if (error) {
        return (
            <Container maxWidth="sm" sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
                <Button 
                    variant="outlined" 
                    onClick={() => navigate(`/game/${gameId}`)} 
                    sx={{ mt: 2 }} 
                    startIcon={<ArrowBackIcon />}
                >
                    {t('backToGameLabel')}
                </Button>
            </Container>
        );
    }
    
    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Button 
                variant="outlined" 
                onClick={() => navigate(`/game/${gameId}`)} 
                sx={{ mb: 2, color: 'silver', borderColor: 'silver' }}
                startIcon={<ArrowBackIcon />}
            >
                {t('backToGameLabel')}
            </Button>
            
            <Paper elevation={0} sx={{ p: 3, backgroundColor: 'transparent', color: 'white' }}>
                <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                    {t('managePlayersTitle')}
                </Typography>

                {/* {!hasMasterToken && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        {t('noMasterTokenWarning', 'You need the game master token to manage players. Player management is disabled.')}
                    </Alert>
                )} */}

                {saveError && <Alert severity="error" sx={{ mb: 2 }}>{saveError}</Alert>}
                {saveSuccess && <Alert severity="success" sx={{ mb: 2 }}>{t('changesSavedSuccess')}</Alert>}
                {autoActivateNotification && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        {autoActivateNotification}
                    </Alert>
                )}
                
                <Typography variant="body2" color="silver" sx={{ mb: 2 }}>
                    {t('dragAndDropInstructions')}
                </Typography>

                {/* Add this - Active player count indicator */}
                <Typography 
                    variant="body2" 
                    color={activePlayers.length === 4 ? "lightgreen" : "orange"} 
                    sx={{ mb: 2, fontWeight: 'bold' }}
                >
                    {t('activePlayerCountValid')}
                </Typography>
                
                {/* DndContext with a single list of all players but visually separated */}
                <DndContext 
                    sensors={sensors} 
                    collisionDetection={closestCenter} 
                    onDragEnd={handleDragEnd}
                >
                    {/* Use one SortableContext for all players */}
                    <SortableContext 
                        items={players.map(p => p.game_player_id)} 
                        strategy={verticalListSortingStrategy}
                    >
                        {/* First section: Active Players */}
                        <Box sx={{ 
                            bgcolor: 'rgba(0, 90, 0, 0.6)', 
                            borderRadius: '4px 4px 0 0',
                        }}>
                            <Typography 
                                variant="subtitle1" 
                                sx={{ 
                                    fontWeight: 'bold', 
                                    p: 1.5,
                                    pl: 2
                                }}
                            >
                                {t('activePlayersHeader', 'Active Players')} ({activePlayers.length})
                            </Typography>
                        </Box>
                        
                        {/* Active players container */}
                        <Box sx={{ 
                            minHeight: '50px', 
                            mb: 3,
                            backgroundColor: 'rgba(0, 40, 0, 0.2)',
                            border: '1px solid rgba(0, 128, 0, 0.3)',
                            borderTop: 'none',
                            position: 'relative'
                        }}>
                            {activePlayers.map((player, index) => (
                                <SortablePlayerItem 
                                    key={player.game_player_id}
                                    player={player}
                                    index={players.findIndex(p => p.game_player_id === player.game_player_id)} // Keep original index
                                    toggleActive={togglePlayerActive}
                                    playersArray={players}
                                    activePlayers={activePlayers}
                                    hasMasterToken={hasMasterToken}
                                />
                            ))}
                            {activePlayers.length === 0 && (
                                <Box sx={{ p: 2, textAlign: 'center', color: 'gray' }}>
                                    {t('noActivePlayers', 'No active players. Switch players to active below.')}
                                </Box>
                            )}
                            
                            {/* Add token warning if needed */}
                            {/* {!hasMasterToken && (
                                <Box sx={{ 
                                    position: 'absolute',
                                    top: '50%', 
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    backgroundColor: 'rgba(0,0,0,0.7)',
                                    padding: '8px 16px',
                                    borderRadius: '4px',
                                    zIndex: 10
                                }}>
                                    <Typography variant="body2" color="error">
                                        {t('masterTokenRequiredForChanges', 'Master token required to make changes')}
                                    </Typography>
                                </Box>
                            )} */}
                        </Box>
                        
                        {/* Second section: Inactive Players */}
                        <Box sx={{ 
                            bgcolor: 'rgba(90, 0, 0, 0.4)', 
                            borderRadius: '4px 4px 0 0',
                            borderTop: '2px solid rgba(128, 0, 0, 0.5)',
                            mt: 4 // Add more space between sections
                        }}>
                            <Typography 
                                variant="subtitle1" 
                                sx={{ 
                                    fontWeight: 'bold', 
                                    p: 1.5,
                                    pl: 2
                                }}
                            >
                                {t('inactivePlayersHeader', 'Inactive Players')} ({inactivePlayers.length})
                            </Typography>
                        </Box>
                        
                        {/* Inactive players container */}
                        <Box sx={{ 
                            minHeight: '50px',
                            backgroundColor: 'rgba(40, 0, 0, 0.2)',
                            border: '1px solid rgba(128, 0, 0, 0.3)',
                            borderTop: 'none'
                        }}>
                            {inactivePlayers.map((player, index) => (
                                <SortablePlayerItem 
                                    key={player.game_player_id}
                                    player={player}
                                    index={players.findIndex(p => p.game_player_id === player.game_player_id)} // Keep original index
                                    toggleActive={togglePlayerActive}
                                    playersArray={players}
                                    activePlayers={activePlayers}  // Add this line
                                    hasMasterToken={hasMasterToken}
                                />
                            ))}
                            {inactivePlayers.length === 0 && (
                                <Box sx={{ p: 2, textAlign: 'center', color: 'gray' }}>
                                    {t('noInactivePlayers', 'No inactive players.')}
                                </Box>
                            )}
                        </Box>
                    </SortableContext>
                </DndContext>
                
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Button
                        variant="contained"
                        onClick={saveChanges}
                        disabled={saving || !hasMasterToken}
                        sx={{
                            backgroundColor: 'white',
                            color: 'black',
                            '&:hover': {
                                backgroundColor: '#e0e0e0'
                            },
                            '&.Mui-disabled': {
                                backgroundColor: 'rgba(255,255,255,0.3)',
                                color: 'rgba(0,0,0,0.5)'
                            }
                        }}
                    >
                        {saving ? t('savingChangesLabel') : t('saveChangesLabel')}
                        {!hasMasterToken && (
                            <span style={{ fontSize: '0.7rem', marginLeft: '5px' }}>
                                ({t('masterTokenRequired')})
                            </span>
                        )}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default PlayersManagementPage;