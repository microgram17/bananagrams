export type Letter =
  | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J'
  | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'R' | 'S' | 'T' | 'U'
  | 'V' | 'X' | 'Y' | 'Ä' | 'Ö' | 'Å';

export interface Tile {
  id: string;
  letter: Letter;
}

export interface Position {
  x: number;
  y: number;
}

export interface BoardTile extends Tile {
  position: Position;
}

export type Board = (Tile | null)[][];

export type GameStatus = 'pre-game' | 'in-progress' | 'finished';

// An item being dragged can be from the hand or the board
export type DraggedItem =
  | { type: 'hand'; id: string; letter: Letter }
  | { type: 'board'; id: string; letter: Letter; position: Position };


// The complete state of the game, managed by the reducer
export interface GameState {
  status: GameStatus;
  bunch: Tile[];
  playerHand: Tile[];
  board: Board;
  wordList: Set<string>;
  message: string;
}