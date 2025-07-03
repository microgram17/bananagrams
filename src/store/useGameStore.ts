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
import { extractWordsFromBoard, wordList } from '../logic/wordChecker';
import { generateTilePool, drawTiles, dealInitialTiles } from '../logic/tilePool';
import { shuffle } from '../utils/shuffle'; // Add this import

/**
 * Creates an empty game board filled with null values.
 * The board is a 2D grid where each cell can contain a tile or null.
 * 
 * @returns A new empty board of size BOARD_SIZE × BOARD_SIZE
 */
const createInitialBoard = (): Board =>
  Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(null));

// Constants for AI timing simulation
const BASE_AI_TIME_PER_TILE = 2000; // Base time in ms per tile for AI "thinking"
const AI_RANDOM_FACTOR_MAX = 2500;  // Maximum random time variation to add
const LAST_TILE_FACTOR = 2;         // Multiplier for the last tile (makes AI slower)

/**
 * Defines the shape of the game state.
 * Contains all data related to the current game.
 */
export interface GameState {
  status: GameStatus;               // Current game status (pre-game, in-progress, etc.)
  board: Board;                     // The game board
  playerHand: Tile[];               // Tiles in the player's hand
  tilePool: Tile[];                 // Remaining tiles in the pool
  message: string;                  // Message to display to the player
  playerCount: number;              // Total number of players (including AIs)
  selectedCell: Position | null;    // Currently selected cell for keyboard control
  typingDirection: 'horizontal' | 'vertical'; // Direction for keyboard tile placement
  simulatedPlayerHands: Tile[][];   // Tiles for each simulated player
  aiTimers: number[];               // Timer IDs for AI move scheduling
  aiNextTileUseTime: number[];      // Timestamps for when each AI will next use a tile
  lastAiPeeler: number | null;      // Index of the last AI that triggered a peel
  isRottenBanana: boolean;          // Whether the player has invalid words with no tiles left
  pendingRemovals: Set<string>;     // Track cells with pending removal
}

/**
 * Defines all actions that can modify the game state.
 * These functions provide the game's interactivity.
 */
export interface GameActions {
  setPlayerCount: (count: number) => void;
  startGame: () => void;
  moveTile: (item: DraggedItem, destination: Position | 'hand') => void;
  skala: () => void;                // "Peel" action - draw a new tile
  dumpa: (tileToDump: Tile) => void; // "Dump" action - exchange 1 tile for 3
  checkWinCondition: () => Promise<void>;
  // Keyboard control actions
  setSelectedCell: (position: Position | null) => void;
  toggleTypingDirection: () => void;
  moveSelectedCell: (direction: 'up' | 'down' | 'left' | 'right') => void;
  placeTileByKey: (letter: Letter) => void;
  handleBackspace: () => void;
  // AI-related actions
  startAiTimers: () => void;
  handleAiUseTile: (aiIndex: number) => void;
  checkAutoSkala: () => void;
  resetGame: () => void;
}

