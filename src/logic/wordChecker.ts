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
  // This is a complex function. A placeholder is provided.
  // You would need to implement logic to traverse the board,
  // identify contiguous tiles horizontally and vertically,
  // and form words from them.
  console.log("extractWordsFromBoard needs to be implemented.");
  return [];
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