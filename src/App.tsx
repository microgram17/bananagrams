import React, { useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Board } from "./components/Board";
import { PlayerHand } from "./components/PlayerHand";
import { Controls } from "./components/Controls";
import { useGameStore, GameState, GameActions } from "./store/useGameStore";
import { DraggedItem, Letter } from "./types";
import { loadWordList } from "./logic/wordChecker";

function App() {
  const {
    status,
    board,
    playerHand,
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
  } = useGameStore((state: GameState & GameActions) => ({
    status: state.status,
    board: state.board,
    playerHand: state.playerHand,
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
  }));

  useEffect(() => {
    // Load the word list when the app starts
    loadWordList().catch(() => {
      console.error("Failed to load word list.");
    });
  }, []);

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


  const moveTileToBoard = (item: DraggedItem, x: number, y: number) => {
    moveTile(item, { x, y });
  };

  const moveTileToHand = (item: DraggedItem) => {
    moveTile(item, "hand");
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="App min-h-screen font-sans p-1 bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-50">
        <main className="grid grid-cols-1 lg:grid-cols-5 gap-2 mt-6" style={{ marginLeft: '1%', marginRight: '1%' }}>
          <div className="lg:col-span-3 flex flex-col items-start">
            <div className="board-container">
              <Board
                board={board}
                onDropTile={moveTileToBoard}
                selectedCell={selectedCell}
                onCellClick={setSelectedCell}
              />
            </div>
          </div>

          <aside className="lg:col-span-2 flex flex-col gap-3">
            <header className="mb-3">
              <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-700">
                Bananagrams
              </h1>
              <p className="text-gray-600 text-base mt-1">Drag tiles to build your word grid</p>
            </header>
            
            <Controls
              status={status}
              playerCount={playerCount}
              onPlayerCountChange={setPlayerCount}
              onStart={startGame}
              onPeel={skala}
              onCheck={checkWinCondition}
              typingDirection={typingDirection}
            />
            
            <div className="bg-white bg-opacity-80 rounded-lg p-3 shadow-md backdrop-blur-sm border-l-4 border-yellow-400">
              <p className="message font-medium text-gray-700">
                {message}
              </p>
            </div>
            
            <PlayerHand
              tiles={playerHand}
              onDropTile={moveTileToHand}
              onTileClick={dumpa}
            />
          </aside>
        </main>
      </div>
    </DndProvider>
  );
}

export default App;
