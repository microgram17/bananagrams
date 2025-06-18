# Bananagrams React

## Overview
This project is a single-player practice version of the board game Bananagrams, developed using React. It follows the S.A.O.L word rules and includes features for simulating different player counts, managing tiles, and providing an engaging gameplay experience.

## Features
- Single-player mode with adjustable player counts.
- Tile management with actions like "skala" and "dumpa".
- Adherence to S.A.O.L word rules for valid word formation.
- Unit tests for components and hooks to ensure functionality and reliability.

## Project Structure
```
bananagrams-react
├── src
│   ├── __tests__          # Contains unit tests for components and hooks
│   ├── components         # UI components for the game
│   ├── hooks              # Custom hooks for game logic
│   ├── lib                # Game logic and word list
│   ├── types              # TypeScript types and interfaces
│   ├── App.tsx           # Main application component
│   └── main.tsx          # Entry point of the application
├── .dockerignore          # Specifies files to ignore in Docker build context
├── docker-compose.yml     # Docker Compose configuration for development
├── Dockerfile.dev         # Dockerfile for the development environment
├── package.json           # Project metadata and dependencies
├── tsconfig.json          # TypeScript configuration
└── README.md              # Project documentation
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
    The application will be running at `http://localhost:3000`. The development server supports hot-reloading, so changes to the source code will be reflected in the browser automatically.

### Stopping the Application
To stop the running containers, press `Ctrl+C` in the terminal, and then run:
```bash
docker-compose down
```

## Running Tests
To run the unit tests, execute the following command in a new terminal while the application container is running:
```bash
docker-compose exec app npm test
```

## Gameplay Rules
- Players draw tiles and attempt to create valid words on the board.
- Use the "skala" action to draw additional tiles or "dumpa" to discard unwanted tiles.
- Ensure all words formed adhere to the S.A.O.L word rules.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.