import { create } from 'zustand';
import {
  Board,
  Tile,
  GameStatus,
  DraggedItem,
  Position,
  Letter,
} from '../types';
import { BOARD_SIZE, getStartingTileCount } from '../gameConfig';

// Helper function to create an empty board
const createInitialBoard = (): Board =>
  Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(null));

// prettier-ignore
const TILE_DISTRIBUTION: { [key in Letter]: number } = { 'A': 13, 'B': 3, 'C': 3, 'D': 5, 'E': 12, 'F': 2, 'G': 4, 'H': 2, 'I': 10, 'J': 1, 'K': 3, 'L': 5, 'M': 3, 'N': 8, 'O': 5, 'P': 3, 'R': 7, 'S': 8, 'T': 9, 'U': 4, 'V': 2, 'X': 1, 'Y': 2, 'Ä': 2, 'Ö': 2, 'Å': 2 };

// Helper to create the initial pool of tiles
const createTilePool = (): Tile[] => {
  let id = 0;
  return Object.entries(TILE_DISTRIBUTION).flatMap(([letter, count]) =>
    Array(count)
      .fill(null)
      .map(() => ({ id: `tile-${id++}`, letter: letter as Letter }))
  );
};

export interface GameState {
  status: GameStatus;
  board: Board;
  playerHand: Tile[];
  tilePool: Tile[];
  message: string;
  playerCount: number;
}

