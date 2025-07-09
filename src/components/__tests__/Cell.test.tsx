import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Cell } from '../Cell';
import { useDrop } from 'react-dnd';
import { Tile as TileType, DraggedItem } from '../../types';

// Mock the Tile component
jest.mock('../Tile', () => ({
  Tile: ({ tile }: { tile: TileType }) => <div data-testid="mock-tile">{tile.letter}</div>,
}));

// Mock react-dnd's useDrop hook
jest.mock('react-dnd', () => ({
  useDrop: jest.fn(),
}));

describe('Cell Component', () => {
  const mockTile: TileType = {
    id: 'tile-1',
    letter: 'A',
  };

  const defaultProps = {
    x: 5,
    y: 3,
    tile: null,
    onDropTile: jest.fn(),
    isSelected: false,
    onClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useDrop as jest.Mock).mockReturnValue([
      { isOver: false, canDrop: false },
      jest.fn(),
    ]);
  });

  test('renders an empty cell correctly', () => {
    const { container } = render(<Cell {...defaultProps} />);
    
    // An empty cell should not contain a tile
    expect(screen.queryByTestId('mock-tile')).not.toBeInTheDocument();
    
    // It should have the default background color
    expect(container.firstChild).toHaveClass('bg-yellow-50');
    
    // It should have a dashed border
    expect(container.firstChild).toHaveClass('border-dashed');
  });

  test('renders a cell with a tile correctly', () => {
    render(<Cell {...defaultProps} tile={mockTile} />);
    
    // Should render the tile with the correct letter
    const tileElement = screen.getByTestId('mock-tile');
    expect(tileElement).toBeInTheDocument();
    expect(tileElement).toHaveTextContent('A');
  });

  test('shows selection state correctly', () => {
    const { container } = render(<Cell {...defaultProps} isSelected={true} />);
    
    // Selected cells should have blue background
    expect(container.firstChild).toHaveClass('bg-blue-100');
    
    // Should have outline style instead of border
    expect(container.firstChild).not.toHaveClass('border-dashed');
    
    // Check for the outline style attribute
    expect(container.firstChild).toHaveStyle({ 
      outline: '2px solid #3b82f6',
      outlineOffset: '1px'
    });
  });

  test('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    const { container } = render(<Cell {...defaultProps} onClick={handleClick} />);
    
    // Click the cell
    fireEvent.click(container.firstChild as HTMLElement);
    
    // Verify the onClick handler was called
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('handles drop functionality correctly', () => {
    const mockDropHandler = jest.fn();
    const mockDropRef = jest.fn();
    const x = 2;
    const y = 7;
    
    // Mock useDrop to simulate hovering with a draggable item
    (useDrop as jest.Mock).mockReturnValue([
      { isOver: true, canDrop: true },
      mockDropRef,
    ]);
    
    const { container } = render(
      <Cell 
        {...defaultProps} 
        x={x} 
        y={y} 
        onDropTile={mockDropHandler} 
      />
    );
    
    // Cell should have the "being dragged over" style
    expect(container.firstChild).toHaveClass('bg-green-200');
    
    // Get the drop function from the useDrop mock
    const dropFn = (useDrop as jest.Mock).mock.calls[0][0]().drop;
    
    // Simulate dropping a tile
    const mockDraggedItem: DraggedItem = {
      tile: mockTile,
      source: 'hand',
    };
    dropFn(mockDraggedItem);
    
    // Verify onDropTile was called with the correct arguments
    expect(mockDropHandler).toHaveBeenCalledWith(mockDraggedItem, x, y);
  });
});