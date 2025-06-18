import { useState, useCallback, useEffect } from 'react';
import { GameState, Tile, Board, Position, BoardTile } from '../types';
import { getInitialTiles, shuffle, peel, dump } from '../lib/gameLogic';
import { loadWordList } from '../lib/wordlist';

const BOARD_SIZE = 20;

export const useGame = (playerCount: number) => {
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

      setBoard(currentBoard => {
        const newBoard = currentBoard.map(r => [...r]);

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

        return newHand;
      });
    },
    [] // Dependencies are no longer needed with functional updates
  );

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
    moveTile,
  };
};