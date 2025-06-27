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
      item: { tile, source },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    [tile, source]
  );

  const cursorStyle = onClick ? 'pointer' : 'grab';

  // Apply different styles when dragging
  const draggingStyles = isDragging
    ? 'opacity-50 scale-110 shadow-xl'
    : 'shadow-md hover:shadow-lg hover:scale-105';

  return (
    <div
      ref={drag}
      onClick={onClick ? () => onClick(tile) : undefined}
      className={`w-10 h-10 bg-gradient-to-br from-yellow-200 to-yellow-400 border-2 border-yellow-500 rounded-md flex items-center justify-center font-bold text-xl text-gray-800 select-none transition-all duration-150 ease-in-out ${cursorStyle} ${draggingStyles} transform rotate-${Math.floor(Math.random() * 3) - 1} shadow-lg`}
    >
      {tile.letter}
    </div>
  );
};