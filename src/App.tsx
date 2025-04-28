// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import GameSetupPage from './pages/GameSetupPage';
import GamePage from './pages/GamePage'; // Import the GamePage component
import './style.css'; 

function App() {
  return (
    <Routes>
      {/* Route for the setup page */}
      <Route path="/" element={<GameSetupPage />} />

      {/* Route for displaying a specific game, using gameId as a URL parameter */}
      <Route path="/game/:gameId" element={<GamePage />} />

      {/* Optional: Add a catch-all route for 404 */}
      <Route path="*" element={<div style={{ padding: '20px' }}><h2>Page Not Found</h2></div>} />
    </Routes>
  );
}

export default App;