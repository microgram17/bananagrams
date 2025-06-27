import React, { useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Board } from "./components/Board";
import { PlayerHand } from "./components/PlayerHand";
import { Controls } from "./components/Controls";
import { useGameStore, GameState, GameActions } from "./store/useGameStore";
import { DraggedItem } from "./types";
import { loadWordList } from "./logic/wordChecker";

function App() {
  const {
    status,
    board,
    playerHand,
    message,
    playerCount,
    setPlayerCount,
    startGame,
    skala,
    dumpa,
    moveTile,
    checkWinCondition,
  } = useGameStore((state: GameState & GameActions) => ({
    status: state.status,
    board: state.board,
    playerHand: state.playerHand,
    message: state.message,
    playerCount: state.playerCount,
    setPlayerCount: state.setPlayerCount,
    startGame: state.startGame,
    skala: state.skala,
    dumpa: state.dumpa,
    moveTile: state.moveTile,
    checkWinCondition: state.checkWinCondition,
  }));

  useEffect(() => {
    // Load the word list when the app starts
    loadWordList().catch(() => {
      console.error("Failed to load word list.");
    });
  }, []);

  const moveTileToBoard = (item: DraggedItem, x: number, y: number) => {
    moveTile(item, { x, y });
  };

  const moveTileToHand = (item: DraggedItem) => {
    moveTile(item, "hand");
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="App bg-yellow-50 min-h-screen font-sans p-4">
        <header className="text-center mb-4">
          <h1 className="text-5xl font-bold text-yellow-600">Bananagrams</h1>
        </header>

        <main className="flex flex-col lg:flex-row gap-4">
          <div className="flex-grow">
            <Board board={board} onDropTile={moveTileToBoard} />
          </div>

          <aside className="lg:w-1/3 flex flex-col gap-4">
            <Controls
              status={status}
              playerCount={playerCount}
              onPlayerCountChange={setPlayerCount}
              onStart={startGame}
              onPeel={skala}
              onCheck={checkWinCondition}
            />
            <p className="message text-center p-2 bg-yellow-100 rounded-md">
              {message}
            </p>
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
