/**
 * Board component for the Bananagrams game.
 * 
 * Renders the game board as a grid of cells where players can place their tiles.
 * The board is the central playing area where words are formed.
 */
import React from 'react';
import { Cell } from '../Cell';
import { Board as BoardType, DraggedItem, Position } from '../../types';

/**
 * Props for the Board component
 * @property board - 2D array representing the current state of the game board
 * @property onDropTile - Callback for when a tile is dropped on a cell
 * @property selectedCell - The currently selected cell for keyboard input
 * @property onCellClick - Callback for when a cell is clicked
 */
interface BoardProps {
  board: BoardType;
  onDropTile: (item: DraggedItem, x: number, y: number) => void;
  selectedCell: Position | null;
  onCellClick: (position: Position) => void;
}

/**
 * Renders the game board as a grid of cells.
 * Each cell can contain a tile or be empty.
 */
export const Board: React.FC<BoardProps> = ({ board, onDropTile, selectedCell, onCellClick }) => {
  return (
    <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg shadow-inner">
      {/* Render each row of the board */}
      {board.map((row, y) => (
        <div key={y} className="flex">
          {/* Render each cell in the row */}
          {row.map((tile, x) => (
            <Cell
              key={tile ? tile.id : `${x}-${y}`}
              x={x}
              y={y}
              tile={tile}
              onDropTile={onDropTile}
              isSelected={!!selectedCell && selectedCell.x === x && selectedCell.y === y}
              onClick={() => onCellClick({ x, y })}
            />
          ))}
        </div>
      ))}
    </div>
  );
};