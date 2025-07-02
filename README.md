# Bananagrams React

## Introduction

Welcome to Bananagrams React - my first TypeScript project! This application is a single-player implementation of the popular word game Bananagrams, built with React and TypeScript. As my initial foray into TypeScript, this project demonstrates strong typing, component architecture, and state management in a real-world application.

## Overview

This project is a single-player practice version of the board game Bananagrams, developed using React, TypeScript, and Zustand. It features a clean, scalable architecture separating UI, state management, and game logic with Swedish language support.

## Features

- **Modern Tech Stack:** React, TypeScript, Zustand for state management, and Tailwind CSS for styling
- **Single-Player Mode:** Practice the game with adjustable player counts to simulate different starting tile scenarios
- **Full Game Logic:** Implements core Bananagrams actions like "Skala" (Peel) and "Dumpa" (Dump)
- **Drag and Drop:** Intuitive drag-and-drop interface using React DnD
- **Keyboard Controls:** Full keyboard support for placement, navigation, and game actions
- **Swedish Language Support:** Includes Å, Ä, and Ö letters with appropriate distribution
- **Word Validation:** Checks words against Swedish dictionary (SAOL)
- **Responsive Design:** Playable on different screen sizes
- **Visual Polish:** Animations, transitions, and visual feedback for game actions

## Project Structure

```
bananagrams-react
├── public/
│   ├── index.html
│   └── saol2018clean.csv     # Swedish word dictionary
├── src/
│   ├── components/           # React components
│   │   ├── Board/            # Game board component
│   │   ├── Cell/             # Individual board cell
│   │   ├── Controls/         # Game controls
│   │   ├── PlayerHand/       # Player's tile hand
│   │   └── Tile/             # Individual game tile
│   ├── logic/                # Pure game logic
│   │   ├── gameEngine.ts     # Core game mechanics
│   │   ├── tilePool.ts       # Tile generation and management
│   │   └── wordChecker.ts    # Word validation
│   ├── store/                # State management
│   │   └── useGameStore.ts   # Zustand store
│   ├── types/                # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/                # Utility functions
│   │   └── shuffle.ts        # Array shuffling
│   ├── App.tsx               # Main application component
│   ├── custom.d.ts           # Custom type declarations
│   ├── gameConfig.ts         # Game configuration
│   ├── index.css             # Global styles with Tailwind
│   └── index.tsx             # Application entry point
├── Dockerfile.dev            # Development Docker configuration
├── docker-compose.yml        # Docker Compose setup
├── package.json              # Project dependencies
├── tailwind.config.js        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
└── README.md                 # This file
```

## Setup and Development with Docker

This project is configured to run in a Docker container, which keeps your local machine clean and ensures a consistent development environment.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Running the Application

1. Clone the repository
2. Navigate to the project directory
3. Build and start the services:
   ```bash
   docker-compose up --build
   ```
   The application will be running at `http://localhost:3000`. The development server supports hot-reloading.

### Stopping the Application

To stop the running containers, press `Ctrl+C` in the terminal, and then run:

```bash
docker-compose down
```
## Docker Commands

### Development

```bash
# Start development environment
docker-compose up

# Rebuild and start (after dependency changes)
docker-compose up --build

# Run in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f app
```

## Testing

```bash
# Run tests once
docker-compose run --rm test

# Run tests in watch mode
docker-compose run --rm test npm run test:watch

# Run tests with coverage
docker-compose run --rm test npm run test:coverage

# Run specific tests
docker-compose run --rm test npm test -- -t "search pattern"

# Enter test container for interactive commands
docker-compose run --rm test sh
```

## Production

```bash
# Build production image
docker build -t bananagrams-prod -f Dockerfile.prod .

# Run production container
docker run -p 80:80 bananagrams-prod

# Build and run with docker-compose (create docker-compose.prod.yml first)
docker-compose -f docker-compose.prod.yml up --build
```

## Gameplay

- Select the number of players and click "Start Game"
- Drag tiles from your hand to the board to form interconnected words
- Click "Skala" (Peel) to draw a new tile for all players (in this simulation, just you)
- Click a tile in your hand to "Dumpa" (Dump) it back into the bunch in exchange for three new ones
- Once you've used all your tiles in a valid grid, click "Check Bananas!" to validate your win
- Use keyboard navigation: arrow keys to move, Tab to toggle direction, letters to place tiles
