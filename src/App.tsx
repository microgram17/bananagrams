/**
 * Main application component for the Bananagrams game.
 * 
 * This component:
 * - Orchestrates the entire game flow
 * - Sets up drag and drop functionality
 * - Handles keyboard controls for gameplay
 * - Manages modals and notifications
 * - Coordinates between the game store and UI components
 */
import React, { useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Board } from "./components/Board";
import { PlayerHand } from "./components/PlayerHand";
import { Controls } from "./components/Controls";
import { useGameStore, GameState, GameActions } from "./store/useGameStore";
import { DraggedItem, Letter } from "./types";
import { loadWordList } from "./logic/wordChecker";
import { HelpModal } from "./components/HelpModal";

function App() {
  // Extract all needed state and actions from the game store
  const {
    status,
    board,
    playerHand,
    tilePool,
    simulatedPlayerHands,
    message,
    playerCount,
    selectedCell,
    typingDirection,
    setPlayerCount,
    startGame,
    skala,
    dumpa,
    moveTile,
    checkWinCondition,
    setSelectedCell,
    toggleTypingDirection,
    moveSelectedCell,
    placeTileByKey,
    handleBackspace,
    lastAiPeeler,
    isRottenBanana,
    checkAutoSkala,
    resetGame,
  } = useGameStore((state: GameState & GameActions) => ({
    status: state.status,
    board: state.board,
    playerHand: state.playerHand,
    tilePool: state.tilePool,
    simulatedPlayerHands: state.simulatedPlayerHands,
    message: state.message,
    playerCount: state.playerCount,
    selectedCell: state.selectedCell,
    typingDirection: state.typingDirection,
    setPlayerCount: state.setPlayerCount,
    startGame: state.startGame,
    skala: state.skala,
    dumpa: state.dumpa,
    moveTile: state.moveTile,
    checkWinCondition: state.checkWinCondition,
    setSelectedCell: state.setSelectedCell,
    toggleTypingDirection: state.toggleTypingDirection,
    moveSelectedCell: state.moveSelectedCell,
    placeTileByKey: state.placeTileByKey,
    handleBackspace: state.handleBackspace,
    lastAiPeeler: state.lastAiPeeler,
    isRottenBanana: state.isRottenBanana,
    checkAutoSkala: state.checkAutoSkala,
    resetGame: state.resetGame,
  }));

  // Local state for UI elements
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [aiPeelNotification, setAiPeelNotification] = useState<string | null>(null);

  /**
   * Effect to load the word dictionary when the app starts
   * This is crucial for validating words during gameplay
   */
  useEffect(() => {
    loadWordList().catch(() => {
      console.error("Failed to load word list.");
    });
  }, []);

  /**
   * Effect to handle keyboard inputs for game controls
   * Allows players to use keyboard for:
   * - Arrow keys: Navigate the board
   * - Tab: Toggle typing direction
   * - Letter keys: Place tiles from hand
   * - Backspace: Remove tiles
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status !== 'in-progress') return;

      // Handle special keys only when a cell is selected
      if (e.key.startsWith('Arrow') || e.key === 'Backspace') {
        if (!selectedCell) return;
        e.preventDefault();
        if (e.key === 'ArrowUp') moveSelectedCell('up');
        else if (e.key === 'ArrowDown') moveSelectedCell('down');
        else if (e.key === 'ArrowLeft') moveSelectedCell('left');
        else if (e.key === 'ArrowRight') moveSelectedCell('right');
        else if (e.key === 'Backspace') handleBackspace();
        return;
      }

      // Handle global keys
      if (e.key === 'Tab') {
        e.preventDefault();
        toggleTypingDirection();
      } else if (e.key.match(/^[a-zA-ZåäöÅÄÖ]$/) && e.key.length === 1) {
        if (!selectedCell) return;
        e.preventDefault();
        placeTileByKey(e.key.toUpperCase() as Letter);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, selectedCell, moveSelectedCell, handleBackspace, toggleTypingDirection, placeTileByKey]);

  /**
   * Effect to display notifications when AI players peel tiles
   * Shows a temporary notification and clears it after 3 seconds
   */
  useEffect(() => {
    if (lastAiPeeler !== null) {
      setAiPeelNotification(`Player ${lastAiPeeler + 2} peeled!`);
      
      // Clear notification after 3 seconds
      const timer = setTimeout(() => {
        setAiPeelNotification(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    } else {
      // Ensure notification is cleared when lastAiPeeler is reset
      setAiPeelNotification(null);
    }
  }, [lastAiPeeler]);

  /**
   * Effect to automatically check if player should "skala" (peel)
   * when they use all their tiles
   */
  useEffect(() => {
    if (status === 'in-progress') {
      checkAutoSkala();
    }
  }, [playerHand.length, status, checkAutoSkala]);

  /**
   * Handles moving a tile from one location to another on the board
   * @param item - The tile being moved and its source
   * @param x - Destination x coordinate
   * @param y - Destination y coordinate
   */
  const moveTileToBoard = (item: DraggedItem, x: number, y: number) => {
    moveTile(item, { x, y });
  };

  /**
   * Handles moving a tile from the board back to the player's hand
   * @param item - The tile being moved and its source
   */
  const moveTileToHand = (item: DraggedItem) => {
    moveTile(item, "hand");
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="App min-h-screen font-sans p-1 bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-50">
        {/* Help Button */}
        <div className="fixed top-4 right-4 z-10">
          <button
            onClick={() => setIsHelpModalOpen(true)}
            className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-bold rounded-full w-10 h-10 flex items-center justify-center shadow-md border-2 border-yellow-300 transition-all hover:scale-110"
            aria-label="Help"
          >
            <span className="text-xl">?</span>
          </button>
        </div>
        
        {/* Main game layout - grid with board on left, controls on right */}
        <main className="grid grid-cols-1 lg:grid-cols-5 gap-2 mt-6" style={{ marginLeft: '3%', marginRight: '3%' }}>
          {/* Game board area */}
          <div className="lg:col-span-3 flex flex-col items-start pl-4">
            <div className="board-container">
              <Board
                board={board}
                onDropTile={moveTileToBoard}
                selectedCell={selectedCell}
                onCellClick={setSelectedCell}
              />
            </div>
          </div>

          {/* Sidebar with controls and player hand */}
          <aside className="lg:col-span-2 flex flex-col gap-3">
            <header className="mb-3">
              <h1 
                className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-700 cursor-pointer hover:scale-105 transition-transform"
                onClick={resetGame}
                title="Click to reset game"
              >
                Bananagrams
              </h1>
              <p className="text-gray-600 text-base mt-1">Drag tiles to build your word grid</p>
            </header>
            
            {/* Game controls component */}
            <Controls
              status={status}
              playerCount={playerCount}
              onPlayerCountChange={setPlayerCount}
              onStart={startGame}
              onPeel={skala}
              onCheck={checkWinCondition}
              typingDirection={typingDirection}
              tilesInPool={tilePool.length}
              simulatedPlayerTiles={simulatedPlayerHands.map(hand => hand.length)}
              hideSkalaButton={true}
            />
            
            {/* Player's hand of tiles */}
            <PlayerHand
              tiles={playerHand}
              onDropTile={moveTileToHand}
              onTileClick={dumpa}
            />
            
            {/* Game message display */}
            <div className="bg-white bg-opacity-80 rounded-lg p-3 shadow-md backdrop-blur-sm border-l-4 border-yellow-400">
              <p className="message font-medium text-gray-700">
                {message}
              </p>
            </div>
          </aside>
        </main>
        
        {/* Help Modal - displays game rules */}
        <HelpModal 
          isOpen={isHelpModalOpen} 
          onClose={() => setIsHelpModalOpen(false)} 
        />
        
        {/* Game Over / Lost Notification */}
        {status === 'lost' && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md text-center">
              <h2 className="text-3xl font-bold mb-4 text-red-600">Game Over!</h2>
              <p className="mb-6 text-gray-800">
                {message || "An opponent has finished their board and won the game!"}
              </p>
              <button
                onClick={startGame}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
}

export default App;
