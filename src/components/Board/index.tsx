import React from 'react';
import { Cell } from '../Cell';
import { Board as BoardType, DraggedItem, Position } from '../../types';

interface BoardProps {
  board: BoardType;
  onDropTile: (item: DraggedItem, x: number, y: number) => void;
  selectedCell: Position | null;
  onCellClick: (position: Position) => void;
}

export const Board: React.FC<BoardProps> = ({ board, onDropTile, selectedCell, onCellClick }) => {
  return (
    <div className="p-4 bg-yellow-100 rounded-lg shadow-inner overflow-auto">
      <div className="inline-block">
        {board.map((row, y) => (
          <div key={y} className="flex">
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
    </div>
  );
};