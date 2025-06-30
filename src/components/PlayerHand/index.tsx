/**
 * PlayerHand component for the Bananagrams game.
 * 
 * Displays the player's current tiles and handles interaction with them.
 * Players can drag tiles from their hand to the board or click tiles to "dump" them.
 */
import React from 'react';
import { useDrop } from 'react-dnd';
import { Tile as TileComponent } from '../Tile';
import { Tile, DraggedItem } from '../../types';

/**
 * Props for the PlayerHand component
 * @property tiles - Array of tiles in the player's hand
 * @property onDropTile - Callback for when a tile is dropped on the hand (return from board)
 * @property onTileClick - Callback for when a tile is clicked (dump action)
 */
interface PlayerHandProps {
  tiles: Tile[];
  onDropTile: (item: DraggedItem) => void;
  onTileClick: (tile: Tile) => void; // For the "dump" action
}

/**
 * Renders the player's hand of tiles.
 * Acts as a drop target for tiles being returned from the board.
 * Allows clicking tiles to trigger the "dump" action.
 */
export const PlayerHand: React.FC<PlayerHandProps> = ({ tiles, onDropTile, onTileClick }) => {
  // Set up drop target using react-dnd
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'tile',
    drop: (item: DraggedItem) => onDropTile(item),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }));

  /**
   * Changes background color when a tile is being dragged over the hand
   * Provides visual feedback that the hand is a valid drop target
   */
  const getBackgroundColor = () => {
    if (isOver && canDrop) return 'bg-blue-100';
    return 'bg-gray-100';
  };

  return (
    <div
      ref={drop}
      className={`p-4 rounded-lg shadow-md transition-all duration-300 w-full ${getBackgroundColor()} backdrop-blur-sm border border-gray-200`}
    >
      {/* Hand title with tile count */}
      <h2 className="text-xl font-bold mb-2 text-gray-800 flex items-center">
        <span className="bg-yellow-300 w-8 h-8 flex items-center justify-center rounded-full mr-2 shadow-sm">
          {tiles.length}
        </span>
        Your Tiles
      </h2>
      <p className="text-sm text-gray-600 mb-3 italic">Click a tile to dump it.</p>
      
      {/* Tile display area */}
      <div className="flex flex-wrap gap-2 justify-center">
        {tiles.map((tile, index) => (
          <div 
            key={tile.id} 
            className="transform hover:-translate-y-1 transition-transform" 
            // Staggered animation delay for visual appeal when tiles are added
            style={{animationDelay: `${index * 0.05}s`}}
          >
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
