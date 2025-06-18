import { useReducer, useState, useEffect, useCallback } from 'react';
import { GameState, Tile, Board, Position, BoardTile } from '../types';
import { getInitialTiles, shuffle, peel, dump } from '../lib/gameLogic';
import { loadWordList } from '../lib/wordlist';

const BOARD_SIZE = 20;

// 1. DEFINE YOUR TYPES
export interface Tile {
  id: string;
  letter: string;
}

export interface Position {
  x: number;
  y: number;
}

// A tile on the board can be null (empty)
export type BoardTile = Tile | null;

// The complete state of the game
export interface GameState {
  board: BoardTile[][];
  playerHand: Tile[];
  // Add other state as needed, e.g., tileBag, score, etc.
}

// An item being dragged can be from the hand or the board
export type DraggedItem =
  | { type: 'hand'; tile: Tile }
  | { type: 'board'; tile: Tile; position: Position };

// 2. DEFINE ACTIONS
// Actions are objects that describe a state change.
type GameAction = {
  type: 'MOVE_TILE';
  payload: {
    draggedItem: DraggedItem;
    dropTarget: Position | 'hand';
  };
};
// Add other actions like { type: 'DRAW_TILE' } or { type: 'INITIALIZE_GAME' }

// 3. CREATE THE REDUCER
// A pure function that calculates the next state. It's the "brain" of your game logic.
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'MOVE_TILE': {
      const { draggedItem, dropTarget } = action.payload;
      const { tile } = draggedItem;

      // Create mutable copies for this transaction
      const newBoard = state.board.map(r => [...r]);
      let newHand = [...state.playerHand];

      // --- Logic to remove the tile from its origin ---
      if (draggedItem.type === 'hand') {
        // Remove from hand
        newHand = newHand.filter(t => t.id !== tile.id);
      } else {
        // Remove from board
        const { x, y } = draggedItem.position;
        newBoard[y][x] = null;
      }

      // --- Logic to place the tile in its destination ---
      if (dropTarget === 'hand') {
        // Add to hand if not already there
        if (!newHand.some(t => t.id === tile.id)) {
          newHand.push(tile);
        }
      } else {
        // Destination is the board
        const { x, y } = dropTarget;

        // If the destination cell is already occupied, move that tile to the hand
        const replacedTile = newBoard[y][x];
        if (replacedTile) {
          newHand.push(replacedTile);
        }

        // Place the new tile on the board
        newBoard[y][x] = tile;
      }

      // Return the new, immutable state object
      return {
        ...state,
        board: newBoard,
        playerHand: newHand,
      };
    }

    // Add other cases for other actions here...

    default:
      return state;
  }
};

// Initial state for the game
const initialGameState: GameState = {
  board: Array(15).fill(null).map(() => Array(15).fill(null)),
  playerHand: [
    // Example initial hand
    { id: 't1', letter: 'A' },
    { id: 't2', letter: 'B' },
    { id: 't3', letter: 'C' },
  ],
};

// 4. CREATE THE HOOK
export const useGame = () => {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const [bunch, setBunch] = useState<Tile[]>([]);
  const [playerHand, setPlayerHand] = useState<Tile[]>([]);
  const [board, setBoard] = useState<Board>(
    Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null))
  );
  const [gameState, setGameState] = useState<GameState>('pre-game');
  const [wordList, setWordList] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchWordList() {
      try {
        const words = await loadWordList();
        setWordList(words);
      } catch (error) {
        console.error("Failed to load word list", error);
        setMessage("Error: Could not load word list.");
      }
    }
    fetchWordList();
  }, []);

  const startGame = useCallback(() => {
    const initialTiles = 21; // Adjust based on player count if needed
    const allTiles = getInitialTiles();
    const shuffledBunch = shuffle(allTiles);

    const hand = shuffledBunch.slice(0, initialTiles);
    const remainingBunch = shuffledBunch.slice(initialTiles);

    setPlayerHand(hand);
    setBunch(remainingBunch);
    setBoard(Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)));
    setGameState('in-progress');
    setMessage('');
  }, [playerCount]);

  const skala = useCallback(() => {
    if (bunch.length > 0) {
      const { newBunch, newTiles } = peel(bunch);
      setBunch(newBunch);
      setPlayerHand(prev => [...prev, ...newTiles]);
    } else {
      setMessage("No more tiles in the bunch!");
    }
  }, [bunch]);

  const dumpa = useCallback((tileToDump: Tile) => {
    if (gameState !== 'in-progress') return;

    if (playerHand.length < 1) {
      setMessage("You have no tiles to dump.");
      return;
    }

    if (bunch.length < 3) {
      setMessage("Not enough tiles in the bunch to dump.");
      return;
    }

    const { newBunch, newHand, success } = dump(bunch, playerHand, tileToDump);
    if (success) {
      setBunch(newBunch);
      setPlayerHand(newHand);
      setMessage('Dumped 1 tile, drew 3.');
    } else {
      setMessage('Could not dump tile.');
    }
  }, [playerHand, bunch, gameState]);

  const checkWord = (word: string) => {
    return wordList.has(word.toLowerCase());
  };

  const moveTile = useCallback(
    (draggedItem: Tile | BoardTile, dropTarget: Position | 'hand') => {
      // Use functional updates to prevent stale state issues.
      let replacedTile: Tile | null = null;

      setBoard(currentBoard => {
        const newBoard = currentBoard.map(r => [...r]);

        // If dropping on the board, check for and store the existing tile.
        if (dropTarget !== 'hand') {
          replacedTile = newBoard[dropTarget.y][dropTarget.x];
        }

        // Remove tile from board if its origin was the board
        if ('x' in draggedItem) {
          newBoard[draggedItem.y][draggedItem.x] = null;
        }

        // Place tile on board if its destination is the board
        if (dropTarget !== 'hand') {
          newBoard[dropTarget.y][dropTarget.x] = { id: draggedItem.id, letter: draggedItem.letter };
        }

        return newBoard;
      });

      setPlayerHand(currentHand => {
        // Remove tile from hand if its origin was the hand
        let newHand =
          'x' in draggedItem
            ? [...currentHand] // Not from hand, so just copy the array
            : currentHand.filter(t => t.id !== draggedItem.id); // From hand, so filter it out

        // Add tile to hand if its destination is the hand
        if (dropTarget === 'hand') {
          // Ensure we don't add a duplicate if it's already there
          if (!newHand.some(t => t.id === draggedItem.id)) {
            newHand.push({ id: draggedItem.id, letter: draggedItem.letter });
          }
        }

        // If a tile was replaced on the board, add it back to the hand,
        // but only if it's not the same tile being moved.
        if (replacedTile && replacedTile.id !== draggedItem.id) {
          newHand.push({ id: replacedTile.id, letter: replacedTile.letter });
        }

        return newHand;
      });
    },
    [] // Dependencies are no longer needed with functional updates
  );

  // Expose state and a simplified way to call actions
  const moveTileAction = (draggedItem: DraggedItem, dropTarget: Position | 'hand') => {
    dispatch({
      type: 'MOVE_TILE',
      payload: { draggedItem, dropTarget },
    });
  };

  return {
    bunch,
    handTiles: playerHand,
    board,
    gameState,
    message,
    startGame,
    skala,
    dumpa,
    checkWord,
    moveTile: moveTileAction,
  };
};