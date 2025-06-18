import React from 'react';
import { useDrag, DragSourceMonitor } from 'react-dnd';
import { Tile as TileType, BoardTile } from '../../types';
import './Tile.css';

export const ItemTypes = {
  TILE: 'tile',
};

interface TileProps {
  tile: TileType | BoardTile;
}

const Tile: React.FC<TileProps> = ({ tile }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.TILE,
    item: { ...tile },
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div ref={drag} className="tile" style={{ opacity: isDragging ? 0.5 : 1 }}>
      {tile.letter}
    </div>
  );
};

export default Tile;