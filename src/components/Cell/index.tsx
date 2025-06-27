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
    if (isOver && canDrop) return 'bg-green-200';
    return 'bg-yellow-100/50';
  };

  const borderStyle = isSelected
    ? 'border-blue-500 border-2'
    : 'border-dashed border-gray-300 border';

  return (
    <div
      ref={drop}
      onClick={onClick}
      className={`w-11 h-11 flex items-center justify-center transition-colors cursor-pointer ${getBackgroundColor()} ${borderStyle}`}
    >
      {tile && <TileComponent tile={tile} source={{ x, y }} />}
    </div>
  );
};
