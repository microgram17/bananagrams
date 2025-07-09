import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PlayerHand } from '../PlayerHand';
import { useDrop } from 'react-dnd';
import { Tile as TileType, DraggedItem } from '../../types';

// Mock the Tile component
jest.mock('../Tile', () => ({
  Tile: ({ tile, onClick }: { tile: TileType, onClick?: (tile: TileType) => void }) => (
    <div 
      data-testid="mock-tile" 
      onClick={() => onClick && onClick(tile)}
    >
      {tile.letter}
    </div>
  ),
}));

// Mock react-dnd's useDrop hook
jest.mock('react-dnd', () => ({
  useDrop: jest.fn(),
}));

describe('PlayerHand Component', () => {
  // Create mock tiles for testing
  const mockTiles: TileType[] = [
    { id: 'tile-1', letter: 'A' },
    { id: 'tile-2', letter: 'B' },
    { id: 'tile-3', letter: 'C' },
  ];

  const defaultProps = {
    tiles: mockTiles,
    onDropTile: jest.fn(),
    onTileClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useDrop as jest.Mock).mockReturnValue([
      { isOver: false, canDrop: false },
      jest.fn(),
    ]);
  });

  test('renders the correct number of tiles', () => {
    render(<PlayerHand {...defaultProps} />);
    
    const tiles = screen.getAllByTestId('mock-tile');
    expect(tiles).toHaveLength(mockTiles.length);
    expect(tiles[0]).toHaveTextContent('A');
    expect(tiles[1]).toHaveTextContent('B');
    expect(tiles[2]).toHaveTextContent('C');
  });

  test('displays the correct tile count', () => {
    render(<PlayerHand {...defaultProps} />);
    
    // The tile count is displayed in a span element
    const tileCountElement = screen.getByText(mockTiles.length.toString());
    expect(tileCountElement).toBeInTheDocument();
    expect(tileCountElement.closest('.bg-yellow-300')).toBeInTheDocument();
  });

  test('calls onTileClick handler when a tile is clicked', () => {
    render(<PlayerHand {...defaultProps} />);
    
    // Click the first tile
    fireEvent.click(screen.getAllByTestId('mock-tile')[0]);
    
    // Verify onTileClick was called with the correct tile
    expect(defaultProps.onTileClick).toHaveBeenCalledWith(mockTiles[0]);
  });

  test('handles dropping tiles to the hand', () => {
    // Mock useDrop to simulate a tile being dragged over the hand
    (useDrop as jest.Mock).mockReturnValue([
      { isOver: true, canDrop: true },
      jest.fn(),
    ]);
    
    const { container, rerender } = render(<PlayerHand {...defaultProps} />);
    
    // Check if the component has the "dragging over" style
    expect(container.firstChild).toHaveClass('bg-blue-100');
    
    // Get the drop function from the useDrop mock
    const dropFn = (useDrop as jest.Mock).mock.calls[0][0]().drop;
    
    // Create a mock dragged item
    const mockDraggedItem: DraggedItem = {
      tile: { id: 'dragged-tile', letter: 'X' },
      source: { x: 3, y: 5 }, // Dragging from the board
    };
    
    // Simulate dropping the tile
    dropFn(mockDraggedItem);
    
    // Verify onDropTile was called with the correct item
    expect(defaultProps.onDropTile).toHaveBeenCalledWith(mockDraggedItem);
    
    // Test that it changes back to default style when not being dragged over
    (useDrop as jest.Mock).mockReturnValue([
      { isOver: false, canDrop: false },
      jest.fn(),
    ]);
    
    rerender(<PlayerHand {...defaultProps} />);
    expect(container.firstChild).toHaveClass('bg-gray-100');
  });

  test('has the correct styling and layout', () => {
    const { container } = render(<PlayerHand {...defaultProps} />);
    
    // Check for the main container classes
    expect(container.firstChild).toHaveClass('p-4');
    expect(container.firstChild).toHaveClass('rounded-lg');
    expect(container.firstChild).toHaveClass('shadow-md');
    
    // Check for the tile container (flex layout)
    const tileContainer = container.querySelector('.flex.flex-wrap');
    expect(tileContainer).toBeInTheDocument();
    
    // Check for the heading with "Your Tiles"
    expect(screen.getByText('Your Tiles')).toBeInTheDocument();
    
    // Check for the hint text about dumping tiles
    expect(screen.getByText('Click a tile to dump it.')).toBeInTheDocument();
  });

  test('renders empty hand correctly', () => {
    render(<PlayerHand {...defaultProps} tiles={[]} />);
    
    // Should show 0 for the count
    expect(screen.getByText('0')).toBeInTheDocument();
    
    // Should not render any tiles
    expect(screen.queryAllByTestId('mock-tile')).toHaveLength(0);
  });
});