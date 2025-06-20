# Bananagrams React

## Overview

This project is a single-player practice version of the board game Bananagrams, developed using React, TypeScript, and Zustand. It features a clean, scalable architecture separating UI, state management, and game logic.

## Features

- **Modern Tech Stack:** React, TypeScript, Zustand, and Tailwind CSS.
- **Single-Player Mode:** Practice the game with adjustable player counts to simulate different starting tile scenarios.
- **Full Game Logic:** Implements core Bananagrams actions like "Peel" (Skala) and "Dump" (Dumpa).
- **Separation of Concerns:**
  - **UI Components:** For rendering the board, tiles, and controls.
  - **Zustand Store:** A single source of truth for all game state.
  - **Pure Logic Modules:** Game rules, tile management, and word checking are handled in isolated, testable functions.

## Project Structure

```
bananagrams-react
├── public/
│   └── words.json         # Word dictionary for validation
├── src/
│   ├── components/        # React components (Board, Tile, etc.)
│   ├── logic/             # Pure game logic (gameEngine, tilePool, wordChecker)
│   ├── store/             # Zustand store for state management
│   ├── types/             # Shared TypeScript types
│   ├── utils/             # Utility functions (e.g., shuffle)
│   ├── App.tsx            # Main application component
│   ├── main.tsx           # Application entry point
│   └── index.css          # Tailwind CSS styles
├── tailwind.config.js     # Tailwind CSS configuration
├── package.json           # Project dependencies
└── README.md              # This file
```

## Setup and Development with Docker

This project is configured to run in a Docker container, which keeps your local machine clean and ensures a consistent development environment.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Running the Application

1.  Clone the repository.
2.  Navigate to the project directory.
3.  Build and start the services:
    ```bash
    docker-compose up --build
    ```
    The application will be running at `http://localhost:3000`. The development server supports hot-reloading.

### Stopping the Application

To stop the running containers, press `Ctrl+C` in the terminal, and then run:

```bash
docker-compose down
```

## Gameplay

- Select the number of players and click "Start Game".
- Drag tiles from your hand to the board to form interconnected words.
- Click "Peel" to draw a new tile for all players (in this simulation, just you).
- Click a tile in your hand to "Dump" it back into the bunch in exchange for three new ones.
- Once you've used all your tiles in a valid grid, click "Check Bananas!" to validate your win.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.
