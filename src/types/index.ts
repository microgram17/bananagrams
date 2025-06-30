/**
 * This file contains all shared types and interfaces for the Bananagrams game.
 * It provides the type definitions that are used throughout the application
 * to ensure type safety and consistency.
 */

// Valid letters in the Swedish version of Bananagrams
// prettier-ignore
export type Letter = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'R' | 'S' | 'T' | 'U' | 'V' | 'X' | 'Y' | 'Ä' | 'Ö' | 'Å';

/**
 * Represents a single letter tile in the game.
 * Each tile has a unique ID for drag-and-drop operations
 * and tracking, and a letter value.
 */
export interface Tile {
  id: string;           // Unique identifier for drag-and-drop
  letter: Letter;       // The letter on the tile
  isRemoving?: boolean; // Flag for removal animation
}

/**
 * Represents a position on the game board grid.
 * Used for tile placement and board navigation.
 */
export interface Position {
  x: number; // Column (horizontal position)
  y: number; // Row (vertical position)
}

/**
 * Represents a tile that has been placed on the game board.
 * Extends the basic Tile with its position information.
 */
export interface BoardTile extends Tile {
  position: Position; // Where the tile is placed on the board
}

/**
 * The game board is a 2D grid where each cell can either
 * contain a tile or be empty (null).
 */
export type Board = (Tile | null)[][];

/**
 * Possible states of the game.
 * - pre-game: Initial setup before the game starts
 * - in-progress: The game is being played
 * - won: The player has won
 * - lost: The player has lost
 */
export type GameStatus = 'pre-game' | 'in-progress' | 'won' | 'lost';

/**
 * Information about a tile being dragged.
 * Used by React DnD to track drag operations.
 */
export interface DraggedItem {
  tile: Tile;            // The tile being dragged
  source: 'hand' | Position; // Where the tile came from (player's hand or a board position)
}