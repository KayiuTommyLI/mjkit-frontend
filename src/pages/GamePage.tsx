// src/pages/GamePage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import hooks

// MUI Imports
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';

// Define interfaces for the fetched game data (adjust based on your actual backend response)
// These might ideally live in a shared types folder
interface GamePlayerData {
    game_player_id: string;
    user_id: string | null;
    player_name_in_game: string;
    player_color_in_game: string;
    current_balance: number;
    player_order: number;
    is_active: boolean;
    // Add user details if nested in response (e.g., user: { display_name?: string })
}

interface GameData {
    game_id: string;
    game_name?: string;
    max_money: number;
    upper_limit_of_score: number;
    lower_limit_of_score: number;
    half_money_rule: boolean;
    game_status: string; // e.g., 'active'
    gamePlayers: GamePlayerData[];
    // Add other fields returned by GET /games/:id as needed
}

const GamePage: React.FC = () => {
    const { gameId } = useParams<{ gameId: string }>(); // Get gameId from URL parameter
    const navigate = useNavigate(); // For potential navigation actions later

    const [gameData, setGameData] = useState<GameData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!gameId) {
            setError('No Game ID provided.');
            setLoading(false);
            return;
        }

        const fetchGameData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Use your actual backend URL
                const response = await fetch(`http://localhost:3000/games/${gameId}`);
                if (!response.ok) {
                     let errorMsg = `HTTP error! status: ${response.status}`;
                     try { const errorData = await response.json(); errorMsg = errorData.message || JSON.stringify(errorData); }
                     catch (jsonError) { errorMsg = `${response.status} ${response.statusText}`; }
                     throw new Error(errorMsg);
                }
                const data: GameData = await response.json();
                // Sort players by order for consistent display
                data.gamePlayers.sort((a, b) => a.player_order - b.player_order);
                setGameData(data);
            } catch (err: any) {
                console.error("Error fetching game data:", err);
                setError(err.message || 'Failed to fetch game data.');
            } finally {
                setLoading(false);
            }
        };

        fetchGameData();
    }, [gameId]); // Re-fetch if gameId changes

    // === Render Logic ===

    if (loading) {
        return (
            <Container maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
             <Container maxWidth="sm" sx={{ mt: 4 }}>
                <Alert severity="error">Error loading game: {error}</Alert>
                 <Button variant="outlined" onClick={() => navigate('/')} sx={{ mt: 2 }}>Go to Setup</Button>
             </Container>
        );
    }

    if (!gameData) {
         return (
             <Container maxWidth="sm" sx={{ mt: 4 }}>
                <Alert severity="warning">Game data not found.</Alert>
                 <Button variant="outlined" onClick={() => navigate('/')} sx={{ mt: 2 }}>Go to Setup</Button>
             </Container>
         );
    }

    // --- Display Game Data ---
    const activePlayers = gameData.gamePlayers.filter(p => p.is_active);
    // const benchPlayers = gameData.gamePlayers.filter(p => !p.is_active); // For later

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: { xs: 2, md: 3 } }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    {gameData.game_name || `Game: ${gameData.game_id.substring(0, 8)}...`}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    Status: {gameData.game_status} | Max Score: {gameData.upper_limit_of_score} | Max $: {gameData.max_money}
                </Typography>

                 <Divider sx={{ my: 2 }} />

                 <Typography variant="h6" component="h2" gutterBottom>
                    Players
                </Typography>
                <List dense={true}>
                     {activePlayers.map((player) => (
                        <ListItem key={player.game_player_id}>
                            <ListItemAvatar>
                                <Avatar sx={{ bgcolor: player.player_color_in_game, width: 24, height: 24 }}>
                                    {' '} {/* Small colored avatar */}
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={player.player_name_in_game}
                                secondary={`Balance: $${parseFloat(player.current_balance as any).toFixed(2)}`}
                            />
                        </ListItem>
                    ))}
                </List>

                 <Divider sx={{ my: 2 }} />

                {/* Placeholder for adding rounds */}
                 <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                    <Button variant="contained" color="primary" size="large">
                         Add Round Result (TODO)
                     </Button>
                </Box>

                {/* Placeholders for history table / graph */}
                 {/* <Box sx={{mt: 4}}> <Typography>Round History (TODO)</Typography> </Box> */}
                 {/* <Box sx={{mt: 4}}> <Typography>Score Graph (TODO)</Typography> </Box> */}

            </Paper>
        </Container>
    );
};

export default GamePage;