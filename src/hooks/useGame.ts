import { useReducer, useEffect, useCallback } from 'react';
import { GameState, Tile, Board, Position, DraggedItem, GameStatus } from '../types';
import { getInitialTiles, shuffle, peel, dump } from '../lib/gameLogic';
import { loadWordList } from '../lib/wordlist';
import { BOARD_SIZE, getStartingTileCount } from '../gameConfig';

// --- ACTIONS ---
// All possible state changes are represented by actions.
type GameAction =
  | { type: 'LOAD_WORD_LIST'; payload: Set<string> }
  | { type: 'START_GAME'; payload: { playerCount: number } }
  | { type: 'PEEL' } // "Skala"
  | { type: 'DUMP'; payload: Tile }
  | { type: 'MOVE_TILE'; payload: { draggedItem: DraggedItem; dropTarget: Position | 'hand' } }
  | { type: 'SET_MESSAGE'; payload: string };

// --- REDUCER ---
// A pure function that calculates the next state based on the current state and an action.
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'LOAD_WORD_LIST':
      return { ...state, wordList: action.payload };

    case 'START_GAME': {
      const allTiles = getInitialTiles();
      const shuffledBunch = shuffle(allTiles);
      const initialTiles = getStartingTileCount(action.payload.playerCount);

      return {
        ...state,
        status: 'in-progress',
        bunch: shuffledBunch.slice(initialTiles),
        playerHand: shuffledBunch.slice(0, initialTiles),
        board: Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)),
        message: '',
      };
    }

    case 'PEEL': {
      if (state.bunch.length < 1) {
        return { ...state, message: 'No more tiles in the bunch!' };
      }
      const { newBunch, newTiles } = peel(state.bunch);
      return {
        ...state,
        bunch: newBunch,
        playerHand: [...state.playerHand, ...newTiles],
      };
    }
    
    case 'DUMP': {
        if (state.bunch.length < 3) {
            return { ...state, message: "Not enough tiles in the bunch to dump." };
        }
        const { newBunch, newHand, success } = dump(state.bunch, state.playerHand, action.payload);
        if (success) {
            return { ...state, bunch: newBunch, playerHand: newHand, message: 'Dumped 1 tile, drew 3.' };
        }
        return { ...state, message: 'Could not dump tile.' };
    }

    case 'MOVE_TILE': {
      const { draggedItem, dropTarget } = action.payload;
      const newBoard = state.board.map(r => [...r]);
      let newHand = [...state.playerHand];

      // Remove tile from its origin
      if (draggedItem.type === 'hand') {
        newHand = newHand.filter(t => t.id !== draggedItem.id);
      } else {
        newBoard[draggedItem.position.y][draggedItem.position.x] = null;
      }

      // Place tile in its destination
      if (dropTarget === 'hand') {
        if (!newHand.some(t => t.id === draggedItem.id)) {
          newHand.push({ id: draggedItem.id, letter: draggedItem.letter });
        }
      } else {
        const { x, y } = dropTarget;
        const replacedTile = newBoard[y][x];
        if (replacedTile) {
          newHand.push(replacedTile);
        }
        newBoard[y][x] = { id: draggedItem.id, letter: draggedItem.letter };
      }

      return { ...state, board: newBoard, playerHand: newHand };
    }

    case 'SET_MESSAGE':
      return { ...state, message: action.payload };

    default:
      return state;
  }
};

// --- INITIAL STATE ---
const initialGameState: GameState = {
  status: 'pre-game',
  bunch: [],
  playerHand: [],
  board: Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)),
  wordList: new Set(),
  message: 'Welcome to Bananagrams!',
};

// --- HOOK ---
export const useGame = () => {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);

  useEffect(() => {
    loadWordList()
      .then(words => dispatch({ type: 'LOAD_WORD_LIST', payload: words }))
      .catch(error => {
        console.error("Failed to load word list", error);
        dispatch({ type: 'SET_MESSAGE', payload: 'Error: Could not load word list.' });
      });
  }, []);

  // Memoized action creators
  const startGame = useCallback((playerCount: number) => dispatch({ type: 'START_GAME', payload: { playerCount } }), []);
  const skala = useCallback(() => dispatch({ type: 'PEEL' }), []);
  const dumpa = useCallback((tileToDump: Tile) => dispatch({ type: 'DUMP', payload: tileToDump }), []);
  const moveTile = useCallback((draggedItem: DraggedItem, dropTarget: Position | 'hand') => {
    dispatch({ type: 'MOVE_TILE', payload: { draggedItem, dropTarget } });
  }, []);
  const checkWord = useCallback((word: string) => state.wordList.has(word.toLowerCase()), [state.wordList]);

  return {
    gameState: state.status,
    handTiles: state.playerHand,
    board: state.board,
    bunch: state.bunch,
    message: state.message,
    startGame,
    skala,
    dumpa,
    moveTile,
    checkWord,
  };
};