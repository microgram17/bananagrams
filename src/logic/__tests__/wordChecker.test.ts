import { wordList, extractWordsFromBoard, checkVictory } from '../wordChecker';
import { Board, Tile } from '../../types';

// Helper function to create a tile
const createTile = (letter: string): Tile => ({
  id: `${letter}-${Math.random()}`,
  // @ts-ignore - String used as Letter in tests
  letter,
  isSelected: false
});

// Helper function to create an empty board of specified size
const createEmptyBoard = (size: number): Board => {
  return Array(size).fill(null).map(() => Array(size).fill(null));
};

describe('wordChecker', () => {
  // Mock the wordList
  beforeEach(() => {
    // @ts-ignore - Overriding the readonly Set for testing
    wordList = new Set([
      'cat', 'dog', 'bat', 'rat', 'hat', 'car', 'bar', 'dar',
      'bil', 'mat', 'tak', 'dal', 'bad', 'hav', 'bok', 'bra',
      'dag', 'arm', 'dam', 'val', 'rad', 'tar', 'ava', 'dan'
    ]);
  });

  describe('extractWordsFromBoard', () => {
    test('should return an empty array for an empty board', () => {
      const board = createEmptyBoard(15);
      expect(extractWordsFromBoard(board)).toEqual([]);
    });

    test('should extract a single horizontal word', () => {
      const board = createEmptyBoard(15);
      // Place "CAT" horizontally
      board[7][7] = createTile('C');
      board[7][8] = createTile('A');
      board[7][9] = createTile('T');

      const extractedWords = extractWordsFromBoard(board);
      expect(extractedWords).toHaveLength(1);
      expect(extractedWords).toContain('CAT');
    });

    test('should extract a single vertical word', () => {
      const board = createEmptyBoard(15);
      // Place "DOG" vertically
      board[6][7] = createTile('D');
      board[7][7] = createTile('O');
      board[8][7] = createTile('G');

      const extractedWords = extractWordsFromBoard(board);
      expect(extractedWords).toHaveLength(1);
      expect(extractedWords).toContain('DOG');
    });

    test('should extract intersecting words', () => {
      const board = createEmptyBoard(15);
      // Place "BAT" horizontally
      board[7][7] = createTile('B');
      board[7][8] = createTile('A');
      board[7][9] = createTile('T');
      
      // Place "CAR" vertically, intersecting at 'A'
      board[6][8] = createTile('C');
      // 'A' is already at board[7][8] from "BAT"
      board[8][8] = createTile('R');

      const extractedWords = extractWordsFromBoard(board);
      expect(extractedWords).toHaveLength(2);
      expect(extractedWords).toContain('BAT');
      expect(extractedWords).toContain('CAR');
    });

    test('should ignore single letters', () => {
      const board = createEmptyBoard(15);
      // Place single letters and a valid word
      board[7][7] = createTile('X');
      board[9][9] = createTile('Y');
      
      // Place "BAT" as a valid word
      board[3][3] = createTile('B');
      board[3][4] = createTile('A');
      board[3][5] = createTile('T');

      const extractedWords = extractWordsFromBoard(board);
      expect(extractedWords).toHaveLength(1);
      expect(extractedWords).toContain('BAT');
      expect(extractedWords).not.toContain('X');
      expect(extractedWords).not.toContain('Y');
    });

    test('should extract multiple non-intersecting words', () => {
      const board = createEmptyBoard(15);
      // Place "CAT" horizontally
      board[5][5] = createTile('C');
      board[5][6] = createTile('A');
      board[5][7] = createTile('T');
      
      // Place "DOG" horizontally in another area
      board[10][10] = createTile('D');
      board[10][11] = createTile('O');
      board[10][12] = createTile('G');

      const extractedWords = extractWordsFromBoard(board);
      expect(extractedWords).toHaveLength(2);
      expect(extractedWords).toContain('CAT');
      expect(extractedWords).toContain('DOG');
    });
  });

  describe('checkVictory', () => {
    test('should return false for an empty board', () => {
      const board = createEmptyBoard(15);
      expect(checkVictory(board)).toBeFalsy();
    });

    test('should return true for a valid connected board with valid words', () => {
      const board = createEmptyBoard(15);
      // Create a valid board with "BAT" and "CAR" intersecting at "A"
      board[7][7] = createTile('B');
      board[7][8] = createTile('A');
      board[7][9] = createTile('T');
      
      board[6][8] = createTile('C');
      board[8][8] = createTile('R');

      expect(checkVictory(board)).toBeTruthy();
    });

    test('should return false if any word is invalid', () => {
      const board = createEmptyBoard(15);
      // Create a board with "CAT" (valid) and "XYZ" (invalid word)
      board[7][7] = createTile('C');
      board[7][8] = createTile('A');
      board[7][9] = createTile('T');
      
      // These are connected but form an invalid word
      board[7][10] = createTile('X');
      board[7][11] = createTile('Y');
      board[7][12] = createTile('Z');

      expect(checkVictory(board)).toBeFalsy();
    });

    test('should return false for disconnected tile groups', () => {
      const board = createEmptyBoard(15);
      // Create two valid but disconnected words: "CAT" and "DOG"
      board[7][7] = createTile('C');
      board[7][8] = createTile('A');
      board[7][9] = createTile('T');
      
      // Separate area, not connected to the first word
      board[3][3] = createTile('D');
      board[3][4] = createTile('O');
      board[3][5] = createTile('G');

      expect(checkVictory(board)).toBeFalsy();
    });

    test('should handle complex connected structures', () => {
      const board = createEmptyBoard(15);
      
      // Create a symmetric board with valid words in all directions:
      // R A D
      // A V A
      // D A N
      
      // First row
      board[5][5] = createTile('R');
      board[5][6] = createTile('A');
      board[5][7] = createTile('D');
      
      // Second row
      board[6][5] = createTile('A');
      board[6][6] = createTile('V');
      board[6][7] = createTile('A');
      
      // Third row
      board[7][5] = createTile('D');
      board[7][6] = createTile('A');
      board[7][7] = createTile('N');
      
      const extractedWords = extractWordsFromBoard(board);
      // This forms six valid words:
      // Horizontal: "RAD", "AVA", "DAN"
      // Vertical: "RAD", "AVA", "DAN"
      
      expect(extractedWords).toHaveLength(6);
      expect(extractedWords).toContain('RAD');
      expect(extractedWords).toContain('AVA');
      expect(extractedWords).toContain('DAN');
      expect(checkVictory(board)).toBeTruthy();
    });

    test('should return false for a board with only single letter tiles', () => {
      const board = createEmptyBoard(15);
      // Place disconnected single letters
      board[7][7] = createTile('A');
      board[9][9] = createTile('B');
      board[11][11] = createTile('C');

      expect(checkVictory(board)).toBeFalsy();
    });
  });
});