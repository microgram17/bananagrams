import React from 'react';
import { useDrop, DropTargetMonitor } from 'react-dnd';
import { Tile as TileType, BoardTile } from '../../types';
import Tile from '../Tile';
import { ItemTypes } from '../Tile';
import './PlayerHand.css';

interface PlayerHandProps {
  tiles: TileType[];
  onDropTile: (tile: BoardTile) => void;
  onTileClick: (tile: TileType) => void;
}

const PlayerHand: React.FC<PlayerHandProps> = ({ tiles, onDropTile, onTileClick }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.TILE,
    drop: (item: BoardTile) => {
      // Only allow drops from the board, not from the hand to the hand.
      if ('x' in item) {
        onDropTile(item);
      }
    },
    collect: (monitor: DropTargetMonitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div ref={drop} className={`player-hand ${isOver ? 'over' : ''}`}>
      <div className="tiles-container">
        {tiles.map(tile => (
          <div key={tile.id} onClick={() => onTileClick(tile)} title="Click to dump">
            <Tile tile={tile} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerHand;
