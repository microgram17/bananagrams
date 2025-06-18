import React from 'react';
import { useDrop, DropTargetMonitor } from 'react-dnd';
import { Tile as TileType, BoardTile } from '../../types';
import Tile from '../Tile';
import { ItemTypes } from '../Tile';
import './Cell.css';

interface CellProps {
  x: number;
  y: number;
  tile: BoardTile | null;
  onDropTile: (tile: TileType | BoardTile, x: number, y: number) => void;
}

const Cell: React.FC<CellProps> = ({ x, y, tile, onDropTile }) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.TILE,
    drop: (item: TileType | BoardTile) => onDropTile(item, x, y),
    canDrop: () => !tile,
    collect: (monitor: DropTargetMonitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }));

  let backgroundColor = 'transparent';
  if (isOver && canDrop) {
    backgroundColor = 'lightgreen';
  } else if (isOver && !canDrop) {
    backgroundColor = 'lightcoral';
  }

  return (
    <div ref={drop} className="cell" style={{ backgroundColor }}>
      {tile && <Tile tile={tile} />}
    </div>
  );
};

export default React.memo(Cell);
