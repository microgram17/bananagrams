import React from 'react';
import Cell from '../Cell';
import { Board as BoardType, Tile, DraggedItem } from '../../types';
import './Board.css';

interface BoardProps {
  board: BoardType;
  onDropTile: (item: DraggedItem, x: number, y: number) => void;
}

const Board: React.FC<BoardProps> = ({ board, onDropTile }) => {
  return (
    <div className="board">
      {board.map((row, y) => (
        <div key={y} className="board-row">
          {row.map((tile, x) => {
            return <Cell key={`${x}-${y}`} x={x} y={y} tile={tile} onDropTile={onDropTile} />;
          })}
        </div>
      ))}
    </div>
  );
};

export default Board;