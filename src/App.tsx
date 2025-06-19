import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useGame } from "./hooks/useGame";
import Board from "./components/Board";
import PlayerHand from "./components/PlayerHand";
import { Tile, DraggedItem } from "./types";
import "./App.css";

function App() {
  const {
    gameState,
    handTiles,
    board,
    message,
    startGame,
    skala,
    dumpa,
    moveTile,
  } = useGame();

  // NOTE: The onDropTile prop for your Board component needs to be updated
  // to pass the full DraggedItem from react-dnd, not just the tile.
  const moveTileToBoard = (item: DraggedItem, x: number, y: number) => {
    moveTile(item, { x, y });
  };

  // NOTE: The onDropTile prop for your PlayerHand component also needs to be updated.
  const moveTileToHand = (item: DraggedItem) => {
    moveTile(item, "hand");
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="App">
        <h1>Bananagrams</h1>
        <div className="game-controls">
          {gameState === "pre-game" ? (
            <button onClick={() => startGame(1)}>Start Game</button>
          ) : (
            <>
              <button onClick={skala}>Skala</button>
              {/* You can add a button to check words or other controls here */}
            </>
          )}
        </div>
        <p className="message">{message}</p>
        <div className="game-area">
          <Board board={board} onDropTile={moveTileToBoard} />
          <PlayerHand
            tiles={handTiles}
            onDropTile={moveTileToHand}
            onTileClick={dumpa}
          />
        </div>
      </div>
    </DndProvider>
  );
}

export default App;
