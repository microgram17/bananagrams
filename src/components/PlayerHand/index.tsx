import React from 'react';
import { useDrop } from 'react-dnd';
import { Tile as TileComponent } from '../Tile';
import { Tile, DraggedItem } from '../../types';

interface PlayerHandProps {
  tiles: Tile[];
  onDropTile: (item: DraggedItem) => void;
  onTileClick: (tile: Tile) => void; // For the "dump" action
}

export const PlayerHand: React.FC<PlayerHandProps> = ({ tiles, onDropTile, onTileClick }) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'tile',
    drop: (item: DraggedItem) => onDropTile(item),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }));

  const getBackgroundColor = () => {
    if (isOver && canDrop) return 'bg-blue-100';
    return 'bg-gray-100';
  };

  return (
    <div
      ref={drop}
      className={`p-5 rounded-lg shadow-md transition-all duration-300 ${getBackgroundColor()} backdrop-blur-sm border border-gray-200`}
    >
      <h2 className="text-xl font-bold mb-3 text-gray-800 flex items-center">
        <span className="bg-yellow-300 w-8 h-8 flex items-center justify-center rounded-full mr-2 shadow-sm">
          {tiles.length}
        </span>
        Your Tiles
      </h2>
      <p className="text-sm text-gray-600 mb-4 italic">Click a tile to dump it.</p>
      <div className="flex flex-wrap gap-3 justify-center">
        {tiles.map((tile, index) => (
          <div key={tile.id} className="transform hover:-translate-y-1 transition-transform" 
               style={{animationDelay: `${index * 0.05}s`}}>
            <TileComponent
              tile={tile}
              source="hand"
              onClick={onTileClick}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
