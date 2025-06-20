import React from 'react';
import { Cell } from '../Cell';
import { Board as BoardType, DraggedItem } from '../../types';

interface BoardProps {
  board: BoardType;
  onDropTile: (item: DraggedItem, x: number, y: number) => void;
}

export const Board: React.FC<BoardProps> = ({ board, onDropTile }) => {
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
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};