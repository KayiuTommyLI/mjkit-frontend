// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import GameSetupPage from './pages/GameSetupPage';
import GamePage from './pages/GamePage';
import ScoreReferencePage from './pages/ScoreReferencePage';
import LanguageSwitcher from './components/LanguageSwitcher';
import PlayersManagementPage from './pages/PlayersManagementPage';
import NotFound from './pages/NotFound';
import Footer from './components/Footer'; // Import the new Footer component
import './style.css'; 

function App() {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '100vh' // Ensure full viewport height
    }}>
      <LanguageSwitcher />
      
      <Box sx={{ flex: '1 0 auto', pb: 3 }}>
        <Routes>
          <Route path="/" element={<GameSetupPage />} />
          <Route path="/game/:gameId" element={<GamePage />} />
          <Route path="/score-reference" element={<ScoreReferencePage />} /> 
          <Route path="/game/:gameId/players" element={<PlayersManagementPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Box>
      
      <Footer />
    </Box>
  );
}

export default App;