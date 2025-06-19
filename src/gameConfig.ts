export const BOARD_SIZE = 25;

/**
 * Determines the number of starting tiles based on the number of players.
 * According to official Bananagrams rules.
 * @param playerCount The number of players in the game.
 * @returns The number of tiles each player starts with.
 */
export const getStartingTileCount = (playerCount: number): number => {
  if (playerCount <= 1) return 21; // For solo play as well
  if (playerCount >= 2 && playerCount <= 4) return 21;
  if (playerCount >= 5 && playerCount <= 6) return 15;
  if (playerCount >= 7) return 11;
  return 21; // Default fallback
};