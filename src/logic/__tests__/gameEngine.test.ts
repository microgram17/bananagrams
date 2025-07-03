import { getStartingTileCount, dumpTile } from '../gameEngine';
import { Tile } from '../../types';
import * as shuffleModule from '../../utils/shuffle';

// Mock the shuffle function to make tests deterministic
jest.mock('../../utils/shuffle', () => ({
  shuffle: jest.fn((arr) => arr),
}));

describe('Game Engine', () => {
  describe('getStartingTileCount', () => {
    it('returns 21 tiles for solo play', () => {
      expect(getStartingTileCount(1)).toBe(21);
    });

    it('returns 21 tiles for 2-4 players', () => {
      expect(getStartingTileCount(2)).toBe(21);
      expect(getStartingTileCount(3)).toBe(21);
      expect(getStartingTileCount(4)).toBe(21);
    });

    it('returns 15 tiles for 5-6 players', () => {
      expect(getStartingTileCount(5)).toBe(15);
      expect(getStartingTileCount(6)).toBe(15);
    });

    it('returns 11 tiles for 7+ players', () => {
      expect(getStartingTileCount(7)).toBe(11);
      expect(getStartingTileCount(8)).toBe(11);
      expect(getStartingTileCount(10)).toBe(11);
    });

    it('returns default 21 for invalid input', () => {
      expect(getStartingTileCount(0)).toBe(21);
      expect(getStartingTileCount(-1)).toBe(21);
    });
  });

  describe('dumpTile', () => {
    // Create mock data for testing
    let mockBunch: Tile[];
    let mockHand: Tile[];
    let tileToDump: Tile;

    beforeEach(() => {
      // Reset mocks
      jest.clearAllMocks();
      
      // Initialize test data
      mockBunch = [
        { id: 'b1', letter: 'A' },
        { id: 'b2', letter: 'B' },
        { id: 'b3', letter: 'C' },
        { id: 'b4', letter: 'D' },
        { id: 'b5', letter: 'E' },
      ];
      
      mockHand = [
        { id: 'h1', letter: 'X' },
        { id: 'h2', letter: 'Y' },
        { id: 'h3', letter: 'Z' },
      ];
      
      tileToDump = mockHand[1]; // Tile with id 'h2'
    });

    it('successfully dumps a tile when bunch has enough tiles', () => {
      // Arrange
      const initialHandSize = mockHand.length;
      const initialBunchSize = mockBunch.length;
      
      // Act
      const result = dumpTile(mockBunch, mockHand, tileToDump);
      
      // Assert
      expect(result.success).toBe(true);
      expect(result.newHand.length).toBe(initialHandSize + 2); // Original - 1 + 3 = Original + 2
      expect(result.newBunch.length).toBe(initialBunchSize - 2); // Original - 3 + 1 = Original - 2
      
      // Verify the dumped tile is no longer in the hand
      expect(result.newHand.find(tile => tile.id === tileToDump.id)).toBeUndefined();
      
      // Verify shuffle was called with the bunch + dumped tile
      expect(shuffleModule.shuffle).toHaveBeenCalledWith([...mockBunch, tileToDump]);
    });

    it('fails to dump when bunch has insufficient tiles', () => {
      // Arrange
      const smallBunch: Tile[] = [
        { id: 'b1', letter: 'A' },
        { id: 'b2', letter: 'B' },
      ];
      
      // Act
      const result = dumpTile(smallBunch, mockHand, tileToDump);
      
      // Assert
      expect(result.success).toBe(false);
      expect(result.newHand).toEqual(mockHand); // Hand should remain unchanged
      expect(result.newBunch).toEqual(smallBunch); // Bunch should remain unchanged
      
      // Verify shuffle was not called
      expect(shuffleModule.shuffle).not.toHaveBeenCalled();
    });

    it('preserves remaining tiles in hand after dumping', () => {
      // Act
      const result = dumpTile(mockBunch, mockHand, tileToDump);
      
      // Assert
      // The other two tiles should still be in the hand
      expect(result.newHand.some(tile => tile.id === 'h1')).toBe(true);
      expect(result.newHand.some(tile => tile.id === 'h3')).toBe(true);
    });

    it('adds exactly 3 new tiles to hand after successful dump', () => {
      // Arrange
      const handWithoutDumped = mockHand.filter(t => t.id !== tileToDump.id);
      
      // Act
      const result = dumpTile(mockBunch, mockHand, tileToDump);
      
      // Assert
      // Count new tiles (tiles that weren't in the original hand minus the dumped tile)
      const newTiles = result.newHand.filter(t => 
        !handWithoutDumped.some(ht => ht.id === t.id)
      );
      
      expect(newTiles.length).toBe(3);
    });
  });
});