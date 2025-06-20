import { Tile } from '../types';
import { shuffle } from '../utils/shuffle';
import { drawTiles } from './tilePool';

/**
 * Determines the number of starting tiles based on the number of players.
 */
export const getStartingTileCount = (playerCount: number): number => {
  if (playerCount <= 1) return 21;
  if (playerCount >= 2 && playerCount <= 4) return 21;
  if (playerCount >= 5 && playerCount <= 6) return 15;
  if (playerCount >= 7) return 11;
  return 21; // Default fallback
};

/**
 * Logic for the "Dump" action. Puts one tile back and draws three.
 * @returns The new hand, new bunch, and a success flag.
 */
export function dumpTile(
  bunch: Tile[],
  hand: Tile[],
  tileToDump: Tile
): { newHand: Tile[]; newBunch: Tile[]; success: boolean } {
  if (bunch.length < 3) {
    return { newHand: hand, newBunch: bunch, success: false };
  }

  // Remove tile from hand
  const handWithoutTile = hand.filter((t) => t.id !== tileToDump.id);

  // Add dumped tile back to bunch and shuffle
  const bunchWithDumped = shuffle([...bunch, tileToDump]);

  // Draw 3 new tiles
  const { drawn, remaining } = drawTiles(bunchWithDumped, 3);

  return {
    newHand: [...handWithoutTile, ...drawn],
    newBunch: remaining,
    success: true,
  };
}