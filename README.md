# MJKit Frontend

## Description

This is the frontend application for MJKit, a comprehensive Mahjong scoring system designed to track game scores, manage players, and visualize results. Built with React, TypeScript, and Material UI, this application provides an intuitive interface for Mahjong players to set up games with custom rules, track rounds and scores in real-time, and view game history.

## Table of Contents

- Features
- Tech Stack
- Project Structure
- Setup and Installation
- Available Scripts
- Usage
- Component Overview
- API Interaction
- Authentication System
- Internationalization
- Future Work
- Contributing
- Contact

## Features

### Game Setup
* **Player Configuration** (`src/pages/GameSetupPage.tsx`):
  * Define up to 8 players with custom names
  * Assign unique colors and emojis to each player
  * Drag-and-drop interface for rearranging player order
  * Set inactive/bench players

* **Game Rules Customization**:
  * Define Min and Max Score (Faan) limits
  * Set Maximum Money values
  * Configure special scoring rules (e.g., Half Money After 5)
  * Optional game naming for easy identification
  * Real-time score preview based on selected rules

### Game Management
* **Game Dashboard** (`src/pages/GamePage/index.tsx`):
  * Comprehensive overview of game status and player balances
  * Current game statistics and progress indicators
  * Quick actions for common game management tasks

* **Round Recording**:
  * Easy-to-use interface for adding game rounds
  * Support for different win types (Normal, Self-Draw All Pay, Self-Draw One Pay)
  * Fast player selection with visual player cards
  * Real-time money calculation based on score (Faan)

* **Game History** (`src/components/GameHistoryTable.tsx`):
  * Complete log of all rounds with timestamps
  * Filters and sorting options
  * Round deletion capability for game masters

### Sharing & Collaboration
* **Game Sharing** (`src/pages/GamePage/components/ShareGameDialog.tsx`):
  * Generate QR codes for quick game access
  * Share links via WhatsApp, Telegram, Signal, Discord, and Instagram
  * Admin rights transfer option for trusted collaborators
  * Copy direct links to clipboard

### Player Management
* **Player Management** (`src/pages/PlayersManagementPage.tsx`):
  * Change player order mid-game
  * Toggle player active/inactive status
  * Update player details

### Reference Tools
* **Score Reference** (`src/pages/ScoreReferencePage.tsx`):
  * Complete score-to-money conversion tables
  * Rule explanations and examples
  * Quick reference during gameplay

## Tech Stack

* **Framework:** React 19
* **Language:** TypeScript
* **Build Tool:** Vite
* **UI Library:** Material UI (MUI)
* **Routing:** React Router DOM v7
* **State Management:** React Hooks (useState, useEffect, useContext)
* **Data Fetching:** Custom fetch wrappers with authentication handling
* **Drag & Drop:** DND Kit (@dnd-kit/core, @dnd-kit/sortable)
* **Internationalization:** i18next with React bindings
* **QR Code Generation:** react-qr-code
* **Date Handling:** date-fns
* **Utility Libraries:** 
  * UUID for generating unique IDs
  * copy-to-clipboard for sharing functionality

## Project Structure

```
mjkit-frontend/
├── public/
│   └── image/
│       └── icon.png
├── src/
│   ├── components/         # Reusable UI components
│   ├── config/             # App configuration
│   ├── hooks/              # Custom React hooks
│   ├── locales/            # Translation files
│   │   ├── en/             # English translations
│   │   └── zh/             # Chinese translations
│   ├── pages/              # Main application pages
│   │   ├── GamePage/       # Game page with subcomponents
│   │   │   ├── components/ # Game-specific components
│   │   │   └── hooks/      # Game-specific hooks
│   │   ├── GameSetupPage/  # Game setup page
│   │   └── ...
│   ├── styles/             # Global styles and themes
│   ├── utils/              # Utility functions
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # Application entry point
│   └── style.css           # Global CSS
├── index.html              # HTML template
├── package.json            # Project dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite build configuration
```

## Setup and Installation

1. **Clone the repository:**
   ```sh
   git clone <repository-url>
   cd mjkit-frontend
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```
   *(Or `yarn install` or `pnpm install`)*

3. **Configure environment variables:**
   Create a `.env` file in the project root with the following variables:
   ```
   VITE_API_URL=http://localhost:3000
   ```
   Adjust the API URL as needed for your backend server.

4. **Start the development server:**
   ```sh
   npm run dev
   ```

5. **Configure backend:**
   Ensure the MJKit backend server is running and accessible at the URL specified in your environment variables.

## Available Scripts

