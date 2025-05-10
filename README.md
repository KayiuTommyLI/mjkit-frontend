# MJKit Frontend

Welcome to the MJKit Frontend! This application provides a web-based interface for a Mahjong scoring system, allowing users to create games, manage players, track rounds, and view game statistics. It is designed to work in conjunction with the [MJKit Backend API](https://github.com/KayiuTommyLI/mjkit-backend) 

**Live Demo (if deployed via GitHub Pages):** `https://KayiuTommyLI.github.io/mjkit-frontend/` 

## Table of Contents

1.  [Core Features](#core-features)
2.  [Technology Stack](#technology-stack)
3.  [Project Structure](#project-structure)
4.  [Prerequisites](#prerequisites)
5.  [Setup and Installation](#setup-and-installation)
6.  [Available Scripts](#available-scripts)
7.  [Usage Guide](#usage-guide)
    * [Creating a New Game](#creating-a-new-game)
    * [Managing an Active Game](#managing-an-active-game)
    * [Sharing a Game](#sharing-a-game)
8.  [API Interaction](#api-interaction)
9.  [Internationalization (i18n)](#internationalization-i18n)
10. [Deployment](#deployment)
    * [GitHub Pages](#github-pages)
11. [Key Components & Hooks](#key-components--hooks)
12. [Future Work](#future-work)
13. [Contributing](#contributing)
14. [License](#license)

## Core Features

* **Game Setup & Configuration:**
    * Define initial players (up to 10) with names and colors.
    * Customize game rules:
        * Max Money (e.g., 30/60, 50/100)
        * Max Score Limit (e.g., 5, 8, 10)
        * Min Score Limit (e.g., 1, 2, 3)
        * Score Type Rule (e.g., "Half Money After 5", "Hot Hot Up")
        * Payment Rule (e.g., "One Pay All", "Everyone Need Pay")
    * Real-time score-to-money preview based on selected rules (`GET /games/score-preview`).
* **Game Management:**
    * **Game Dashboard:** View current player balances, game settings, and round history.
    * **Round Recording:** Add new round results, specifying winner, loser (if applicable), score, and win type (Normal, Self-Draw All Pay, Self-Draw One Loser).
    * **Round History:** View a log of all played rounds and their impact on player balances.
    * **Delete Round:** Remove the last recorded round (with confirmation).
    * **Start New Game:** Option to clear current game data and start a new setup.
* **Sharing & Access:**
    * Games are managed via a unique Game ID in the URL (`/game/:gameId`).
    * Administrative actions (adding/deleting rounds, starting a new game) are protected by a `gameMasterToken` stored in `localStorage`.
    * Share game progress by sharing the URL. Others can view, but only the "Game Master" (browser with the token) can modify.
    * QR code generation for easy sharing of the game URL.
    * Copy game URL to clipboard functionality.
* **Player Statistics:**
    * View player win/loss statistics, categorized by win/loss types (e.g., self-draw wins, lost by self-draw, etc.).
* **Score Reference Table:**
    * Display a table showing the money corresponding to each score point based on the current game's rules.
* **Internationalization:**
    * Support for English (en) and Traditional Chinese (zh-HANT).

## Technology Stack

* **Framework/Library:** React 19 (or latest as per `package.json`)
* **Language:** TypeScript
* **Build Tool:** Vite
* **UI Components:** Material-UI (MUI)
* **Routing:** React Router DOM v7 (using `HashRouter` for GitHub Pages compatibility)
* **State Management:** React Hooks (useState, useContext, useEffect) and custom hooks.
* **API Client:** `fetch` API (via a custom `apiRequest` utility)
* **Internationalization:** `i18next`, `react-i18next`
* **QR Code Generation:** `react-qr-code`
* **Date/Time Manipulation:** `date-fns`
* **Unique IDs:** `uuid`
* **Clipboard:** `copy-to-clipboard`
* **Styling:** CSS, MUI styling solutions.

## Project Structure


mjkit-frontend/
├── public/                  # Static assets
├── src/
│   ├── assets/              # Images, fonts, etc.
│   ├── components/          # Reusable UI components (e.g., PlayerCard, RoundEntryModal)
│   ├── config.ts            # Application configuration (e.g., API_URL)
│   ├── contexts/            # React context for global state
│   ├── hooks/               # Custom React hooks (general purpose)
│   ├── i18n.ts              # i18next configuration
│   ├── locales/             # Translation files (en, zh-HANT)
│   ├── pages/               # Page-level components
│   │   ├── GamePage/
│   │   │   ├── components/  # Components specific to GamePage
│   │   │   ├── hooks/       # Custom hooks specific to GamePage
│   │   │   └── GamePage.tsx
│   │   └── HomePage/
│   │       └── HomePage.tsx
│   ├── services/            # API service functions (alternatively, utils/api.ts)
│   ├── styles/              # Global styles, themes (style.css)
│   ├── types.ts             # TypeScript type definitions
│   ├── utils/               # Utility functions (e.g., api.ts)
│   ├── App.tsx              # Main application component (routing, layout)
│   ├── main.tsx             # React application entry point
│   └── vite-env.d.ts        # Vite environment variable type definitions
├── .env.example             # Example environment variables
├── .eslintrc.cjs            # ESLint configuration
├── index.html               # Main HTML file
├── package.json             # Project dependencies and scripts
├── tsconfig.json            # TypeScript compiler options
├── tsconfig.node.json       # TypeScript Node specific options
└── vite.config.ts           # Vite configuration


## Prerequisites

* Node.js (v18.x or v20.x recommended - check `package.json` "engines" or `.nvmrc` if present)
* npm (comes with Node.js) or yarn
* A running instance of the [MJKit Backend API](https://github.com/KayiuTommyLI/mjkit-backend)

## Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/KayiuTommyLI/mjkit-frontend.git](https://github.com/KayiuTommyLI/mjkit-frontend.git)
    cd mjkit-frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the root of the project by copying `.env.example` (if it exists) or creating a new one.
    Set the `VITE_API_URL` to point to your running backend instance:
    ```env
    VITE_API_URL=http://localhost:3000
    ```
    (The default in `src/config.ts` is `http://localhost:3000` if `VITE_API_URL` is not set).

## Available Scripts

In the project directory, you can run:

* **`npm run dev` or `yarn dev`**:
    Runs the app in development mode with hot reloading.
    Open [http://localhost:5173](http://localhost:5173) (or the port Vite assigns) to view it in the browser.

* **`npm run build` or `yarn build`**:
    Builds the app for production to the `dist` folder.
    It correctly bundles React in production mode and optimizes the build for the best performance.

* **`npm run lint` or `yarn lint`**:
    Lints the project files using ESLint.

* **`npm run preview` or `yarn preview`**:
    Serves the production build locally from the `dist` folder. This is useful for testing the build before deployment.

## Usage Guide

### Creating a New Game

1.  Navigate to the application's root URL. You will be presented with the game setup page (`HomePage`).
2.  **Configure Players:** Enter names for up to 10 players. Player names must be unique and non-empty. Select a unique color and emoji for each player.
3.  **Set Game Rules:**
    * Choose the **Max Money** (e.g., "30/60").
    * Set the **Max Score Limit** (maximum points a player can win in a single round).
    * Set the **Min Score Limit** (minimum points required for a win).
    * Select the **Score Type Rule** ("Half Money After 5" or "Hot Hot Up").
    * Choose the **Payment Rule** ("One Pay All" or "Everyone Need Pay").
4.  As you adjust rules, the **Score Preview Table** will update to show the monetary value for each score point.
5.  Click **"Create Game"**. This will send the configuration to the backend (`POST /games`) and navigate you to the game dashboard (`/game/:gameId`).

### Managing an Active Game

Once a game is created, you'll be on the `GamePage` for that specific game (`/game/:gameId`).

1.  **Start the Game:** If the game status is "Setting Up", click the **"Start Game"** button. This action (`POST /games/:gameId/start`) activates the game on the backend and generates a `gameMasterToken` which is stored in your browser's `localStorage`. This token authorizes you to make changes to the game.
2.  **View Game Info:** The dashboard displays:
    * Current player names, colors, and balances.
    * The configured game rules.
    * A QR code and a button to copy the game URL for sharing.
    * Player win/loss statistics.
    * A score-to-money reference table.
3.  **Add Round Result:**
    * Click the **"Add Round Result"** button.
    * In the dialog, select the **Winner**.
    * Choose the **Win Type** (Normal, Self-Draw All Pay, Self-Draw One Loser).
    * If not a self-draw, select the **Loser**.
    * Enter the **Score** for the round.
    * Click **"Submit"**. This sends the round data to the backend (`POST /games/:gameId/rounds`) using your `gameMasterToken`. Player balances and round history will update automatically.
4.  **Delete Last Round:**
    * Click the **"Delete Last Round"** button.
    * Confirm the deletion in the dialog. This action (`DELETE /games/:gameId/rounds/latest`) requires the `gameMasterToken`. The last round will be removed, and player balances will be reverted.
5.  **Start New Game (from current game page):**
    * Click the **"New Game Setup"** button.
    * Confirm that you want to end the current game and start a new setup. This will clear the `gameMasterToken` for the current game and redirect you to the `HomePage`.

### Sharing a Game

* **Share URL:** Copy the game URL (e.g., `https://KayiuTommyLI.github.io/mjkit-frontend/#/game/your-game-id`) and send it to other players. They can view the game status and history.
* **QR Code:** Use the QR code displayed on the `GamePage` for others to quickly scan and access the game URL.
* **Game Master:** Only the browser that initiated the "Start Game" (and thus holds the `gameMasterToken` in `localStorage`) can add or delete rounds. If another person opens the URL, they will have read-only access.

## API Interaction

* All backend API calls are managed through the `apiRequest` utility function in `src/utils/api.ts`.
* The base API URL is configured in `src/config.ts` via the `VITE_API_URL` environment variable (defaults to `http://localhost:3000`).
* For actions requiring authorization (adding/deleting rounds, starting a game), the `gameMasterToken` is retrieved from `localStorage` and sent in the `x-game-master-token` HTTP header.
* The `apiRequest` function handles:
    * Constructing the full API endpoint.
    * Setting appropriate HTTP methods and headers (including `Content-Type: application/json` and the auth token).
    * Serializing the request body to JSON.
    * Parsing the JSON response.
    * Basic error handling, including network errors and non-OK HTTP status codes.

**Key Endpoints Used by Frontend:**

* `POST /games`: Create a new game.
* `GET /games/score-preview`: Get score-to-money mapping based on rules.
* `GET /games/:id`: Fetch details of a specific game.
* `POST /games/:id/start`: Start a game and receive the `gameMasterToken`.
* `GET /games/:id/rounds`: Fetch all rounds for a game.
* `POST /games/:id/rounds`: Add a new round to a game (requires `gameMasterToken`).
* `DELETE /games/:id/rounds/latest`: Delete the most recent round (requires `gameMasterToken`).

## Internationalization (i18n)

* The application supports multiple languages using `i18next` and `react-i18next`.
* Configuration is in `src/i18n.ts`.
* Translation files are located in `src/locales/`:
    * `en/translation.json` (English)
    * `zh-Hant/translation.json` (Traditional Chinese)
* The language is detected from `localStorage`, then the browser's navigator, and finally the HTML tag, defaulting to English. Users can switch languages using a language selector component.

## Deployment

### GitHub Pages

The frontend is configured for easy deployment to GitHub Pages.

1.  **Set `VITE_API_URL` for Production:**
    * In your GitHub repository, go to `Settings` > `Secrets and variables` > `Actions`.
    * Create a new repository secret named `VITE_API_URL` and set its value to your deployed backend API URL (e.g., `https://api.yourdomain.com`).

2.  **Vite Configuration:**
    * The `vite.config.ts` file is configured with `base: '/mjkit-frontend/'` (or your repository name). This is crucial for GitHub Pages as projects are typically served from a subpath.
    * ```typescript
        // vite.config.ts
        import { defineConfig } from 'vite'
        import react from '@vitejs/plugin-react'

        export default defineConfig({
          plugins: [react()],
          base: '/mjkit-frontend/', // Or your repository name
        })
        ```

3.  **Routing:**
    * The application uses `HashRouter` from `react-router-dom` in `src/main.tsx`. This is necessary for client-side routing to work correctly on GitHub Pages without needing server-side configuration.
    * ```tsx
        // src/main.tsx
        import { HashRouter as Router } from 'react-router-dom';
        // ...
        ReactDOM.createRoot(document.getElementById('root')!).render(
          <React.StrictMode>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <Router>
                <App />
              </Router>
            </ThemeProvider>
          </React.StrictMode>
        );
        ```

4.  **GitHub Actions Workflow:**
    * A workflow file like `.github/workflows/deploy.yml` can automate the build and deployment process. (Refer to the `Deployment Manual.txt` for an example workflow or create one based on standard Vite GitHub Pages deployment actions).
    * This workflow typically runs on pushes to the `main` branch, builds the application, and deploys the contents of the `dist` folder to the `gh-pages` branch.

5.  **Enable GitHub Pages:**
    * In your GitHub repository, go to `Settings` > `Pages`.
    * Under "Build and deployment", select "GitHub Actions" as the source if using an Actions workflow. If deploying manually or via a different CI, choose the `gh-pages` branch and the `/ (root)` folder.

## Key Components & Hooks

* **`HomePage.tsx`**: Handles game creation and setup.
* **`GamePage.tsx`**: The main dashboard for an active game.
    * **`useGameData.ts`**: Hook to fetch and manage core game data.
    * **`useRoundsData.ts`**: Hook to fetch and manage round history.
    * **`usePlayerStats.ts`**: Hook to calculate and provide player statistics.
    * **`useScoreTable.ts`**: Hook to fetch and manage the score-to-money reference table.
    * **`useDialogs.ts`**: Hook to manage the state of various dialogs (Add Round, Delete Round, New Game Confirmation).
* **`RoundEntryModal.tsx`**: Component for inputting new round details.
* **`PlayerDisplayGroup.tsx`**: Component to display player cards with names, colors, and balances.
* **`GameRulesDisplay.tsx`**: Component to show the configured game rules.
* **`RoundsTable.tsx`**: Component to display the history of rounds.
* **`PlayerStatsDisplay.tsx`**: Component to show player win/loss statistics.
* **`ScoreMoneyTable.tsx`**: Component to display the score-to-money mapping.
* **`ShareGame.tsx`**: Component providing QR code and copy URL functionality.
* **`LanguageSwitcher.tsx`**: Component to allow users to change the display language.
* **`ThemeToggleButton.tsx`**: Component to toggle between light and dark themes.

## Future Work

* **User Authentication:** Allow users to register and log in to save and manage their games.
* **Enhanced Player Management:**
    * Support for more than 4 players (e.g., bench players).
    * Ability to reorder players during a game.
    * Swap active players with benched players.
* **Advanced Game Statistics:**
    * Graphical representation of score trends (e.g., line chart of player balances over rounds).
    * More detailed player summaries and head-to-head stats.
* **Game Restart/Reset:** Option to restart the current game with the same players and rules but reset scores.
* **Real-time Collaboration (Optional):** Using WebSockets for multiple users to interact with the same game simultaneously.
* **Persistent Game Settings:** Save user's preferred default game rules.
* **Improved UI/UX:** Further refinements to user interface and experience.

## Contributing

Contributions are welcome! If you'd like to contribute, please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some feature'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Open a Pull Request.

Please ensure your code follows the existing style and that all tests pass.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details (if one exists, otherwise assume MIT or specify).
