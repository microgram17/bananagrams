import { Tile, Letter } from '../types';

// Swedish tile distribution for Bananagrams
const TILE_DISTRIBUTION: { [key: string]: number } = {
  A: 13,
  B: 2,
  C: 2,
  D: 7,
  E: 14,
  F: 3,
  G: 4,
  H: 3,
  I: 8,
  J: 1,
  K: 5,
  L: 8,
  M: 5,
  N: 12,
  O: 6,
  P: 3,
  R: 12,
  S: 9,
  T: 11,
  U: 3,
  V: 3,
  X: 1,
  Y: 1,
  Ä: 4,
  Ö: 2,
  Å: 2,
};

// Shuffle function for arrays
export const shuffle = <T>(array: T[]): T[] => {
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
};

// Creates the initial pool of tiles
export const getInitialTiles = (): Tile[] => {
  const tilePool: Tile[] = [];
  let id = 1;
  for (const letter in TILE_DISTRIBUTION) {
    for (
      let i = 0;
      i < TILE_DISTRIBUTION[letter as keyof typeof TILE_DISTRIBUTION];
      i++
    ) {
      tilePool.push({ id: String(id++), letter: letter as Letter });
    }
  }
  return tilePool;
};

// "Peel" action: take one tile from the bunch
export const peel = (bunch: Tile[]) => {
  if (bunch.length < 1) {
    return { newBunch: bunch, newTiles: [] };
  }
  const newBunch = [...bunch];
  const newTiles = newBunch.splice(0, 1);
  return { newBunch, newTiles };
};

// "Dump" action: exchange one tile for three
export const dump = (bunch: Tile[], hand: Tile[], tileToDump: Tile) => {
  if (bunch.length < 3) {
    return { newBunch: bunch, newHand: hand, success: false };
  }

  const handWithoutTile = hand.filter(t => t.id !== tileToDump.id);
  if (handWithoutTile.length === hand.length) {
    // Tile not found in hand
    return { newBunch: bunch, newHand: hand, success: false };
  }

  const tempBunch = shuffle([...bunch, tileToDump]);
  const drawnTiles = tempBunch.splice(0, 3);
  const newHand = [...handWithoutTile, ...drawnTiles];
  const newBunch = tempBunch;

  return { newBunch, newHand, success: true };
};