export interface GameActions {
  setPlayerCount: (count: number) => void;
  startGame: () => void;
  moveTile: (item: DraggedItem, destination: Position | 'hand') => void;
  skala: () => void;
  dumpa: (tileToDump: Tile) => void;
  checkWinCondition: () => Promise<void>;
}

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  status: 'pre-game',
  board: createInitialBoard(),
  playerHand: [],
  tilePool: [],
  message: 'Select player count and start the game!',
  playerCount: 1,

  setPlayerCount: (count) => set({ playerCount: count }),

  startGame: () => {
    const { playerCount } = get();
    const tilePool = createTilePool();
    // Shuffle the pool
    for (let i = tilePool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tilePool[i], tilePool[j]] = [tilePool[j], tilePool[i]];
    }

    const tileCount = getStartingTileCount(playerCount);
    const playerHand = tilePool.splice(0, tileCount);

    set({
      status: 'in-progress',
      board: createInitialBoard(),
      tilePool,
      playerHand,
      message: 'Game started! Build your word grid.',
    });
  },

  moveTile: (item, destination) => {
    set((state) => {
      const { tile: draggedTile, source } = item;

      // No change if a tile is dropped back onto its exact starting cell
      if (
        typeof source !== 'string' &&
        typeof destination !== 'string' &&
        source.x === destination.x &&
        source.y === destination.y
      ) {
        return {}; // No-op to prevent unnecessary re-renders
      }

      const newBoard = state.board.map((row) => [...row]);
      let newPlayerHand = [...state.playerHand];

      // Handle the three distinct cases for moving a tile
      if (source === 'hand' && typeof destination !== 'string') {
        // CASE 1: From the Hand to the Board
        const tileAtDestination = newBoard[destination.y][destination.x];

        // Remove the dragged tile from the hand
        newPlayerHand = newPlayerHand.filter((t) => t.id !== draggedTile.id);
        // Place the dragged tile on the board
        newBoard[destination.y][destination.x] = draggedTile;

        // If a tile was on that cell, return it to the hand
        if (tileAtDestination) {
          newPlayerHand.push(tileAtDestination);
        }
      } else if (typeof source !== 'string' && destination === 'hand') {
        // CASE 2: From the Board to the Hand
        // Remove the tile from the board
        newBoard[source.y][source.x] = null;
        // Add the tile to the hand (if not already there)
        if (!newPlayerHand.some(t => t.id === draggedTile.id)) {
            newPlayerHand.push(draggedTile);
        }
      } else if (typeof source !== 'string' && typeof destination !== 'string') {
        // CASE 3: From the Board to another cell on the Board (A SWAP)
        const tileAtDestination = newBoard[destination.y][destination.x];

        // Place the dragged tile at its new location
        newBoard[destination.y][destination.x] = draggedTile;
        // Place the tile that was at the destination into the source cell
        newBoard[source.y][source.x] = tileAtDestination;
      }

      return { board: newBoard, playerHand: newPlayerHand, message: '' };
    });
  },

  skala: () => {
    set((state) => {
      if (state.tilePool.length === 0) {
        return { message: 'No more tiles to peel!' };
      }
      const newTile = state.tilePool.pop()!;
      return {
        playerHand: [...state.playerHand, newTile],
        tilePool: [...state.tilePool],
        message: 'Peeled 1 tile!',
      };
    });
  },

  dumpa: (tileToDump) => {
    set((state) => {
      if (state.tilePool.length < 3) {
        return { message: 'Not enough tiles in the pool to dump.' };
      }
      const newHand = state.playerHand.filter((t) => t.id !== tileToDump.id);
      const newTiles = state.tilePool.splice(0, 3);
      newHand.push(...newTiles);

      // Return dumped tile to pool and shuffle
      const newPool = [...state.tilePool, tileToDump];
      for (let i = newPool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newPool[i], newPool[j]] = [newPool[j], newPool[i]];
      }

      return {
        playerHand: newHand,
        tilePool: newPool,
        message: 'Dumped 1 tile for 3 new ones.',
      };
    });
  },

  checkWinCondition: async () => {
    const { board, playerHand } = get();

    if (playerHand.length > 0) {
      set({ message: 'You must use all your tiles to win!' });
      return;
    }

    const tilesOnBoard: { tile: Tile; pos: Position }[] = [];
    board.forEach((row, y) =>
      row.forEach((tile, x) => {
        if (tile) tilesOnBoard.push({ tile, pos: { x, y } });
      })
    );

    if (tilesOnBoard.length === 0) {
      set({ message: 'Board is empty. Nothing to check.' });
      return;
    }

    try {
      const response = await fetch('/words.json');
      if (!response.ok) throw new Error('Dictionary not found');
      const wordData = await response.json();
      const wordSet = new Set(wordData.words.map((w: string) => w.toUpperCase()));

      const invalidWords: string[] = [];
      const foundWords = new Set<string>();

      // Parse horizontal and vertical words
      for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
          // Horizontal
          if (board[y][x] && (x === 0 || !board[y][x - 1])) {
            let word = '';
            let currentX = x;
            while (currentX < BOARD_SIZE && board[y][currentX]) {
              word += board[y][currentX]!.letter;
              currentX++;
            }
            if (word.length > 1) {
              foundWords.add(word);
              if (!wordSet.has(word)) invalidWords.push(word);
            }
          }
          // Vertical
          if (board[y][x] && (y === 0 || !board[y - 1][x])) {
            let word = '';
            let currentY = y;
            while (currentY < BOARD_SIZE && board[currentY][x]) {
              word += board[currentY][x]!.letter;
              currentY++;
            }
            if (word.length > 1) {
              foundWords.add(word);
              if (!wordSet.has(word)) invalidWords.push(word);
            }
          }
        }
      }

      if (invalidWords.length > 0) {
        set({ message: `Invalid words: ${[...new Set(invalidWords)].join(', ')}` });
        return;
      }

      if (foundWords.size === 0 && tilesOnBoard.length > 1) {
        set({ message: "Tiles must form words of at least 2 letters." });
        return;
      }

      // Check for connectivity using BFS
      const toVisit = [tilesOnBoard[0].pos];
      const visited = new Set<string>([`${toVisit[0].x},${toVisit[0].y}`]);
      const tilePositions = new Set(tilesOnBoard.map(t => `${t.pos.x},${t.pos.y}`));
      let head = 0;

      while (head < toVisit.length) {
        const { x, y } = toVisit[head++];
        [{ x: x + 1, y }, { x: x - 1, y }, { x, y: y + 1 }, { x, y: y - 1 }].forEach(n => {
          const key = `${n.x},${n.y}`;
          if (tilePositions.has(key) && !visited.has(key)) {
            visited.add(key);
            toVisit.push(n);
          }
        });
      }

      if (visited.size !== tilesOnBoard.length) {
        set({ message: 'All tiles must be connected in a single group.' });
        return;
      }

      set({ status: 'won', message: 'Bananagrams! You win!' });
    } catch (e) {
      set({ message: 'Error checking words. Could not load dictionary.' });
      console.error(e);
    }
  },
}));