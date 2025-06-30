/**
 * This module handles word validation and checking.
 * It loads a dictionary of valid words and provides functions to:
 * - Extract words from the game board
 * - Check if words are valid
 * - Verify if the board state represents a valid win condition
 */
import { Board } from "../types";

// Set of valid words loaded from the dictionary file
export let wordList: Set<string> = new Set();

/**
 * Loads the word dictionary from a CSV file.
 * The dictionary is used to validate words during gameplay.
 *
 * @returns A promise that resolves when the word list is loaded
 */
export async function loadWordList(): Promise<void> {
  try {
    // Fetch the word list CSV file from the public directory
    const response = await fetch('/saol2018clean.csv');
    const csvText = await response.text();

    // Parse the CSV data (expects second column to contain words)
    const rows = csvText.split('\n');
    const words = rows.map(row => {
      const columns = row.split(',');
      return columns[1]?.trim(); // Extract the second column
    }).filter(Boolean); // Remove any undefined/empty entries

    // Convert to lowercase and store in a Set for efficient lookups
    wordList = new Set(words.map(word => word.toLowerCase()));
    console.log('Word list loaded successfully.');
  } catch (error) {
    console.error('Error checking words. Could not load dictionary.', error);
  }
}

/**
 * Extracts all valid words from the board.
 * Scans horizontally and vertically to find sequences of 2+ letters.
 *
 * @param board - The current game board
 * @returns Array of words found on the board
 */
export function extractWordsFromBoard(board: Board): string[] {
  const words: string[] = [];

  const BOARD_SIZE = board.length;

  // Extract horizontal words
  for (let y = 0; y < BOARD_SIZE; y++) {
    let word = '';
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (board[y][x]) {
        // Add letter to current word
        word += board[y][x]!.letter;
      } else if (word.length > 1) {
        // End of word reached - add to list if it's at least 2 letters
        words.push(word);
        word = '';
      } else {
        // Reset if we only had a single letter
        word = '';
      }
    }
    // Don't forget to add word at the end of row if it exists
    if (word.length > 1) words.push(word);
  }

  // Extract vertical words - same logic but scanning columns
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
    // Don't forget to add word at the end of column if it exists
    if (word.length > 1) words.push(word);
  }

  return words;
}

/**
 * Checks if the current board state represents a valid completed game.
 * For a board to be valid:
 * 1. It must not be empty
 * 2. All words must be valid
 * 3. All tiles must be connected
 *
 * @param board - The current game board
 * @returns true if the board represents a valid win, false otherwise
 */
export function checkVictory(board: Board): boolean {
  // Board must have tiles
  if (board.flat().every(cell => cell === null)) return false;

  const BOARD_SIZE = board.length;

  // Extract all words from the board
  const words = extractWordsFromBoard(board);
  if (words.length === 0) return false;

  // Check if all words are valid
  const allWordsValid = words.every(word => wordList.has(word.toLowerCase()));
  if (!allWordsValid) return false;

  // Check for connectivity using BFS (Breadth-First Search)
  const visited = new Set<string>();
  const tilesOnBoard: { x: number; y: number }[] = [];

  // Find all tiles on the board
  board.forEach((row, y) =>
    row.forEach((tile, x) => {
      if (tile) tilesOnBoard.push({ x, y });
    })
  );

  if (tilesOnBoard.length === 0) return false;

  // Start BFS from the first tile
  const queue: { x: number; y: number }[] = [tilesOnBoard[0]];
  visited.add(`${tilesOnBoard[0].x},${tilesOnBoard[0].y}`);

  // BFS traversal to find all connected tiles
  while (queue.length > 0) {
    const { x, y } = queue.shift()!;
    const neighbors = [
      { x: x - 1, y },  // Left
      { x: x + 1, y },  // Right
      { x, y: y - 1 },  // Up
      { x, y: y + 1 },  // Down
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

  // Ensure all tiles are connected - compare visited count to total tiles
  const allTilesConnected = tilesOnBoard.every(({ x, y }) =>
    visited.has(`${x},${y}`)
  );

  return allWordsValid && allTilesConnected;
}