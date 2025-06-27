import { Board } from "../types";

export let wordList: Set<string> = new Set(); // Export wordList

export async function loadWordList(): Promise<void> {
  try {
    const response = await fetch('/saol2018clean.csv'); // Update path to match public folder
    const csvText = await response.text();

    const rows = csvText.split('\n');
    const words = rows.map(row => {
      const columns = row.split(',');
      return columns[1]?.trim(); // Extract the second column
    }).filter(Boolean);

    wordList = new Set(words.map(word => word.toLowerCase()));
    console.log('Word list loaded successfully.');
  } catch (error) {
    console.error('Error checking words. Could not load dictionary.', error);
  }
}

export function extractWordsFromBoard(board: Board): string[] {
  const words: string[] = [];

  const BOARD_SIZE = board.length;

  // Extract horizontal words
  for (let y = 0; y < BOARD_SIZE; y++) {
    let word = '';
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (board[y][x]) {
        word += board[y][x]!.letter;
      } else if (word.length > 1) {
        words.push(word);
        word = '';
      } else {
        word = '';
      }
    }
    if (word.length > 1) words.push(word);
  }

  // Extract vertical words
  for (let x = 0; x < BOARD_SIZE; x++) {
    let word = '';
    for (let y = 0; y < BOARD_SIZE; y++) {
      if (board[y][x]) {
        word += board[y][x]!.letter;
      } else if (word.length > 1) {
        words.push(word);
        word = '';
      } else {
        word = '';
      }
    }
    if (word.length > 1) words.push(word);
  }

  return words;
}

export function checkVictory(board: Board): boolean {
  if (board.flat().every(cell => cell === null)) return false;

  const BOARD_SIZE = board.length;

  // Extract all words from the board
  const words = extractWordsFromBoard(board);
  if (words.length === 0) return false;

  // Check if all words are valid
  const allWordsValid = words.every(word => wordList.has(word.toLowerCase()));
  if (!allWordsValid) return false;

  // Check for connectivity using BFS
  const visited = new Set<string>();
  const tilesOnBoard: { x: number; y: number }[] = [];

  board.forEach((row, y) =>
    row.forEach((tile, x) => {
      if (tile) tilesOnBoard.push({ x, y });
    })
  );

  if (tilesOnBoard.length === 0) return false;

  const queue: { x: number; y: number }[] = [tilesOnBoard[0]];
  visited.add(`${tilesOnBoard[0].x},${tilesOnBoard[0].y}`);

  while (queue.length > 0) {
    const { x, y } = queue.shift()!;
    const neighbors = [
      { x: x - 1, y },
      { x: x + 1, y },
      { x, y: y - 1 },
      { x, y: y + 1 },
    ];

    for (const neighbor of neighbors) {
      const { x: nx, y: ny } = neighbor;
      if (
        nx >= 0 &&
        ny >= 0 &&
        nx < BOARD_SIZE &&
        ny < BOARD_SIZE &&
        board[ny][nx] &&
        !visited.has(`${nx},${ny}`)
      ) {
        visited.add(`${nx},${ny}`);
        queue.push(neighbor);
      }
    }
  }

  // Ensure all tiles are connected
  const allTilesConnected = tilesOnBoard.every(({ x, y }) =>
    visited.has(`${x},${y}`)
  );

  return allWordsValid && allTilesConnected;
}