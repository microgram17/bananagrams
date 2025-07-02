import { shuffle } from './shuffle';

describe('shuffle utility', () => {
  describe('with number arrays', () => {
    const originalArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    
    test('returns a new array with the same elements', () => {
      const shuffled = shuffle(originalArray);
      
      // Check that arrays contain same elements (ignoring order)
      expect(shuffled).toHaveLength(originalArray.length);
      expect(shuffled.sort()).toEqual(originalArray.sort());
    });
    
    test('returns a new array reference', () => {
      const shuffled = shuffle(originalArray);
      expect(shuffled).not.toBe(originalArray);
    });
    
    test('does not modify the original array', () => {
      const beforeShuffle = [...originalArray];
      shuffle(originalArray);
      expect(originalArray).toEqual(beforeShuffle);
    });
  });
  
  describe('with string arrays', () => {
    const originalArray = ['a', 'b', 'c', 'd', 'e', 'f'];
    
    test('returns a new array with the same elements', () => {
      const shuffled = shuffle(originalArray);
      
      expect(shuffled).toHaveLength(originalArray.length);
      expect(shuffled.sort()).toEqual(originalArray.sort());
    });
    
    test('returns a new array reference', () => {
      const shuffled = shuffle(originalArray);
      expect(shuffled).not.toBe(originalArray);
    });
    
    test('does not modify the original array', () => {
      const beforeShuffle = [...originalArray];
      shuffle(originalArray);
      expect(originalArray).toEqual(beforeShuffle);
    });
  });
  
  describe('with object arrays', () => {
    const originalArray = [
      { id: 1, name: 'item1' },
      { id: 2, name: 'item2' },
      { id: 3, name: 'item3' },
      { id: 4, name: 'item4' }
    ];
    
    test('returns a new array with the same elements', () => {
      const shuffled = shuffle(originalArray);
      
      expect(shuffled).toHaveLength(originalArray.length);
      
      // For objects we need to check that all objects from original exist in shuffled
      originalArray.forEach(originalItem => {
        expect(shuffled).toContainEqual(originalItem);
      });
      
      // And that all objects in shuffled exist in original
      shuffled.forEach(shuffledItem => {
        expect(originalArray).toContainEqual(shuffledItem);
      });
    });
    
    test('returns a new array reference', () => {
      const shuffled = shuffle(originalArray);
      expect(shuffled).not.toBe(originalArray);
    });
    
    test('does not modify the original array', () => {
      const beforeShuffle = [...originalArray];
      shuffle(originalArray);
      expect(originalArray).toEqual(beforeShuffle);
    });
  });
  
  describe('shuffling behavior', () => {
    test('has a reasonable chance of changing the order', () => {
      // Create a large array to increase the chance of detecting a shuffle
      const largeArray = Array.from({ length: 100 }, (_, i) => i);
      
      // Run multiple shuffles to check for different arrangements
      const shuffled1 = shuffle(largeArray);
      const shuffled2 = shuffle(largeArray);
      
      // Check that at least one position is different
      // This is probabilistic but with a large array it's extremely unlikely to fail
      const hasDifferentOrder = 
        shuffled1.some((item, index) => item !== largeArray[index]) &&
        shuffled2.some((item, index) => item !== largeArray[index]) &&
        shuffled1.some((item, index) => item !== shuffled2[index]);
        
      expect(hasDifferentOrder).toBe(true);
    });
  });
  
  describe('edge cases', () => {
    test('handles empty arrays', () => {
      const emptyArray: number[] = [];
      const shuffled = shuffle(emptyArray);
      
      expect(shuffled).toEqual([]);
      expect(shuffled).not.toBe(emptyArray);
    });
    
    test('handles single-element arrays', () => {
      const singleElementArray = [42];
      const shuffled = shuffle(singleElementArray);
      
      expect(shuffled).toEqual([42]);
      expect(shuffled).not.toBe(singleElementArray);
    });
  });
});