import React from 'react';

const Controls: React.FC<{ onStart: () => void; onDump: () => void; playerCount: number; setPlayerCount: (count: number) => void; }> = ({ onStart, onDump, playerCount, setPlayerCount }) => {
    return (
        <div className="controls">
            <button onClick={onStart}>Start Game</button>
            <button onClick={onDump}>Dump Tiles</button>
            <div>
                <label htmlFor="playerCount">Number of Players:</label>
                <input
                    type="number"
                    id="playerCount"
                    value={playerCount}
                    onChange={(e) => setPlayerCount(Number(e.target.value))}
                    min={1}
                    max={4} // Adjust max based on your game rules
                />
            </div>
        </div>
    );
};

export default Controls;