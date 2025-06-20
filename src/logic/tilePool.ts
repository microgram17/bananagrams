import { Letter, Tile } from '../types';
import { shuffle } from '../utils/shuffle';
import { v4 as uuidv4 } from 'uuid';

// Swedish tile distribution
const TILE_DISTRIBUTION: Record<Letter, number> = {
  A: 13, B: 2, C: 2, D: 7, E: 14, F: 3, G: 4, H: 3, I: 8, J: 1, K: 5, L: 8,
  M: 5, N: 12, O: 6, P: 3, R: 12, S: 9, T: 11, U: 3, V: 3, X: 1, Y: 1, Ä: 4,
  Ö: 2, Å: 2,
};

/**
 * Creates the full, shuffled pool of tiles for a new game.
 */
export function generateTilePool(): Tile[] {
  const tilePool = Object.entries(TILE_DISTRIBUTION).flatMap(([letter, count]) =>
    Array(count).fill({ letter })
  ).map((tile) => ({ ...tile, id: uuidv4() }));

  return shuffle(tilePool);
}

/**
 * Draws a specified number of tiles from the pool.
 * @returns An object with the drawn tiles and the remaining pool.
 */
export function drawTiles(pool: Tile[], count: number): { drawn: Tile[]; remaining: Tile[] } {
  const drawn = pool.slice(0, count);
  const remaining = pool.slice(count);
  return { drawn, remaining };
}