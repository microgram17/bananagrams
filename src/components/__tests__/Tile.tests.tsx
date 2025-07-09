import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tile } from '../Tile';
import { useDrag } from 'react-dnd';
import { Tile as TileType } from '../../types';

// Mock react-dnd's useDrag hook
jest.mock('react-dnd', () => ({
  useDrag: jest.fn(),
}));

describe('Tile Component', () => {
  // Sample tile for testing
  const mockTile: TileType = {
    id: 'tile-1',
    letter: 'A',
  };

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    (useDrag as jest.Mock).mockReturnValue([
      { isDragging: false },
      jest.fn(),
    ]);
  });

  test('renders the correct letter', () => {
    render(<Tile tile={mockTile} source="hand" />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  test('applies pointer cursor when onClick is provided', () => {
    const { container } = render(
      <Tile tile={mockTile} source="hand" onClick={() => {}} />
    );
    const tileElement = container.firstChild as HTMLElement;
    expect(tileElement.className).toContain('pointer');
    expect(tileElement.className).not.toContain('grab');
  });

  test('applies grab cursor when onClick is not provided', () => {
    const { container } = render(<Tile tile={mockTile} source="hand" />);
    const tileElement = container.firstChild as HTMLElement;
    expect(tileElement.className).toContain('grab');
    expect(tileElement.className).not.toContain('pointer');
  });

  test('applies different styles when dragging', () => {
    // Mock dragging state
    (useDrag as jest.Mock).mockReturnValue([
      { isDragging: true },
      jest.fn(),
    ]);
    
    const { container } = render(<Tile tile={mockTile} source="hand" />);
    const tileElement = container.firstChild as HTMLElement;
    expect(tileElement.className).toContain('opacity-50');
    expect(tileElement.className).toContain('scale-110');
    expect(tileElement.className).toContain('shadow-xl');
  });

  test('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Tile tile={mockTile} source="hand" onClick={handleClick} />);
    
    fireEvent.click(screen.getByText('A'));
    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledWith(mockTile);
  });

  test('does not call onClick when not provided', () => {
    const { container } = render(<Tile tile={mockTile} source="hand" />);
    // Should not throw error when clicked without handler
    expect(() => {
      fireEvent.click(container.firstChild as HTMLElement);
    }).not.toThrow();
  });

  test('configures useDrag with hand source correctly', () => {
    render(<Tile tile={mockTile} source="hand" />);
    
    // Check that useDrag was called
    expect(useDrag).toHaveBeenCalled();
    const useDragArgs = (useDrag as jest.Mock).mock.calls[0];
    
    // First argument should be a function
    expect(typeof useDragArgs[0]).toBe('function');
    
    // The function should return an object with the correct properties
    const dragConfig = useDragArgs[0]();
    expect(dragConfig).toEqual(expect.objectContaining({
      type: 'tile',
      item: { tile: mockTile, source: 'hand' }
    }));
    
    // Second argument should be the dependency array
    expect(useDragArgs[1]).toEqual([mockTile, 'hand']);
  });

  test('configures useDrag with board position source correctly', () => {
    const boardPosition = { x: 3, y: 4 };
    render(<Tile tile={mockTile} source={boardPosition} />);
    
    // Check that useDrag was called
    expect(useDrag).toHaveBeenCalled();
    const useDragArgs = (useDrag as jest.Mock).mock.calls[0];
    
    // First argument should be a function
    expect(typeof useDragArgs[0]).toBe('function');
    
    // The function should return an object with the correct properties
    const dragConfig = useDragArgs[0]();
    expect(dragConfig).toEqual(expect.objectContaining({
      type: 'tile',
      item: { tile: mockTile, source: boardPosition }
    }));
    
    // Second argument should be the dependency array
    expect(useDragArgs[1]).toEqual([mockTile, boardPosition]);
  });
});