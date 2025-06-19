import React from 'react';
import { useDrop } from 'react-dnd';
import TileUI from '../Tile'; // Using the consolidated Tile component
import { Tile, DraggedItem } from '../../types';
import './PlayerHand.css';

interface PlayerHandProps {
  tiles: Tile[];
  onDropTile: (item: DraggedItem) => void;
  onTileClick: (tile: Tile) => void;
}

const PlayerHand: React.FC<PlayerHandProps> = ({ tiles, onDropTile, onTileClick }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'tile',
    drop: (item: DraggedItem) => onDropTile(item),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div ref={drop} className={`player-hand ${isOver ? 'is-over' : ''}`}>
      <h2>Your Tiles</h2>
      <div className="tiles-container">
        {tiles.map((tile) => (
          <TileUI
            key={tile.id}
            tile={tile}
            onClick={onTileClick}
            origin={{ type: 'hand' }}
          />
        ))}
      </div>
    </div>
  );
};

export default PlayerHand;
