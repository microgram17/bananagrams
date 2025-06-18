export type Letter =
  | "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I"
  | "J" | "K" | "L" | "M" | "N" | "O" | "P" | "Q" | "R"
  | "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z" | "Ä" | "Ö" | "Å";

export interface Tile {
  id: string; // Changed from number to string
  letter: Letter;
}

export interface BoardTile extends Tile {
  x: number;
  y: number;
}

export type Board = (Tile | null)[][];

export type GameState = "pre-game" | "in-progress" | "finished";

export interface Position {
  x: number;
  y: number;
}