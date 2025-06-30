/**
 * This module contains core game mechanics and rules for Bananagrams.
 * It provides functions for determining starting tile counts,
 * handling the "dump" action, and other game-specific logic.
 */
import { Tile } from '../types';
import { shuffle } from '../utils/shuffle';
import { drawTiles } from './tilePool';

/**
 * Determines the number of starting tiles based on the number of players.
 * According to official Bananagrams rules, players get fewer tiles
 * as the player count increases.
 *
 * @param playerCount - The total number of players in the game
 * @returns The number of tiles each player should start with
 */
export const getStartingTileCount = (playerCount: number): number => {
  if (playerCount <= 1) return 21;                // Solo play
  if (playerCount >= 2 && playerCount <= 4) return 21; // 2-4 players
  if (playerCount >= 5 && playerCount <= 6) return 15; // 5-6 players
  if (playerCount >= 7) return 11;                // 7+ players
  return 21; // Default fallback
};

/**
 * Implements the "Dump" action where a player exchanges one tile
 * for three new tiles from the bunch.
 *
 * @param bunch - The remaining tiles in the pool
 * @param hand - The player's current hand
 * @param tileToDump - The tile to exchange
 * @returns New hand, new bunch, and success status
 */
export function dumpTile(
  bunch: Tile[],
  hand: Tile[],
  tileToDump: Tile
): { newHand: Tile[]; newBunch: Tile[]; success: boolean } {
  // Check if there are enough tiles in the bunch to perform the dump
  if (bunch.length < 3) {
    return { newHand: hand, newBunch: bunch, success: false };
  }

  // Remove the selected tile from the player's hand
  const handWithoutTile = hand.filter((t) => t.id !== tileToDump.id);

  // Add the dumped tile back to the bunch and shuffle
  const bunchWithDumped = shuffle([...bunch, tileToDump]);

  // Draw 3 new tiles for the player
  const { drawn, remaining } = drawTiles(bunchWithDumped, 3);

  return {
    newHand: [...handWithoutTile, ...drawn],
    newBunch: remaining,
    success: true,
  };
}