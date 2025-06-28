import React from 'react';
import { GameStatus } from '../../types';

interface ControlsProps {
  status: GameStatus;
  playerCount: number;
  typingDirection: 'horizontal' | 'vertical';
  tilesInPool: number;
  simulatedPlayerTiles: number[];
  onPlayerCountChange: (count: number) => void;
  onStart: () => void;
  onPeel: () => void;
  onCheck: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  status,
  playerCount,
  typingDirection,
  tilesInPool,
  simulatedPlayerTiles,
  onPlayerCountChange,
  onStart,
  onPeel,
  onCheck,
}) => {
  const isPreGame = status === 'pre-game';

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg flex flex-col gap-3 border border-gray-100 w-full">
      <h2 className="text-xl font-bold text-gray-800 flex items-center">
        <svg className="w-6 h-6 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
        </svg>
        Game Controls
      </h2>

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
        <>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onPeel}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
              </svg>
              Skala! (Peel)
            </button>
            <button
              onClick={onCheck}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-bold py-3 px-4 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-md flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Check Board
            </button>
          </div>
          <div className="text-center text-sm bg-gray-50 p-3 rounded-md border border-gray-100">
            <span className="font-medium">Typing Direction:</span> 
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-md font-mono">{typingDirection.toUpperCase()}</span>
            <span className="ml-2 text-gray-500">(Press TAB to toggle)</span>
          </div>
        </>
      )}

      {!isPreGame && (
        <div className="text-center text-sm bg-gray-50 p-3 rounded-md border border-gray-100">
          <div className="mb-2">
            <span className="font-medium">Tiles in Pool:</span> 
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-md font-mono">{tilesInPool}</span>
          </div>
          {simulatedPlayerTiles.length > 0 && (
            <div className="text-xs text-gray-600">
              <span className="font-medium">Other Players' Tiles:</span>{' '}
              {simulatedPlayerTiles.map((count, index) => (
                <span key={index} className="inline-block mx-1">
                  Player {index + 2}: <span className="font-mono">{count}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};