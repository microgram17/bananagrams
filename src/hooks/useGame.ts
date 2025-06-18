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
      const newBoard = board.map(r => [...r]);
      let newHand = [...playerHand];

      // Remove tile from its origin
      if ('x' in draggedItem) { // from board
        newBoard[draggedItem.y][draggedItem.x] = null;
      } else { // from hand
        newHand = newHand.filter(t => t.id !== draggedItem.id);
      }

      // Place tile in its destination
      if (dropTarget !== 'hand') { // to board
        newBoard[dropTarget.y][dropTarget.x] = { id: draggedItem.id, letter: draggedItem.letter };
      } else { // to hand
        // ensure not to duplicate
        if (!newHand.find(t => t.id === draggedItem.id)) {
          newHand.push({ id: draggedItem.id, letter: draggedItem.letter });
        }
      }
      
      setBoard(newBoard);
      setPlayerHand(newHand);
    },
    [board, playerHand]
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