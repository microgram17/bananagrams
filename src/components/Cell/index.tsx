import React from 'react';
import { useDrop } from 'react-dnd';
import { Tile as TileComponent } from '../Tile';
import { Tile, DraggedItem, Position } from '../../types';

interface CellProps {
  x: number;
  y: number;
  tile: Tile | null;
  onDropTile: (item: DraggedItem, x: number, y: number) => void;
  isSelected: boolean;
  onClick: () => void;
}

export const Cell: React.FC<CellProps> = ({ x, y, tile, onDropTile, isSelected, onClick }) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'tile',
    drop: (item: DraggedItem) => onDropTile(item, x, y),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }));

  const getBackgroundColor = () => {
    if (isOver && canDrop) return 'bg-green-200 bg-opacity-80';
    if (isSelected) return 'bg-yellow-100 bg-opacity-80';
    return 'bg-yellow-50 bg-opacity-50';
  };

  const borderStyle = isSelected
    ? 'ring-2 ring-yellow-500 ring-opacity-90 pulse-shadow'
    : 'border-dashed border-gray-300 border';

  // Add a scale and glow effect when hovering
  const hoverEffect = isOver && canDrop 
    ? 'scale-110 shadow-md shadow-green-300' 
    : 'scale-100 hover:bg-yellow-100 hover:bg-opacity-70';

  return (
    <div
      ref={drop}
      onClick={onClick}
      className={`w-10 h-10 flex items-center justify-center transition-all duration-150 ease-in-out cursor-pointer ${getBackgroundColor()} ${borderStyle} ${hoverEffect}`}
    >
      {tile && (
        <div className={tile.isRemoving ? "tile-remove" : "tile-pop-in"}>
          <TileComponent tile={tile} source={{ x, y }} />
        </div>
      )}
    </div>
  );
};
