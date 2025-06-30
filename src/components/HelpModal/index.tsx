/**
 * HelpModal component for the Bananagrams game.
 * 
 * Provides a modal dialog with game rules and instructions.
 * Helps players understand how to play the game and the special actions available.
 */
import React from 'react';

/**
 * Props for the HelpModal component
 * @property isOpen - Whether the modal is currently visible
 * @property onClose - Callback for closing the modal
 */
interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Renders a modal dialog with game instructions.
 * Displays rules for Bananagrams, keyboard controls, and winning conditions.
 */
export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  // Don't render anything if the modal is closed
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Modal header with title and close button */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-yellow-600">How to Play Bananagrams</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Close help modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Modal content - game instructions */}
          <div className="space-y-4 text-gray-700">
            {/* Game objective */}
            <section>
              <h3 className="text-lg font-bold text-yellow-700 mb-2">Goal</h3>
              <p>Use all your tiles to form a valid crossword grid. All words must be connected and be real words.</p>
            </section>

            {/* Game actions */}
            <section>
              <h3 className="text-lg font-bold text-yellow-700 mb-2">Actions</h3>
              
              <div className="ml-4 mb-3">
                <h4 className="font-bold text-gray-800">Skala (Peel)</h4>
                <p>When you've used all your tiles, click "Skala!" to draw a new tile from the bunch. Everyone else must also draw a tile.</p>
              </div>
              
              <div className="ml-4 mb-3">
                <h4 className="font-bold text-gray-800">Dumpa (Dump)</h4>
                <p>At any time, you can put one of your tiles back into the bunch (click it in your hand) and take three in its place.</p>
              </div>
            </section>

            {/* Keyboard controls */}
            <section>
              <h3 className="text-lg font-bold text-yellow-700 mb-2">Keyboard Controls</h3>
              <ul className="list-disc ml-6">
                <li>Arrow keys to navigate the board</li>
                <li>Press TAB to toggle between horizontal and vertical typing</li>
                <li>Type letters to place tiles from your hand</li>
                <li>Backspace to remove a tile</li>
              </ul>
            </section>

            {/* Winning conditions */}
            <section>
              <h3 className="text-lg font-bold text-yellow-700 mb-2">Winning</h3>
              <p>The first player to use all their tiles in a valid crossword grid wins! Click "Check Board" to validate your grid.</p>
            </section>

            {/* Advanced mechanics */}
            <section>
              <h3 className="text-lg font-bold text-yellow-700 mb-2">Game Mechanics</h3>
              
              <div className="ml-4 mb-3">
                <h4 className="font-bold text-gray-800">Auto-Peel</h4>
                <p>When you use all your tiles, you'll automatically draw a new tile. All other players will also draw a tile.</p>
              </div>
              
              <div className="ml-4 mb-3">
                <h4 className="font-bold text-gray-800">Other Players</h4>
                <p>Simulated players will automatically "peel" when they've used all their tiles. Watch their tile counts - players with fewer tiles are closer to peeling!</p>
              </div>
              
              <div className="ml-4 mb-3">
                <h4 className="font-bold text-gray-800">Rotten Banana</h4>
                <p>If you use all your tiles when there are no more tiles in the pool, but your board has errors, you're a "rotten banana" and lose the game!</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};