import { generateTilePool, drawTiles, dealInitialTiles, TILE_DISTRIBUTION } from '../tilePool';
import { shuffle } from '../../utils/shuffle';

// Mock the shuffle function to make tests deterministic
jest.mock('../../utils/shuffle', () => ({
  shuffle: jest.fn((arr) => arr),
}));

describe('tilePool', () => {
  // Add this beforeEach to reset mock counts between tests
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateTilePool', () => {
    it('should create the correct number of tiles based on distribution', () => {
      const tilePool = generateTilePool();
      
      // Calculate expected total from distribution
      const expectedTotal = Object.values(TILE_DISTRIBUTION).reduce((sum, count) => sum + count, 0);
      
      expect(tilePool.length).toBe(expectedTotal);
    });
    
    it('should create tiles with the correct letter distribution', () => {
      const tilePool = generateTilePool();
      
      // Count occurrences of each letter
      const letterCounts: Record<string, number> = {};
      tilePool.forEach(tile => {
        letterCounts[tile.letter] = (letterCounts[tile.letter] || 0) + 1;
      });
      
      // Check each letter has the correct count
      Object.entries(TILE_DISTRIBUTION).forEach(([letter, expectedCount]) => {
        expect(letterCounts[letter]).toBe(expectedCount);
      });
    });
    
    it('should generate tiles with unique IDs', () => {
      const tilePool = generateTilePool();
      const ids = tilePool.map(tile => tile.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(tilePool.length);
    });
    
    it('should call shuffle to randomize the tiles', () => {
      generateTilePool();
      expect(shuffle).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('drawTiles', () => {
    it('should draw the specified number of tiles from the pool', () => {
      const mockPool = [
        { id: 'tile-0', letter: 'A' },
        { id: 'tile-1', letter: 'B' },
        { id: 'tile-2', letter: 'C' },
        { id: 'tile-3', letter: 'D' },
        { id: 'tile-4', letter: 'E' },
      ];
      
      const { drawn, remaining } = drawTiles(mockPool, 2);
      
      expect(drawn.length).toBe(2);
      expect(drawn[0].id).toBe('tile-0');
      expect(drawn[1].id).toBe('tile-1');
      expect(remaining.length).toBe(3);
      expect(remaining[0].id).toBe('tile-2');
    });
    
    it('should return all tiles when drawing exactly the number available', () => {
      const mockPool = [
        { id: 'tile-0', letter: 'A' },
        { id: 'tile-1', letter: 'B' },
        { id: 'tile-2', letter: 'C' },
      ];
      
      const { drawn, remaining } = drawTiles(mockPool, 3);
      
      expect(drawn.length).toBe(3);
      expect(remaining.length).toBe(0);
    });
    
    it('should return all available tiles when drawing more than available', () => {
      const mockPool = [
        { id: 'tile-0', letter: 'A' },
        { id: 'tile-1', letter: 'B' },
      ];
      
      const { drawn, remaining } = drawTiles(mockPool, 5);
      
      expect(drawn.length).toBe(2);
      expect(drawn).toEqual(mockPool);
      expect(remaining.length).toBe(0);
    });
  });
  
  describe('dealInitialTiles', () => {
    it('should distribute the correct number of tiles to all players', () => {
      const mockPool = Array(30).fill(null).map((_, i) => ({
        id: `tile-${i}`,
        letter: 'A'
      }));
      
      const playerCount = 3;
      const tilesPerPlayer = 7;
      
      const result = dealInitialTiles(mockPool, playerCount, tilesPerPlayer);
      
      expect(result.playerHand.length).toBe(tilesPerPlayer);
      expect(result.simulatedPlayerHands.length).toBe(playerCount - 1);
      expect(result.simulatedPlayerHands[0].length).toBe(tilesPerPlayer);
      expect(result.simulatedPlayerHands[1].length).toBe(tilesPerPlayer);
      expect(result.remainingPool.length).toBe(mockPool.length - (playerCount * tilesPerPlayer));
    });
    
    it('should return the correct structure with playerHand, simulatedPlayerHands, and remainingPool', () => {
      const mockPool = Array(10).fill(null).map((_, i) => ({
        id: `tile-${i}`,
        letter: 'A'
      }));
      
      const result = dealInitialTiles(mockPool, 2, 4);
      
      expect(result).toHaveProperty('playerHand');
      expect(result).toHaveProperty('simulatedPlayerHands');
      expect(result).toHaveProperty('remainingPool');
      expect(Array.isArray(result.playerHand)).toBe(true);
      expect(Array.isArray(result.simulatedPlayerHands)).toBe(true);
      expect(Array.isArray(result.remainingPool)).toBe(true);
    });
    
    it('should handle different player counts correctly', () => {
      const mockPool = Array(50).fill(null).map((_, i) => ({
        id: `tile-${i}`,
        letter: 'A'
      }));
      
      // Test with 1 player (only human player)
      const result1 = dealInitialTiles(mockPool, 1, 10);
      expect(result1.playerHand.length).toBe(10);
      expect(result1.simulatedPlayerHands.length).toBe(0);
      
      // Test with 4 players
      const result4 = dealInitialTiles(mockPool, 4, 10);
      expect(result4.playerHand.length).toBe(10);
      expect(result4.simulatedPlayerHands.length).toBe(3);
      expect(result4.remainingPool.length).toBe(50 - (4 * 10));
    });
    
    it('should handle the case when there are not enough tiles for all players', () => {
      // Create a small pool that won't have enough for all players
      const mockPool = Array(5).fill(null).map((_, i) => ({
        id: `tile-${i}`,
        letter: 'A'
      }));
      
      const result = dealInitialTiles(mockPool, 3, 2);
      
      // Human player should get their full allocation
      expect(result.playerHand.length).toBe(2);
      
      // First AI player should get their full allocation
      expect(result.simulatedPlayerHands[0].length).toBe(2);
      
      // Second AI player should get remaining tile (only 1)
      expect(result.simulatedPlayerHands[1].length).toBe(1);
      
      // Pool should be empty
      expect(result.remainingPool.length).toBe(0);
    });
  });
});