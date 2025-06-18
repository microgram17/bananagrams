import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useGame } from "./hooks/useGame";
import Board from "./components/Board";
import PlayerHand from "./components/PlayerHand";
import { Tile, BoardTile } from "./types";
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
  } = useGame(1); // Single player

  const moveTileToBoard = (tile: Tile | BoardTile, x: number, y: number) => {
    moveTile(tile, { x, y });
  };

  const moveTileToHand = (tile: BoardTile) => {
    moveTile(tile, "hand");
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="App">
        <h1>Bananagrams</h1>
        <div className="controls">
          {gameState === "pre-game" ? (
            <button onClick={startGame}>Start Game</button>
          ) : (
            <>
              <button onClick={skala}>Skala</button>
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