// The main game store using Zustand for state management.
export const useGameStore = create<GameState & GameActions>((set, get) => ({
  // Initial state
  status: 'pre-game',
  board: createInitialBoard(),
  playerHand: [],
  tilePool: [],
  message: 'Select player count and start the game!',
  playerCount: 1,
  selectedCell: null,
  typingDirection: 'horizontal',
  simulatedPlayerHands: [],
  aiTimers: [],
  aiNextTileUseTime: [],
  lastAiPeeler: null,
  isRottenBanana: false,
  pendingRemovals: new Set(), // Initialize pending removals set

  /**
   * Updates the number of players for the game.
   * @param count - The new player count
   */
  setPlayerCount: (count) => set({ playerCount: count }),

  /**
   * Initializes and starts a new game.
   * - Creates and shuffles the tile pool
   * - Deals tiles to all players
   * - Sets the game status to in-progress
   * - Starts AI timers if there are simulated players
   */
  startGame: () => {
    const { playerCount } = get();
    
    // Create the master tile pool
    const masterTilePool = generateTilePool();
    
    // Get the starting tile count based on player count
    const tilesPerPlayer = getStartingTileCount(playerCount);
    
    // Deal tiles to all players
    const { playerHand, simulatedPlayerHands, remainingPool } = 
      dealInitialTiles(masterTilePool, playerCount, tilesPerPlayer);
    
    set({
      status: 'in-progress',
      board: createInitialBoard(),
      tilePool: remainingPool,
      playerHand,
      simulatedPlayerHands,
      message: `Game started with ${playerCount} players! Build your word grid.`,
      aiTimers: Array(playerCount - 1).fill(0),
      aiNextTileUseTime: Array(playerCount - 1).fill(0),
      lastAiPeeler: null, // Explicitly reset lastAiPeeler
      isRottenBanana: false
    });
    
    // Start AI timers if there are simulated players
    if (playerCount > 1) {
      setTimeout(() => get().startAiTimers(), 500);
    }
  },
  
  /**
   * Initializes timers for AI players to simulate their moves.
   * Each AI uses tiles at random intervals based on their hand size.
   */
  startAiTimers: () => {
    set(state => {
      const { simulatedPlayerHands } = state;
      
      // Calculate next tile use times for each AI
      const aiNextTileUseTime = simulatedPlayerHands.map(hand => {
        // Calculate time to use next tile
        const randomFactor = Math.random() * AI_RANDOM_FACTOR_MAX;
        // Apply last tile factor if only one tile left
        const factor = hand.length === 1 ? LAST_TILE_FACTOR : 1;
        return Date.now() + (BASE_AI_TIME_PER_TILE * factor) + randomFactor;
      });
      
      // Set up interval timers to check if any AI should use a tile
      const aiTimers = simulatedPlayerHands.map((_, index) => {
        return window.setInterval(() => {
          const store = get();
          const now = Date.now();
          
          if (store.status !== 'in-progress') {
            // Clear timer if game is not in progress
            clearInterval(store.aiTimers[index]);
            return;
          }
          
          if (now >= store.aiNextTileUseTime[index]) {
            store.handleAiUseTile(index);
          }
        }, 1000) as unknown as number;
      });
      
      return { aiTimers, aiNextTileUseTime };
    });
  },
  
  /**
   * Handles an AI player using a tile.
   * When an AI uses all its tiles, it triggers a "peel" for everyone.
   * If there are no tiles left in the pool and an AI uses its last tile,
   * the AI wins and the player loses.
   * 
   * @param aiIndex - Index of the AI player
   */
  handleAiUseTile: (aiIndex: number) => {
    set(state => {
      const { simulatedPlayerHands, tilePool } = state;
      
      // Check if AI has any tiles to use
      if (simulatedPlayerHands[aiIndex].length === 0) {
        // This shouldn't happen but just in case
        return state;
      }
      
      // AI uses one tile from its hand
      let newSimulatedHands = [...simulatedPlayerHands];
      newSimulatedHands[aiIndex] = [...newSimulatedHands[aiIndex]];
      newSimulatedHands[aiIndex].pop(); // Remove one tile to simulate usage
      
      // Calculate next tile use time
      const randomFactor = Math.random() * AI_RANDOM_FACTOR_MAX;
      const newTileUseTimes = [...state.aiNextTileUseTime];
      
      // If AI has used all tiles, it should trigger a peel
      if (newSimulatedHands[aiIndex].length === 0) {
        // Check if pool is empty - AI wins immediately if so
        if (tilePool.length === 0) {
          // AI has won the game!
          return { 
            message: `Player ${aiIndex + 2} used all their tiles with no tiles left in the pool. Game Over - You Lost!`,
            status: 'lost' as GameStatus, // Add explicit type assertion
            lastAiPeeler: aiIndex,
            simulatedPlayerHands: newSimulatedHands
          };
        }
        
        // Otherwise trigger a peel for everyone
        let newPool = [...tilePool];
        let newPlayerHand = [...state.playerHand];
        
        // Human player gets a tile
        if (newPool.length > 0) {
          const { drawn, remaining } = drawTiles(newPool, 1);
          newPlayerHand = [...newPlayerHand, ...drawn];
          newPool = remaining;
        }
        
        // Each AI gets a tile
        for (let i = 0; i < newSimulatedHands.length; i++) {
          if (newPool.length > 0) {
            const { drawn, remaining } = drawTiles(newPool, 1);
            newSimulatedHands[i] = [...newSimulatedHands[i], ...drawn];
            newPool = remaining;
          }
        }
        
        // Set new tile use time for all AIs, with double time for those with 1 tile
        for (let i = 0; i < newSimulatedHands.length; i++) {
          const tileCount = newSimulatedHands[i].length;
          const factor = tileCount === 1 ? LAST_TILE_FACTOR : 1; // Double time for last tile
          newTileUseTimes[i] = Date.now() + 
            (BASE_AI_TIME_PER_TILE * factor) + (Math.random() * AI_RANDOM_FACTOR_MAX);
        }
        
        return {
          playerHand: newPlayerHand,
          tilePool: newPool,
          simulatedPlayerHands: newSimulatedHands,
          aiNextTileUseTime: newTileUseTimes,
          lastAiPeeler: aiIndex,
          message: `Player ${aiIndex + 2} peeled! Everyone drew a tile.`
        };
      } else {
        // Just used a tile, set next use time
        const factor = newSimulatedHands[aiIndex].length === 1 ? LAST_TILE_FACTOR : 1;
        newTileUseTimes[aiIndex] = Date.now() + 
          (BASE_AI_TIME_PER_TILE * factor) + randomFactor;
        
        return {
          simulatedPlayerHands: newSimulatedHands,
          aiNextTileUseTime: newTileUseTimes,
          message: '' // No message for regular tile usage
        };
      }
    });
  },
  
  /**
   * Automatically triggers a "peel" when the player has used all their tiles.
   * Also checks for a potential win if the tile pool is empty.
   */
  checkAutoSkala: () => {
    const { playerHand, tilePool } = get();
    
    if (playerHand.length === 0 && tilePool.length > 0) {
      // Auto-peel when player runs out of tiles
      get().skala();
    } else if (playerHand.length === 0 && tilePool.length === 0) {
      // Player might win if the board is valid
      get().checkWinCondition();
    }
  },
  
  /**
   * Moves a tile from one location to another (hand to board, board to hand, or board to board).
   * This is the core mechanic for building the word grid.
   * 
   * @param item - The tile being moved and its source location
   * @param destination - Where the tile should be placed
   */
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

      // Return the updated state
      return { board: newBoard, playerHand: newPlayerHand, message: '' };
    });
    
    // After updating state, check if player should auto-peel
    setTimeout(() => get().checkAutoSkala(), 50);
  },

  /**
   * The "Skala" (Peel) action - draws one tile for each player from the pool.
   * In Bananagrams, players call "Peel" when they've used all their tiles,
   * and everyone takes a new tile from the bunch.
   */
  skala: () => {
    set((state) => {
      if (state.tilePool.length === 0) {
        return { message: 'No more tiles to peel!' };
      }
      
      // The human player gets one tile
      const { drawn: playerTiles, remaining: poolAfterPlayer } = 
        drawTiles(state.tilePool, 1);
      
      let newPool = poolAfterPlayer;
      let newSimulatedHands = [...state.simulatedPlayerHands];
      let tilesDrawn = 1; // Count the player's tile
      
      // Each simulated player also gets one tile
      for (let i = 0; i < newSimulatedHands.length; i++) {
        if (newPool.length > 0) {
          const { drawn, remaining } = drawTiles(newPool, 1);
          newSimulatedHands[i] = [...newSimulatedHands[i], ...drawn];
          newPool = remaining;
          tilesDrawn++;
        } else {
          break; // No more tiles to draw
        }
      }
      
      // After peeling, recalculate AI timers
      const newTileUseTimes = state.aiNextTileUseTime.map((_, index) => {
        const handSize = newSimulatedHands[index].length;
        const factor = handSize === 1 ? LAST_TILE_FACTOR : 1;
        const randomFactor = Math.random() * AI_RANDOM_FACTOR_MAX;
        return Date.now() + (BASE_AI_TIME_PER_TILE * factor) + randomFactor;
      });
      
      return {
        playerHand: [...state.playerHand, ...playerTiles],
        tilePool: newPool,
        simulatedPlayerHands: newSimulatedHands,
        aiNextTileUseTime: newTileUseTimes,
        message: `Peeled ${tilesDrawn} tiles (${state.simulatedPlayerHands.length} other players also drew)!`,
      };
    });
  },

  /**
   * The "Dumpa" (Dump) action - exchanges one tile for three new tiles.
   * This is useful when a player has a difficult letter they can't use.
   * 
   * @param tileToDump - The tile to exchange
   */
  dumpa: (tileToDump) => {
    set((state) => {
      if (state.tilePool.length < 3) {
        return { message: 'Not enough tiles in the pool to dump.' };
      }
      
      // Remove the tile from player's hand
      const newHand = state.playerHand.filter((t) => t.id !== tileToDump.id);
      
      // Draw 3 new tiles for the player
      const { drawn: newTiles, remaining: remainingPool } = 
        drawTiles(state.tilePool, 3);
      
      newHand.push(...newTiles);

      // Return dumped tile to pool and shuffle
      const newPool = shuffle([...remainingPool, tileToDump]);

      return {
        playerHand: newHand,
        tilePool: newPool,
        message: 'Dumped 1 tile for 3 new ones.',
      };
    });
  },

  // --- KEYBOARD CONTROL ACTIONS ---

  /**
   * Sets the currently selected cell for keyboard input.
   * This allows players to place tiles using keyboard controls.
   * 
   * @param position - The board position to select, or null to deselect
   */
  setSelectedCell: (position) => {
    set({ selectedCell: position });
  },

  /**
   * Toggles the direction for placing tiles when using keyboard controls.
   * Switches between horizontal and vertical placement.
   */
  toggleTypingDirection: () => {
    set((state) => ({
      typingDirection:
        state.typingDirection === 'horizontal' ? 'vertical' : 'horizontal',
      message: `Typing direction: ${
        state.typingDirection === 'horizontal' ? 'vertical' : 'horizontal'
      }`,
    }));
  },

  /**
   * Moves the selected cell in the specified direction.
   * Used for keyboard navigation of the board.
   * 
   * @param direction - The direction to move (up, down, left, right)
   */
  moveSelectedCell: (direction) => {
    set((state) => {
      if (!state.selectedCell) return {};
      const { x, y } = state.selectedCell;
      let newPos: Position = { x, y };
      if (direction === 'up') newPos = { x, y: Math.max(0, y - 1) };
      if (direction === 'down')
        newPos = { x, y: Math.min(BOARD_SIZE - 1, y + 1) };
      if (direction === 'left') newPos = { x: Math.max(0, x - 1), y };
      if (direction === 'right')
        newPos = { x: Math.min(BOARD_SIZE - 1, x + 1), y };
      return { selectedCell: newPos };
    });
  },

  /**
   * Places a tile on the board using keyboard input.
   * Finds a tile with the specified letter in the player's hand
   * and places it at the selected cell.
   * 
   * @param letter - The letter to place
   */
  placeTileByKey: (letter) => {
    set((state) => {
      const { selectedCell, playerHand, board, typingDirection } = state;
      if (!selectedCell) return {};

      // Find a tile with the matching letter in the player's hand
      const tileIndex = playerHand.findIndex(
        (t) => t.letter.toUpperCase() === letter.toUpperCase()
      );

      if (tileIndex === -1) {
        return { message: `You do not have a '${letter.toUpperCase()}' tile!` };
      }

      const tileToPlace = playerHand[tileIndex];
      const newPlayerHand = [...playerHand];
      newPlayerHand.splice(tileIndex, 1);

      const newBoard = board.map((row) => [...row]);
      const { x, y } = selectedCell;

      // If there's already a tile at the selected position, return it to the hand
      const tileAtDestination = newBoard[y][x];
      if (tileAtDestination) {
        newPlayerHand.push(tileAtDestination);
      }

      // Place the new tile
      newBoard[y][x] = tileToPlace;

      // Automatically move selection to the next cell based on typing direction
      let nextSelectedCell = { ...selectedCell };
      if (typingDirection === 'horizontal') {
        nextSelectedCell.x = Math.min(BOARD_SIZE - 1, nextSelectedCell.x + 1);
      } else {
        nextSelectedCell.y = Math.min(BOARD_SIZE - 1, nextSelectedCell.y + 1);
      }

      return {
        playerHand: newPlayerHand,
        board: newBoard,
        selectedCell: nextSelectedCell,
        message: '',
      };
    });
  },

  /**
   * Handles backspace key press when using keyboard controls.
   * Removes a tile from the selected cell and returns it to the player's hand.
   * If the cell is empty, moves the selection back.
   */
  handleBackspace: () => {
    set((state) => {
      const { selectedCell, board, typingDirection } = state;
      if (!selectedCell) return {};

      const { x, y } = selectedCell;
      const tileOnCell = board[y][x];

      // If there's a tile on the current cell, remove it immediately
      if (tileOnCell) {
        const updatedBoard = state.board.map((row) => [...row]);
        updatedBoard[y][x] = null;
        
        // Move selection back if appropriate
        const prevSelectedCell = {
          x: typingDirection === 'horizontal' ? Math.max(0, x - 1) : x,
          y: typingDirection === 'vertical' ? Math.max(0, y - 1) : y,
        };
        
        return { 
          board: updatedBoard,
          playerHand: [...state.playerHand, tileOnCell],
          selectedCell: prevSelectedCell
        };
      }

      // Move selection back if no tile was removed
      const prevSelectedCell = {
        x: typingDirection === 'horizontal' ? Math.max(0, x - 1) : x,
        y: typingDirection === 'vertical' ? Math.max(0, y - 1) : y,
      };
      return { selectedCell: prevSelectedCell };
    });
  },

  /**
   * Checks if the player has won the game.
   * A valid win requires:
   * 1. All tiles in the player's hand are used
   * 2. All words on the board are valid
   * 3. All tiles on the board are connected
   * 
   * If there are invalid words and no tiles left in the pool,
   * the player is a "rotten banana" and loses.
   */
  checkWinCondition: async () => {
    const { board, playerHand, tilePool } = get();

    // Reset rotten banana status at the start of checking
    set({ isRottenBanana: false });

    if (playerHand.length > 0) {
      set({ message: 'You must use all your tiles to win! Ensure your hand is empty.' });
      return;
    }

    // Collect all tiles on the board with their positions
    const tilesOnBoard: { tile: Tile; pos: Position }[] = [];
    board.forEach((row, y) =>
      row.forEach((tile, x) => {
        if (tile) tilesOnBoard.push({ tile, pos: { x, y } });
      })
    );

    if (tilesOnBoard.length === 0) {
      set({ message: 'Board is empty. Place tiles to form words before checking.' });
      return;
    }

    try {
      // Ensure word list is loaded
      if (wordList.size === 0) {
        throw new Error('Word list is empty. Dictionary not loaded.');
      }

      // Extract and validate all words on the board
      const words = extractWordsFromBoard(board);
      const invalidWords = words.filter(word => !wordList.has(word.toLowerCase()));

      if (invalidWords.length > 0) {
        // Mark as rotten banana if there are invalid words and no tiles left in pool
        if (tilePool.length === 0) {
          set({ 
            isRottenBanana: true, 
            message: `ROTTEN BANANA! Invalid words detected: ${[...new Set(invalidWords)].join(', ')}. Game over!`,
            status: 'won'
          });
        } else {
          set({ message: `Invalid words detected: ${[...new Set(invalidWords)].join(', ')}. Please correct them.` });
        }
        return;
      }

      if (words.length === 0) {
        set({ message: 'No valid words found on the board. Ensure tiles form words of at least 2 letters.' });
        return;
      }

      // Check for connectivity using Breadth-First Search (BFS)
      const toVisit = [tilesOnBoard[0].pos];
      const visited = new Set<string>([`${toVisit[0].x},${toVisit[0].y}`]);
      const tilePositions = new Set(tilesOnBoard.map(t => `${t.pos.x},${t.pos.y}`));
      let head = 0;

      while (head < toVisit.length) {
        const { x, y } = toVisit[head++];
        // Check all four adjacent cells
        [{ x: x + 1, y }, { x: x - 1, y }, { x, y: y + 1 }, { x, y: y - 1 }].forEach(n => {
          const key = `${n.x},${n.y}`;
          if (tilePositions.has(key) && !visited.has(key)) {
            visited.add(key);
            toVisit.push(n);
          }
        });
      }

      const allTilesConnected = visited.size === tilesOnBoard.length;
      if (!allTilesConnected) {
        // Mark as rotten banana if tiles aren't connected and no tiles left in pool
        if (tilePool.length === 0) {
          set({ 
            isRottenBanana: true, 
            message: 'ROTTEN BANANA! All tiles must be connected in a single group. Game over!',
            status: 'won'
          });
        } else {
          set({ message: 'All tiles must be connected in a single group. Ensure no isolated tiles exist.' });
        }
        return;
      }

      // All conditions met - player wins!
      set({ status: 'won', message: 'Bananagrams! You win! Congratulations!' });
    } catch (e) {
      const error = e as Error; // Explicitly cast `e` to `Error`
      set({ message: error.message || 'An error occurred while checking the board. Please try again.' });
      console.error(error);
    }
  },

  /**
   * Resets the game to its initial state.
   * Clears the board, hands, and timers.
   */
  resetGame: () => {
    // Clear any existing AI timers
    const { aiTimers } = get();
    aiTimers.forEach(timerId => {
      if (timerId) {
        clearInterval(timerId);
      }
    });
    
    // Reset to pre-game state
    set({
      status: 'pre-game',
      board: createInitialBoard(),
      tilePool: [],
      playerHand: [],
      simulatedPlayerHands: [],
      message: 'Welcome to Bananagrams! Select player count and press Start to begin.',
      aiTimers: [],
      aiNextTileUseTime: [],
      lastAiPeeler: null,
      isRottenBanana: false
    });
  }
}));