* **Run in Development Mode:**
  ```sh
  npm run dev
  ```
  Starts the Vite development server, usually at `http://localhost:5173`.

* **Build for Production:**
  ```sh
  npm run build
  ```
  Compiles TypeScript and builds the application for production in the dist folder.

* **Preview Production Build:**
  ```sh
  npm run preview
  ```
  Serves the production build locally to preview it.

* **Type Check:**
  ```sh
  npx tsc
  ```
  Runs the TypeScript compiler to check for type errors without emitting files.

## Usage

### Getting Started

1. Navigate to the application in your browser (default: `http://localhost:5173`).
2. You will land on the **Game Setup Page**.
3. Add players by entering names and selecting colors.
4. Configure game rules according to your preferences.
5. Click "Create Game" to start a new Mahjong session.
6. You will be redirected to the **Game Page** for the newly created game.

### Recording Game Rounds

1. On the Game Page, click the "Add Round" button.
2. Select the win type (Normal, Self-Draw All Pay, Self-Draw One Pay).
3. Choose the winning player from the player cards.
4. If applicable, select the losing player.
5. Set the score (Faan) using the slider.
6. Note the calculated money value displayed below the slider.
7. Click "Submit" to record the round.

### Sharing Games

1. Click the "Share" button in the navigation header.
2. Choose your preferred sharing method:
   - QR Code: Let others scan to join
   - Copy Link: Copy direct URL to clipboard
   - Share buttons: Send via WhatsApp, Telegram, Signal, etc.
3. To share admin rights (optional):
   - Check "Share with Admin Rights" option
   - Use the specially generated link that includes admin permissions

### Managing Players

1. Navigate to Player Management via the menu.
2. Drag players to reorder seating positions.
3. Toggle player active/inactive status as needed.
4. Save changes when finished.

## Component Overview

### Core Components

* **NavigationHeader**: Main navigation bar with game actions
* **PlayersList**: Displays player information and balances
* **RoundEntryModal**: Interface for adding new game rounds
* **GameHistoryTable**: Tabular display of all game rounds
* **ShareGameDialog**: Dialog for sharing game access
* **ConfirmationDialog**: Reusable confirmation dialog
* **Footer**: Application footer with contact information

### Page Components

* **GameSetupPage**: Initial page for configuring new games
* **GamePage**: Main game view with all game information
* **PlayersManagementPage**: Interface for managing player order and status
* **ScoreReferencePage**: Reference tables for scoring rules

## API Interaction

The frontend interacts with a backend API with the following endpoints:

* **Game Management:**
  * `POST /games`: Creates a new game with specified settings
  * `GET /games/:gameId`: Retrieves details for a specific game
  * `POST /games/:gameId/start`: Starts a game and generates master token

* **Round Management:**
  * `GET /games/:gameId/rounds`: Retrieves all rounds for a game
  * `POST /games/:gameId/rounds`: Creates a new round
  * `DELETE /games/:gameId/rounds/:roundId`: Deletes a specific round

* **Player Management:**
  * `PATCH /games/:gameId/players/update-order`: Updates player order and active status

* **Reference Data:**
  * `GET /games/score-preview`: Retrieves score-to-money mapping based on rules

All authenticated requests include the `x-game-master-token` header for authorization.

## Authentication System

MJKit uses a token-based authentication system:

1. When a game is created or started, a game master token is generated
2. This token is stored in `localStorage` with key `gameMasterToken_{gameId}`
3. The token authorizes administrative actions like:
   * Adding rounds
   * Deleting rounds
   * Updating player information
4. Game master rights can be shared through special URLs
5. Public game viewing is available without authentication

## Internationalization

MJKit supports multiple languages through i18next:

* Currently supported languages:
  * English (en)
  * Chinese (zh)
* Translation files are located in `src/locales/{language}/translation.json`
* Language switching is available through the LanguageSwitcher component
* To add a new language, create a new translation file and update the language selector

## Future Work

* **Enhanced Visualization**:
  * Score progression graphs
  * Player performance statistics
  * Visual round history timeline

* **Advanced Game Options**:
  * Custom scoring rules editor
  * Tournament mode with multiple games
  * Different rule presets (Hong Kong, Chinese, Japanese styles)

* **User Experience**:
  * Offline mode with local storage
  * Dark/light theme toggle
  * Animation enhancements

* **Social Features**:
  * Player profiles and statistics
  * Game result sharing to social media
  * Historical player rankings

## Contributing

Contributions to MJKit are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Contact

For feedback, suggestions, or bug reports, please contact us at: mjkitdeveloper@gmail.com

---

© 2025 MJKit. All rights reserved.
