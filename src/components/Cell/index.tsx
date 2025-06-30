/**
 * Cell component for the Bananagrams game.
 * 
 * Represents a single cell on the game board where tiles can be placed.
 * Handles drag and drop interactions and visual feedback for player actions.
 */
import React from 'react';
import { useDrop } from 'react-dnd';
import { Tile as TileComponent } from '../Tile';
import { Tile, DraggedItem, Position } from '../../types';

/**
 * Props for the Cell component
 * @property x - X coordinate of the cell on the board
 * @property y - Y Y coordinate of the cell on the board
 * @property tile - The tile placed on this cell, or null if empty
 * @property onDropTile - Callback for when a tile is dropped on this cell
 * @property isSelected - Whether this cell is currently selected (for keyboard input)
 * @property onClick - Callback for when the cell is clicked
 */
interface CellProps {
  x: number;
  y: number;
  tile: Tile | null;
  onDropTile: (item: DraggedItem, x: number, y: number) => void;
  isSelected: boolean;
  onClick: () => void;
}

/**
 * Renders a single cell of the game board.
 * Uses react-dnd for drag and drop functionality.
 * Provides visual feedback for hover, selection, and dropping tiles.
 */
export const Cell: React.FC<CellProps> = ({ x, y, tile, onDropTile, isSelected, onClick }) => {
  // Set up drop target using react-dnd
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'tile',
    drop: (item: DraggedItem) => onDropTile(item, x, y),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }));

  /**
   * Determines the background color of the cell based on its state
   * - Green when a tile is being dragged over it
   * - Blue when it's the selected cell
   * - Default light yellow otherwise
   */
  const getBackgroundColor = () => {
    if (isOver && canDrop) return 'bg-green-200 bg-opacity-80';
    if (isSelected) return 'bg-blue-100 bg-opacity-70';
    return 'bg-yellow-50 bg-opacity-50';
  };

  // Only use border-dashed for non-selected cells
  const borderStyle = isSelected
    ? ''  // We'll use the box-shadow exclusively for selected cells
    : 'border-dashed border-gray-300 border';

  // Add a scale and glow effect when hovering
  const hoverEffect = isOver && canDrop 
    ? 'scale-110 shadow-md shadow-green-300' 
    : 'scale-100 hover:bg-yellow-100 hover:bg-opacity-70';

  return (
    <div
      ref={drop}
      onClick={onClick}
      className={`w-10 h-10 flex items-center justify-center transition-all duration-150 ease-in-out cursor-pointer ${getBackgroundColor()} ${borderStyle} ${hoverEffect} relative`}
      style={isSelected ? { 
        outline: '2px solid #3b82f6',
        outlineOffset: '1px'
      } : {}}
    >
      {/* Render the tile if this cell contains one */}
      {tile && (
        <div className={`${tile.isRemoving ? "tile-remove" : "tile-pop-in"} ${isSelected ? "z-10" : ""}`}>
          <TileComponent tile={tile} source={{ x, y }} />
        </div>
      )}
      {/* Add a highlight border for the selected cell */}
      {isSelected && tile && (
        <div 
          className="absolute inset-0 pointer-events-none z-20" 
          style={{ boxShadow: '0 0 0 2px #3b82f6', borderRadius: '2px' }}
        ></div>
      )}
    </div>
  );
};
