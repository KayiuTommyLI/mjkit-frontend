// src/App.tsx
import { Routes, Route, BrowserRouter } from 'react-router-dom';
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
    <BrowserRouter basename="/mjkit-frontend">
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        minHeight: '100vh',
        maxWidth: '100%' // Ensure full width usage
      }}>
        <LanguageSwitcher />
        
        <Box sx={{ 
          flex: '1 0 auto', 
          pb: 3,
          px: { xs: 0.05, sm: 0.1 }, // Reduce horizontal padding (was default 3)
          width: '100%', 
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}>
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
    </BrowserRouter>
  );
}

export default App;