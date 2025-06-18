import React from 'react';
import { Board as BoardType, BoardTile, Tile as TileType } from '../../types';
import Cell from '../Cell';
import './Board.css';

interface BoardProps {
  board: BoardType;
  onDropTile: (tile: TileType | BoardTile, x: number, y: number) => void;
}

const Board: React.FC<BoardProps> = ({ board, onDropTile }) => {
  return (
    <div className="board">
      {board.map((row, y) => (
        <div key={y} className="board-row">
          {row.map((tile, x) => {
            const boardTile: BoardTile | null = tile ? { ...tile, x, y } : null;
            return <Cell key={`${x}-${y}`} x={x} y={y} tile={boardTile} onDropTile={onDropTile} />;
          })}
        </div>
      ))}
    </div>
  );
};

export default Board;