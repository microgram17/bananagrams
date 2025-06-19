import React from 'react';
import { useDrag } from 'react-dnd';
import { Tile as TileType, Position } from '../../types';
import './Tile.css';

interface TileProps {
  tile: TileType;
  // The origin helps construct the correct DraggedItem
  origin: { type: 'hand' } | { type: 'board'; position: Position };
  // Optional click handler for actions like "dump"
  onClick?: (tile: TileType) => void;
}

const Tile: React.FC<TileProps> = ({ tile, origin, onClick }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'tile',
    // The item is the payload that gets passed on drop
    item: { ...tile, ...origin },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className="tile"
      onClick={onClick ? () => onClick(tile) : undefined}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: onClick ? 'pointer' : 'grab',
      }}
    >
      {tile.letter}
    </div>
  );
};

export default Tile;