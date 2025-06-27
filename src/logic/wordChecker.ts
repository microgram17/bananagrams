import { Board, Tile } from "../types";

let wordList: Set<string> = new Set();

export async function loadWordList(): Promise<void> {
  try {
    const response = await fetch('/words.json');
    const words: string[] = await response.json();
    wordList = new Set(words.map(word => word.toLowerCase()));
    console.log('Word list loaded successfully.');
  } catch (error) {
    console.error('Failed to load word list:', error);
  }
}

export function extractWordsFromBoard(board: Board): string[] {
  const words: string[] = [];

  // Extract horizontal words
  for (let y = 0; y < board.length; y++) {
    let word = "";
    for (let x = 0; x < board[y].length; x++) {
      const tile = board[y][x];
      if (tile) {
        word += tile.letter;
      } else {
        if (word.length > 1) {
          words.push(word);
        }
        word = ""; // Reset word when encountering an empty cell
      }
    }
    if (word.length > 1) {
      words.push(word); // Add the last word in the row
    }
  }

  // Extract vertical words
  for (let x = 0; x < board[0].length; x++) {
    let word = "";
    for (let y = 0; y < board.length; y++) {
      const tile = board[y][x];
      if (tile) {
        word += tile.letter;
      } else {
        if (word.length > 1) {
          words.push(word);
        }
        word = ""; // Reset word when encountering an empty cell
      }
    }
    if (word.length > 1) {
      words.push(word); // Add the last word in the column
    }
  }

  return words;
}

export function checkVictory(board: Board): boolean {
  if (board.flat().every(cell => cell === null)) return false;

  const words = extractWordsFromBoard(board);
  if (words.length === 0) return false;

  // Check for disconnected tiles and if all words are valid
  // Placeholder logic:
  const allWordsValid = words.every(word => wordList.has(word.toLowerCase()));
  const hasFloatingTiles = false; // Placeholder for island check

  return allWordsValid && !hasFloatingTiles;
}