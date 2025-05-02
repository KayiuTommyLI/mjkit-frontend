// src/main.tsx (Expected Structure)
import React from 'react'
import ReactDOM from 'react-dom/client'
// import { BrowserRouter } from 'react-router-dom';
import { HashRouter } from 'react-router-dom';
import App from './App'
import './style.css'
import './i18n'; // Import i18n configuration

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
// Add this somewhere in your application startup code (e.g., in main.tsx)
import i18n from './i18n'; // Your i18n configuration file

// Update the title when language changes
i18n.on('languageChanged', () => {
  document.title = i18n.t('appTitle');
});

// Set initial title
document.title = i18n.t('appTitle');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Replace BrowserRouter with HashRouter */}
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
)