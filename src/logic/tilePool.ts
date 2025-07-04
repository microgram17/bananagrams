/**
 * This module handles the creation and management of the game's tile pool.
 * It provides functions for generating tiles, dealing them to players,
 * and drawing tiles from the pool during gameplay.
 */
import { Letter, Tile } from '../types';
import { shuffle } from '../utils/shuffle';
import { v4 as uuidv4 } from 'uuid';

/**
 * Swedish tile distribution - the definitive source of truth for how many
 * of each letter should be in the game. This distribution is based on
 * the frequency of letters in the Swedish language.
 */
export const TILE_DISTRIBUTION: Record<Letter, number> = {
  A: 13, B: 2, C: 2, D: 7, E: 14, F: 3, G: 4, H: 3, I: 8, J: 1, K: 5, L: 8,
  M: 5, N: 12, O: 6, P: 3, R: 12, S: 9, T: 11, U: 3, V: 3, X: 1, Y: 1, Ä: 4,
  Ö: 2, Å: 2,
};

/**
 * Creates the full, shuffled pool of tiles for a new game.
 * Each tile is assigned a unique ID and distributed according
 * to the TILE_DISTRIBUTION.
 * 
 * @returns A shuffled array of all game tiles
 */
export function generateTilePool(): Tile[] {
  let id = 0;
  
  // Create tiles according to the distribution
  const tilePool = Object.entries(TILE_DISTRIBUTION).flatMap(([letter, count]) =>
    Array(count)
      .fill(null)
      .map(() => ({ id: `tile-${id++}`, letter: letter as Letter }))
  );

  // Shuffle the tiles to randomize the order
  return shuffle(tilePool);
}

/**
 * Draws a specified number of tiles from the pool.
 * 
 * @param pool - The pool of tiles to draw from
 * @param count - The number of tiles to draw
 * @returns An object containing the drawn tiles and the remaining pool
 */
export function drawTiles(pool: Tile[], count: number): { drawn: Tile[]; remaining: Tile[] } {
  // If the pool has fewer tiles than requested, return all remaining tiles
  if (pool.length < count) {
    return {
      drawn: [...pool],
      remaining: []
    };
  }
  
  // Draw the requested number of tiles from the start of the pool
  const drawn = pool.slice(0, count);
  const remaining = pool.slice(count);
  return { drawn, remaining };
}

/**
 * Simulates dealing tiles to multiple players at the start of a game.
 * 
 * @param pool - The pool of tiles to deal from
 * @param playerCount - The number of players including the human player
 * @param tilesPerPlayer - Number of tiles each player gets
 * @returns Object containing the human player's hand, simulated players' hands, and remaining pool
 */
export function dealInitialTiles(pool: Tile[], playerCount: number, tilesPerPlayer: number): {
  playerHand: Tile[];
  simulatedPlayerHands: Tile[][];
  remainingPool: Tile[];
} {
  let currentPool = [...pool];
  
  // Deal tiles to the human player first
  const { drawn: playerHand, remaining: poolAfterPlayer } = drawTiles(currentPool, tilesPerPlayer);
  currentPool = poolAfterPlayer;
  
  // Deal tiles to each simulated player
  const simulatedPlayerHands: Tile[][] = [];
  
  for (let i = 1; i < playerCount; i++) {
    const { drawn, remaining } = drawTiles(currentPool, tilesPerPlayer);
    simulatedPlayerHands.push(drawn);
    currentPool = remaining;
  }
  
  return {
    playerHand,
    simulatedPlayerHands,
    remainingPool: currentPool
  };
}