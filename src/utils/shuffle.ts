/**
 * Utility module providing a robust shuffling algorithm for arrays.
 * Used throughout the game to randomize tiles and ensure fair gameplay.
 */

/**
 * Implementation of the Fisher-Yates (Knuth) shuffle algorithm.
 * This algorithm provides an unbiased way to shuffle an array in-place,
 * giving each permutation an equal probability of occurring.
 *
 * For Bananagrams, this is essential to ensure that tile distributions
 * are truly random, providing a fair and unpredictable gameplay experience.
 *
 * @param array - The array to shuffle
 * @returns A new shuffled array (original array is not modified)
 */
export const shuffle = <T>(array: T[]): T[] => {
  // Create a copy to avoid modifying the original array
  const newArray = [...array];
  let currentIndex = newArray.length;
  let randomIndex;

  // While there remain elements to shuffle
  while (currentIndex !== 0) {
    // Pick a remaining element randomly
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // Swap it with the current element using destructuring assignment
    [newArray[currentIndex], newArray[randomIndex]] = [
      newArray[randomIndex],
      newArray[currentIndex],
    ];
  }

  return newArray;
};