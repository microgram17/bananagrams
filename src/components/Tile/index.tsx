import React from 'react';
import { useDrag } from 'react-dnd';
import { Tile as TileType, Position } from '../../types';

interface TileProps {
  tile: TileType;
  source: 'hand' | Position; // Where the tile is coming from
  onClick?: (tile: TileType) => void;
}

export const Tile: React.FC<TileProps> = ({ tile, source, onClick }) => {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: 'tile',
      item: { tile, source }, // The item is the payload that gets passed on drop
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    [tile, source] // Add this dependency array
  );

  const cursorStyle = onClick ? 'pointer' : 'grab';

  return (
    <div
      ref={drag}
      onClick={onClick ? () => onClick(tile) : undefined}
      className={`w-10 h-10 bg-yellow-300 border-2 border-yellow-400 rounded-md flex items-center justify-center font-bold text-xl text-gray-800 select-none shadow-md hover:bg-yellow-200 transition-colors ${cursorStyle}`}
      style={{ opacity: isDragging ? 0.4 : 1 }}
    >
      {tile.letter}
    </div>
  );
};