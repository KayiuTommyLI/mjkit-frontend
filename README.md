# MJKit Frontend

## Description

This is the frontend application for MJKit, a tool designed to help track scores and manage Mahjong games. It allows users to set up new games with custom rules and view the status of ongoing games. Built with React, TypeScript, Vite, and Material UI.

## Features

*   **Game Setup:** Configure new Mahjong games ([`src/pages/GameSetupPage.tsx`](src/pages/GameSetupPage.tsx)):
    *   Set player names and assign unique colors.
    *   Define game rules: Max Money, Max Score (Fan), Min Score (Fan).
    *   Choose scoring rules (e.g., Half Money After 5).
    *   Optional game naming.
    *   Real-time score preview based on selected rules (fetches from `/games/score-preview`).
    *   Input validation for player names and score limits.
*   **Game Display:** View details of an active game ([`src/pages/GamePage.tsx`](src/pages/GamePage.tsx)):
    *   Fetches game data using the game ID from the URL (`/games/:gameId`).
    *   Displays game name, status, and rules (Max Score, Max Money).
    *   Lists active players with their names, colors, and current balances.
    *   Handles loading and error states during data fetching.
*   **Routing:** Uses `react-router-dom` for navigation between the setup page (`/`) and the game page (`/game/:gameId`) ([`src/App.tsx`](src/App.tsx)).
*   **Styling:** Uses Material UI components for the user interface and includes base styling from [`src/style.css`](src/style.css).

## Tech Stack

*   **Framework:** React 19
*   **Language:** TypeScript
*   **Build Tool:** Vite
*   **UI Library:** Material UI (MUI)
*   **Routing:** React Router DOM v7
*   **State Management:** React Hooks (`useState`, `useEffect`)
*   **Utility:** UUID for generating unique IDs (during setup payload creation)

## Setup and Installation

1.  **Clone the repository:**
    ```sh
    git clone <your-repository-url>
    cd mjkit-frontend
    ```
2.  **Install dependencies:**
    ```sh
    npm install
    ```
    *(Or `yarn install` or `pnpm install`)*

## Available Scripts

Based on [`package.json`](package.json):

*   **Run in Development Mode:**
    ```sh
    npm run dev
    ```
    Starts the Vite development server, usually at `http://localhost:5173`.

*   **Build for Production:**
    ```sh
    npm run build
    ```
    Compiles TypeScript and builds the application for production in the `dist` folder.

*   **Preview Production Build:**
    ```sh
    npm run preview
    ```
    Serves the production build locally to preview it.

## Usage

1.  Start the development server (`npm run dev`).
2.  Open your browser to the provided local URL.
3.  You will land on the **Game Setup Page** ([`src/pages/GameSetupPage.tsx`](src/pages/GameSetupPage.tsx)).
4.  Configure player names, colors, and game rules. Observe the score preview update.
5.  Click "Create Game". If successful, you will be redirected to the **Game Page** ([`src/pages/GamePage.tsx`](src/pages/GamePage.tsx)) for the newly created game.
6.  The Game Page displays the current state of the game.

## API Interaction

The frontend interacts with a backend API (expected at `http://localhost:3000` based on current code):

*   `POST /games`: Creates a new game using settings from the setup page ([`src/pages/GameSetupPage.tsx`](src/pages/GameSetupPage.tsx)).
*   `GET /games/score-preview`: Fetches the score-to-money mapping based on rule parameters ([`src/pages/GameSetupPage.tsx`](src/pages/GameSetupPage.tsx)).
*   `GET /games/:gameId`: Retrieves details for a specific game ([`src/pages/GamePage.tsx`](src/pages/GamePage.tsx)).

## Future Work (Based on TODOs)

*   Implement functionality to add round results on the [`src/pages/GamePage.tsx`](src/pages/GamePage.tsx).
*   Display round history (potentially in a table).
*   Visualize score progression (e.g., a graph).
*   Handle bench players (display or management).