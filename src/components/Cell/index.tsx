import React from 'react';
import { useDrop } from 'react-dnd';
import TileUI from '../Tile'; // Using the consolidated Tile component
import { Tile, DraggedItem } from '../../types';
import './Cell.css';

interface CellProps {
  x: number;
  y: number;
  tile: Tile | null;
  onDropTile: (item: DraggedItem, x: number, y: number) => void;
}

const Cell: React.FC<CellProps> = ({ x, y, tile, onDropTile }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'tile',
    drop: (item: DraggedItem) => onDropTile(item, x, y),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div ref={drop} className={`cell ${isOver ? 'is-over' : ''}`}>
      {tile && <TileUI tile={tile} origin={{ type: 'board', position: { x, y } }} />}
    </div>
  );
};

export default Cell;
