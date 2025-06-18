import { renderHook, act } from '@testing-library/react-hooks';
import useGame from '../../hooks/useGame';

describe('useGame', () => {
  let result;

  beforeEach(() => {
    const { result: hookResult } = renderHook(() => useGame());
    result = hookResult;
  });

  test('should initialize game state correctly', () => {
    expect(result.current.tiles).toHaveLength(0); // Assuming initial tiles are empty
    expect(result.current.playerCount).toBe(1); // Default player count
  });

  test('should handle tile drawing', () => {
    act(() => {
      result.current.drawTiles(5); // Simulate drawing 5 tiles
    });
    expect(result.current.tiles).toHaveLength(5);
  });

  test('should handle dumping tiles', () => {
    act(() => {
      result.current.drawTiles(5);
      result.current.dumpTiles();
    });
    expect(result.current.tiles).toHaveLength(0); // Tiles should be dumped
  });

  test('should validate words according to S.A.O.L rules', () => {
    act(() => {
      result.current.drawTiles(5);
      result.current.placeWord('test'); // Simulate placing a valid word
    });
    expect(result.current.isValidWord('test')).toBe(true);
  });

  // Additional tests can be added here for other functionalities
});