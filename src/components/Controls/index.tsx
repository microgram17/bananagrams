import React from 'react';
import { GameStatus } from '../../types';

interface ControlsProps {
  status: GameStatus;
  playerCount: number;
  onPlayerCountChange: (count: number) => void;
  onStart: () => void;
  onPeel: () => void;
  onCheck: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  status,
  playerCount,
  onPlayerCountChange,
  onStart,
  onPeel,
  onCheck,
}) => {
  const isPreGame = status === 'pre-game';

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md flex flex-col gap-4">
      <h2 className="text-xl font-bold text-gray-700">Game Controls</h2>

      {isPreGame ? (
        <>
          <div>
            <label htmlFor="playerCount" className="block text-sm font-medium text-gray-600 mb-1">
              Simulate Player Count
            </label>
            <select
              id="playerCount"
              value={playerCount}
              onChange={(e) => onPlayerCountChange(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value={1}>1 Player (21 tiles)</option>
              <option value={2}>2 Players (21 tiles)</option>
              <option value={3}>3 Players (21 tiles)</option>
              <option value={4}>4 Players (21 tiles)</option>
              <option value={5}>5 Players (15 tiles)</option>
              <option value={6}>6 Players (15 tiles)</option>
              <option value={7}>7 Players (11 tiles)</option>
              <option value={8}>8 Players (11 tiles)</option>
            </select>
          </div>
          <button
            onClick={onStart}
            className="w-full bg-green-500 text-white font-bold py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
          >
            Start Game
          </button>
        </>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onPeel}
            className="bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
          >
            Skala! (Peel)
          </button>
          <button
            onClick={onCheck}
            className="bg-yellow-500 text-white font-bold py-2 px-4 rounded-md hover:bg-yellow-600 transition-colors"
          >
            Check Board
          </button>
        </div>
      )}
    </div>
  );
};