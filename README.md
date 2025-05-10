# MJKit Frontend

This is the frontend application for **MJKit**, a comprehensive Mahjong scoring system designed to track game scores, manage players, and visualize results. Built with React, TypeScript, Vite, and Material UI, this application provides an intuitive interface for Mahjong players to set up games with custom rules, track rounds and scores in real-time, and view game history. It is designed to work seamlessly with the [MJKit Backend API](https://github.com/KayiuTommyLI/mjkit-backend).

**Live Demo :** `https://KayiuTommyLI.github.io/mjkit-frontend/` 

## Table of Contents

1.  [Core Features](#core-features)
2.  [Technology Stack](#technology-stack)
3.  [Project Structure](#project-structure)
4.  [Prerequisites](#prerequisites)
5.  [Setup and Installation](#setup-and-installation)
6.  [Available Scripts](#available-scripts)
7.  [Usage Guide](#usage-guide)
    * [Creating a New Game (`HomePage`)](#creating-a-new-game-homepage)
    * [Managing an Active Game (`GamePage`)](#managing-an-active-game-gamepage)
    * [Sharing a Game](#sharing-a-game)
8.  [Key Components & Hooks](#key-components--hooks)
9.  [API Interaction](#api-interaction)
10. [Authorization (`gameMasterToken`)](#authorization-gamemastertoken)
11. [Internationalization (i18n)](#internationalization-i18n)
12. [Deployment (GitHub Pages)](#deployment-github-pages)
13. [Future Work](#future-work)
14. [Contributing](#contributing)
15. [Contact](#contact)
16. [License](#license)

## Core Features

### Game Setup (`HomePage.tsx`)
* **Player Configuration**:
    * Define 4 - 10 initial players with custom names and unique colors and emoji. Player names must be unique and non-empty.
* **Game Rules Customization**:
    * Define **Max Money** (e.g., "30/60", "50/100", "100/200", "200/400", "300/600", "500/1000", "1000/2000").
    * Set **Max Score Limit** (maximum points/Faan a player can win in a single round, e.g., 5, 8, 10, 13).
    * Set **Min Score Limit** (minimum points/Faan required for a win, e.g., 1, 2, 3).
    * Select **Score Type Rule**:
        * "Half Money After 5"
        * "Hot Hot Up"
    * Choose **Payment Rule** (for `NORMAL` wins):
        * "One Pay All" (Only the loser pays the winner)
        * "Everyone Need Pay" (Loser pays full, others pay half to the winner)
    * Optional: Provide a **Game Name** for easier identification.
    * **Real-time Score Preview**: A table updates dynamically to show the monetary value for each score point based on the currently selected rules, by calling `GET /games/score-preview`.

### Game Management (`GamePage/GamePage.tsx`)
* **Game Dashboard**:
    * Comprehensive overview of the current game status, including player names, colors, and current balances.
    * Displays the configured game rules.
    * Quick access to actions like adding a round, deleting the last round, and starting a new game setup.
* **Round Recording (`RoundEntryModal.tsx` via `useDialogs` hook):**
    * Intuitive interface to add new round results.
    * Select the **Winner**.
    * Choose the **Win Type**: "NORMAL", "SELF_DRAW_ALL_PAY", "SELF_DRAW_ONE_PAY".
    * If not a self-draw, select the **Loser**.
    * Enter the **Score** (Faan) for the round.
    * Submits data to `POST /games/:gameId/rounds`. Player balances and history update automatically.
* **Game History (`RoundsTable.tsx` via `useRoundsData` hook):**
    * Displays a log of all played rounds, showing winner, loser (if applicable), score, win type, and per-player balance changes for that round.
    * Fetches data from `GET /games/:id/rounds`.
* **Delete Last Round (via `useDialogs` and `useRoundsData` hooks):**
    * Option to delete the most recently added round.
    * Requires confirmation.
    * Calls `DELETE /games/:id/rounds/latest` using the `gameMasterToken`. Player balances are reverted.
* **Start New Game Setup (via `useDialogs` hook):**
    * Option to end the current game and return to the `HomePage` to configure a new game.
    * Clears the current `gameMasterToken` from `localStorage`.

### Sharing & Access (`ShareGame.tsx`)
* Games are accessed via a unique Game ID in the URL (e.g., `/#/game/:gameId` due to `HashRouter`).
* **Share Game URL**: Button to copy the current game URL to the clipboard using `copy-to-clipboard`.
* **QR Code Generation**: Displays a QR code (using `react-qr-code`) for the current game URL, allowing others to easily scan and view the game.
* Administrative actions (adding/deleting rounds, starting a new game) are protected by a `gameMasterToken` (see [Authorization](#authorization-gamemastertoken) section).

### Player Statistics (`PlayerStatsDisplay.tsx` via `usePlayerStats` hook)
* Displays win/loss statistics for each player based on the round history.
* Categorizes wins and losses by type (e.g., self-draw wins, normal wins, lost by self-draw, etc.).

### Reference Tools (`ScoreMoneyTable.tsx` via `useScoreTable` hook)
* Displays a score-to-money conversion table based on the active game's rules.
* Provides a quick reference for players during gameplay.

### User Interface
* **Theme Toggle**: Option to switch between light and dark themes using Material UI's theming capabilities, likely managed by a `ThemeContext`.
* **Responsive Design**: Interface designed to be usable across different screen sizes.

### Internationalization (`i18n.ts`)
* Support for multiple languages:
    * English (en) - `src/locales/en/translation.json`
    * Traditional Chinese (zh-HANT) - `src/locales/zh-Hant/translation.json`
* Uses `i18next` and `react-i18next`. Language is detected from `localStorage`, then browser navigator, falling back to English.
* A `LanguageSwitcher` component allows users to change the language.

## Technology Stack

* **Framework/Library:** React (version from `package.json`, e.g., ^18.2.0)
* **Language:** TypeScript
* **Build Tool:** Vite
* **UI Components:** Material-UI (MUI Core, MUI Icons)
* **Routing:** React Router DOM (version from `package.json`, e.g., ^6.22.3), using `HashRouter` for GitHub Pages compatibility.
* **State Management:** React Hooks (`useState`, `useEffect`, `useContext`), custom hooks for page-specific logic.
* **API Client:** Browser `fetch` API, wrapped in a custom `apiRequest` utility (`src/utils/api.ts`).
* **Internationalization:** `i18next`, `react-i18next`, `i18next-browser-languagedetector`.
* **QR Code Generation:** `react-qr-code`
* **Date/Time Manipulation:** `date-fns`
* **Unique IDs:** `uuid`
* **Clipboard:** `copy-to-clipboard`
* **Styling:** CSS, MUI's styling solutions (e.g., `styled`, `sx` prop, `ThemeProvider`).
* **Drag & Drop:** (Not explicitly found in provided frontend file structure for player reordering in setup; if `@dnd-kit` is used, it should be listed).

## Project Structure


mjkit-frontend/
├── public/                  # Static assets (e.g., favicon.ico, images)
│   └── image/
│       └── icon.png         # Application icon
├── src/
│   ├── assets/              # Static assets like images, fonts used within components
│   ├── components/          # Globally reusable UI components (e.g., ConfirmationDialog, LanguageSwitcher, ThemeToggleButton)
│   ├── config.ts            # Application configuration (API_URL)
│   ├── contexts/            # React Context providers (e.g., ThemeContext)
│   ├── hooks/               # General-purpose custom React hooks
│   ├── i18n.ts              # i18next configuration and initialization
│   ├── locales/             # Translation JSON files
│   │   ├── en/
│   │   │   └── translation.json
│   │   └── zh-Hant/
│   │       └── translation.json
│   ├── pages/               # Page-level components, representing distinct views/routes
│   │   ├── HomePage/
│   │   │   └── HomePage.tsx     # Game setup page
│   │   └── GamePage/
│   │       ├── components/      # Components specific to GamePage (e.g., PlayerDisplayGroup, RoundEntryModal, RoundsTable, ScoreMoneyTable, ShareGame, PlayerStatsDisplay)
│   │       ├── hooks/           # Custom hooks specific to GamePage (useDialogs, useGameData, usePlayerStats, useRoundsData, useScoreTable)
│   │       └── GamePage.tsx     # Main game dashboard page
│   ├── styles/              # Global styles, MUI theme definitions
│   ├── types.ts             # Global TypeScript type definitions and interfaces
│   ├── utils/               # Utility functions (e.g., api.ts for API requests)
│   ├── App.tsx              # Root application component (sets up routing, theme, global layout)
│   ├── main.tsx             # React application entry point (renders App into the DOM)
│   └── vite-env.d.ts        # Vite environment variable type definitions
├── .env.example             # Example environment variables file
├── .eslintrc.cjs            # ESLint configuration file
├── .gitignore               # Specifies intentionally untracked files that Git should ignore
├── index.html               # Main HTML template for Vite
├── package.json             # Project metadata, dependencies, and scripts
├── tsconfig.json            # TypeScript compiler options for the project
├── tsconfig.node.json       # TypeScript compiler options for Node.js specific files (e.g., vite.config.ts)
└── vite.config.ts           # Vite build tool configuration


## Prerequisites

* Node.js (v18.x or v20.x recommended - check `package.json` "engines" or `.nvmrc` if present)
* npm (comes with Node.js) or yarn/pnpm
* A running instance of the [MJKit Backend API](https://github.com/KayiuTommyLI/mjkit-backend).

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
    # yarn install
    # or
    # pnpm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the root of the project by copying `.env.example` (if it exists) or creating a new one.
    Set the `VITE_API_URL` to point to your running backend instance:
    ```env
    VITE_API_URL=http://localhost:3000
    ```
    If `VITE_API_URL` is not set in `.env`, the application will default to `http://localhost:3000` as specified in `src/config.ts`.

## Available Scripts

In the project directory, you can run the following scripts (defined in `package.json`):

* **`npm run dev`**:
    Runs the app in development mode using Vite's development server with hot module replacement (HMR).
    Open [http://localhost:5173](http://localhost:5173) (or the port Vite assigns) to view it in the browser.

* **`npm run build`**:
    Builds the app for production to the `dist` folder.
    It bundles React in production mode and optimizes the build for the best performance.

* **`npm run lint`**:
    Lints the project's TypeScript and JavaScript files using ESLint to check for code quality and style issues.

* **`npm run preview`**:
    Serves the production build from the `dist` folder locally. This is useful for testing the build before deployment.

* **`npx tsc --noEmit`** (Manual type check):
    Runs the TypeScript compiler to check for type errors across the project without generating JavaScript files.

## Usage Guide

### Creating a New Game (`HomePage`)

1.  Navigate to the application's root URL (e.g., `http://localhost:5173`). You will land on the `HomePage`.
2.  **Configure Players:** Enter names for the 4 players. Player names must be unique and non-empty. Select a unique color for each player.
3.  **Set Game Rules:**
    * Choose the **Max Money**, **Max Score Limit**, **Min Score Limit**.
    * Select the **Score Type Rule** ("Half Money After 5" or "Hot Hot Up").
    * Choose the **Payment Rule** ("One Pay All" or "Everyone Need Pay").
    * Optionally, enter a **Game Name**.
4.  The **Score Preview Table** will update in real-time based on your rule selections.
5.  Click **"Create Game"**. This sends the configuration to the backend (`POST /games`) and, upon success, navigates you to the `GamePage` for the newly created game (URL will be `/#/game/:gameId`).

### Managing an Active Game (`GamePage`)

Once a game is created, you'll be on the `GamePage` for that specific game.

1.  **Start the Game:** If the game status is "Setting Up" (fetched from `GET /games/:id`), click the **"Start Game"** button. This action (`POST /games/:gameId/start`) activates the game on the backend and generates a `gameMasterToken` which is stored in your browser's `localStorage`. This token authorizes you to make administrative changes to the game.
2.  **View Game Info:** The dashboard displays:
    * Current player names, colors, and balances.
    * The configured game rules.
    * A QR code and a button to copy the game URL for sharing.
    * Player win/loss statistics.
    * A score-to-money reference table.
3.  **Add Round Result:**
    * Click the **"Add Round Result"** button (managed by `useDialogs`).
    * In the `RoundEntryModal`, select the **Winner**.
    * Choose the **Win Type** ("NORMAL", "SELF_DRAW_ALL_PAY", "SELF_DRAW_ONE_PAY").
    * If applicable (not "SELF_DRAW_ALL_PAY"), select the **Loser**.
    * Enter the **Score** (Faan) for the round.
    * Click **"Submit"**. This sends the round data to `POST /games/:gameId/rounds` using your `gameMasterToken`. Player balances and round history will refresh.
4.  **Delete Last Round:**
    * Click the **"Delete Last Round"** button (managed by `useDialogs`).
    * Confirm the deletion. This action (`DELETE /games/:gameId/rounds/latest`) requires the `gameMasterToken`. The last round will be removed from the history, and player balances will be reverted.
5.  **Start New Game Setup:**
    * Click the **"New Game Setup"** button (managed by `useDialogs`).
    * Confirm that you want to end the current game. This will clear the `gameMasterToken` for the current game from `localStorage` and redirect you to the `HomePage`.

### Sharing a Game

* **Share URL:** Use the "Copy URL" button on the `GamePage` to copy the game's URL (e.g., `https://KayiuTommyLI.github.io/mjkit-frontend/#/game/your-game-id`) to the clipboard.
* **QR Code:** The `GamePage` displays a QR code. Other players can scan this with their mobile devices to quickly navigate to the game URL.
* **Read-Only Access:** Anyone with the URL can view the game's progress and history.
* **Game Master Actions:** Only the browser that initiated the "Start Game" (and thus holds the `gameMasterToken` in `localStorage`) can perform administrative actions like adding or deleting rounds.

## Key Components & Hooks

* **Pages:**
    * `HomePage.tsx`: For creating and configuring new games.
    * `GamePage.tsx`: The main dashboard for viewing and managing an active game.
* **`GamePage` Specific Components (`src/pages/GamePage/components/`):**
    * `PlayerDisplayGroup.tsx`: Displays cards for each player showing name, color, emoji, and current balance.
    * `RoundEntryModal.tsx`: Dialog for inputting new round details.
    * `RoundsTable.tsx`: Table displaying the history of all played rounds.
    * `ScoreMoneyTable.tsx`: Shows the score-to-money conversion based on game rules.
    * `ShareGame.tsx`: Provides QR code and copy URL functionality.
    * `PlayerStatsDisplay.tsx`: Shows win/loss statistics for players.
    * `GameRulesDisplay.tsx`: Shows the configured rules for the current game.
* **`GamePage` Specific Hooks (`src/pages/GamePage/hooks/`):**
    * `useGameData.ts`: Fetches and manages core game data, handles starting the game.
    * `useRoundsData.ts`: Fetches and manages round history, handles adding and deleting rounds.
    * `usePlayerStats.ts`: Calculates and provides player statistics from round data.
    * `useScoreTable.ts`: Fetches and manages the score-to-money reference table data.
    * `useDialogs.ts`: Manages the state and logic for various dialogs on the `GamePage` (Add Round, Delete Round Confirmation, New Game Confirmation).
* **Global Components (`src/components/`):**
    * `ConfirmationDialog.tsx`: A reusable dialog for confirming actions.
    * `LanguageSwitcher.tsx`: Allows users to change the application language.
    * `ThemeToggleButton.tsx`: Allows users to toggle between light and dark UI themes.
* **Layout & Navigation:**
    * `App.tsx`: Sets up the main application layout, theme, and routing.
    * Components for header/navigation might exist within `App.tsx` or as separate components.

## API Interaction

* All backend API calls are managed through the `apiRequest` utility function found in `src/utils/api.ts`.
* The base API URL is configured in `src/config.ts` and is determined by the `VITE_API_URL` environment variable (defaults to `http://localhost:3000` if the variable is not set).
* For administrative actions (e.g., starting a game, adding/deleting rounds), the `gameMasterToken` is retrieved from `localStorage` and included in the `x-game-master-token` HTTP header of the request.
* The `apiRequest` function handles:
    * Constructing the full API endpoint.
    * Setting appropriate HTTP methods (`GET`, `POST`, `PATCH`, `DELETE`) and headers (including `Content-Type: application/json` and the `x-game-master-token`).
    * Serializing the request body to JSON for `POST` and `PATCH` requests.
    * Parsing the JSON response from the backend.
    * Basic error handling, including network errors and non-OK HTTP status codes from the API.

**Key Backend Endpoints Consumed by the Frontend:**

* `POST /games`: To create a new game with initial settings and players.
* `GET /games/score-preview`: To fetch the score-to-money mapping based on selected rules during game setup.
* `GET /games/:id`: To fetch detailed information about a specific game (settings, players, current balances, rounds).
* `PATCH /games/:id/start`: To mark a game as active and obtain the `gameMasterToken`.
* `GET /games/:id/rounds`: To fetch the history of all rounds played in a game.
* `POST /games/:id/rounds`: To add a new round result to a game (requires `gameMasterToken`).
* `DELETE /games/:id/rounds/latest`: To delete the most recently added round (requires `gameMasterToken`).
    *(Note: The original frontend README mentioned `DELETE /games/:gameId/rounds/:roundId` and `PATCH /games/:gameId/players/update-order`. If these are used, they should be listed. The current code analysis focuses on `delete latest`.)*

## Authorization (`gameMasterToken`)

The frontend uses a simple token-based mechanism for authorizing administrative actions on a game:

1.  When a game is successfully started via `PATCH /games/:id/start`, the backend responds with a `game_master_token`.
2.  The frontend stores this token in the browser's `localStorage`. The key used is typically `gameMasterToken` or `gameMasterToken_${gameId}` (verify exact key in `useGameData.ts` or where the token is stored).
3.  For subsequent administrative actions related to that game (like adding a round or deleting the last round), this token is retrieved from `localStorage` and sent in the `x-game-master-token` HTTP header.
4.  If the token is missing or invalid, the backend will reject these administrative requests.
5.  Viewing game data is generally public and does not require this token.
6.  The `gameMasterToken` is cleared from `localStorage` when the user explicitly starts a "New Game Setup" from an active game page.
7.  There is currently no explicit "admin rights transfer" feature beyond sharing the game URL; administrative control is tied to the browser that holds the token.

## Internationalization (i18n)

* The application supports multiple languages using `i18next` and `react-i18next`.
* Configuration is located in `src/i18n.ts`.
* Supported languages and their translation files:
    * English (en): `src/locales/en/translation.json`
    * Traditional Chinese (zh-HANT): `src/locales/zh-Hant/translation.json` (Note: original README mentioned `zh`, but file is `zh-Hant`).
* Language detection is configured using `i18next-browser-languagedetector` to check `localStorage`, then the browser's `navigator` settings, and finally the `htmlTag`, with English as a fallback.
* A `LanguageSwitcher.tsx` component allows users to manually change the display language.

## Deployment (GitHub Pages)

The frontend is configured for deployment to GitHub Pages. The `Deployment Manual.txt` provides detailed steps, summarized here:

1.  **Environment Variable for Production API:**
    * In your GitHub repository settings (`Settings` > `Secrets and variables` > `Actions`), create a repository secret named `VITE_API_URL`.
    * Set its value to the URL of your deployed MJKit Backend API (e.g., `https://api.yourdomain.com`). This secret will be used by the GitHub Actions workflow during the build process.

2.  **Vite Configuration (`vite.config.ts`):**
    * The `base` path in `vite.config.ts` must be set to your repository name if deploying to `https://<username>.github.io/<repository-name>/`. For example:
        ```typescript
        // vite.config.ts
        import { defineConfig } from 'vite';
        import react from '@vitejs/plugin-react';

        export default defineConfig(({ command }) => ({
          plugins: [react()],
          base: command === 'build' ? '/mjkit-frontend/' : '/', // Adjust '/mjkit-frontend/' to your repo name
        }));
        ```

3.  **Routing (`src/main.tsx`):**
    * The application must use `HashRouter` from `react-router-dom` instead of `BrowserRouter`. This is essential for client-side routing to work correctly on GitHub Pages, as it doesn't support server-side fallbacks for SPAs by default.
        ```tsx
        // src/main.tsx
        import React from 'react';
        import ReactDOM from 'react-dom/client';
        import { HashRouter as Router } from 'react-router-dom'; // Use HashRouter
        import App from './App';
        // ... other imports like theme, CssBaseline ...

        ReactDOM.createRoot(document.getElementById('root')!).render(
          <React.StrictMode>
            {/* ThemeProvider and other global providers */}
            <Router>
              <App />
            </Router>
          </React.StrictMode>
        );
        ```

4.  **GitHub Actions Workflow (`.github/workflows/deploy.yml`):**
    * Set up a GitHub Actions workflow to automate the build and deployment process.
    * The workflow should:
        * Trigger on pushes to the `main` (or `master`) branch.
        * Check out the code.
        * Set up Node.js.
        * Install dependencies (`npm ci` or `yarn install --frozen-lockfile`).
        * Build the application (`npm run build`), passing the `VITE_API_URL` secret as an environment variable to the build process.
        * Use an action like `peaceiris/actions-gh-pages` to deploy the contents of the `dist` folder to the `gh-pages` branch of your repository.

5.  **GitHub Pages Settings:**
    * In your GitHub repository, go to `Settings` > `Pages`.
    * Under "Build and deployment", select "Deploy from a branch" as the source.
    * Choose the `gh-pages` branch and the `/ (root)` folder as the source for GitHub Pages.
    * Once the `gh-pages` branch is populated by the GitHub Action, your site will be live at `https://<username>.github.io/<repository-name>/`.

## Future Work

* **Enhanced Player Management:**
    * Ability to edit player details (name, color, emoji) mid-game.
* **Advanced Game Statistics & Visualization**:
    * More detailed individual player performance statistics.
* **User Accounts & Authentication:**
    * Full user registration/login system to associate games with user accounts.
    * Ability for users to save their game history and preferences.
* **Advanced Game Options**:
    * Custom scoring rules editor.
    * Presets for different Mahjong rule sets (e.g., Hong Kong, Riichi, Chinese Classical).
* **User Experience Enhancements**:
    * More animations and transitions for a smoother feel.
    * Sound effects for game actions (optional).
    * Improved accessibility.
* **Offline Support (PWA features):**
    * Allow basic functionality or viewing when offline using service workers and local storage/IndexedDB.

## Contributing

Contributions to MJKit Frontend are welcome! Please follow these general steps:

1.  Fork the repository.
2.  Create a new feature branch (`git checkout -b feature/your-amazing-feature`).
3.  Make your changes, adhering to the existing code style and conventions.
4.  Write unit or integration tests for new functionality where applicable.
5.  Ensure all tests pass and the linter (`npm run lint`) reports no errors.
6.  Commit your changes (`git commit -m 'Add some amazing feature'`).
7.  Push to the branch (`git push origin feature/your-amazing-feature`).
8.  Open a Pull Request against the `main` branch of the original repository.

## Contact

For feedback, suggestions, or bug reports, please open an issue on the GitHub repository or contact: `mjkitdeveloper@gmail.com` .

## License

This project is typically licensed under the MIT License. Please include a `LICENSE` file in the root of your project.
