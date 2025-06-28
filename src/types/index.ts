// All shared types for the Bananagrams game

// prettier-ignore
export type Letter = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'R' | 'S' | 'T' | 'U' | 'V' | 'X' | 'Y' | 'Ä' | 'Ö' | 'Å';

export interface Tile {
  id: string; // Unique identifier for drag-and-drop
  letter: Letter;
  isRemoving?: boolean; // Flag for removal animation
}

export interface Position {
  x: number;
  y: number;
}

// A tile placed on the game board
export interface BoardTile extends Tile {
  position: Position;
}

// The game board is a 2D grid that can hold a tile or be empty
export type Board = (Tile | null)[][];

export type GameStatus = 'pre-game' | 'in-progress' | 'won' | 'lost';

// Item type for React DnD
export interface DraggedItem {
  tile: Tile;
  source: 'hand' | Position; // Where the tile came from
}