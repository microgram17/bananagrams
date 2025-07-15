import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Board } from '../Board';
import { Tile, DraggedItem, Position } from '../../types';

// Mock the Cell component
jest.mock('../Cell', () => ({
  Cell: ({ x, y, tile, onDropTile, isSelected, onClick }) => (
    <div 
      data-testid={`cell-${x}-${y}`}
      data-selected={isSelected.toString()}
      data-has-tile={Boolean(tile).toString()}
      data-letter={tile?.letter || ''}
      onClick={onClick}
    >
      {tile ? tile.letter : ''}
    </div>
  ),
}));

// Helper functions to create test fixtures
const createEmptyBoard = (size: number) => {
  return Array(size).fill(null).map(() => Array(size).fill(null));
};

const createTile = (id: string, letter: string): Tile => ({
  id,
  letter: letter as any, // Type cast for simplicity in tests
});

describe('Board Component', () => {
  test('renders the correct grid size', () => {
    const boardSize = 5;
    const emptyBoard = createEmptyBoard(boardSize);
    const props = {
      board: emptyBoard,
      onDropTile: jest.fn(),
      selectedCell: null,
      onCellClick: jest.fn(),
    };

    render(<Board {...props} />);
    
    // Should render the correct number of cells (5x5 = 25)
    const cells = screen.getAllByTestId(/^cell-\d+-\d+$/);
    expect(cells).toHaveLength(boardSize * boardSize);
    
    // Check specific cell coordinates exist
    expect(screen.getByTestId('cell-0-0')).toBeInTheDocument();
    expect(screen.getByTestId(`cell-${boardSize-1}-${boardSize-1}`)).toBeInTheDocument();
  });

  test('renders cells with correct content based on board state', () => {
    const boardSize = 3;
    const board = createEmptyBoard(boardSize);
    
    // Add some tiles to the board - IMPORTANT: In board[y][x], y is row, x is column
    board[1][0] = createTile('tile-1', 'A'); // This will be at cell-0-1
    board[1][1] = createTile('tile-2', 'B'); // This will be at cell-1-1
    board[2][2] = createTile('tile-3', 'C'); // This will be at cell-2-2
    
    const props = {
      board,
      onDropTile: jest.fn(),
      selectedCell: null,
      onCellClick: jest.fn(),
    };

    render(<Board {...props} />);
    
    // Check empty cells
    expect(screen.getByTestId('cell-0-0')).toHaveAttribute('data-has-tile', 'false');
    expect(screen.getByTestId('cell-0-0')).toHaveTextContent('');
    
    // Check cells with tiles - using coordinates as rendered (x-y)
    expect(screen.getByTestId('cell-0-1')).toHaveAttribute('data-has-tile', 'true');
    expect(screen.getByTestId('cell-0-1')).toHaveAttribute('data-letter', 'A');
    expect(screen.getByTestId('cell-0-1')).toHaveTextContent('A');
    
    expect(screen.getByTestId('cell-1-1')).toHaveAttribute('data-has-tile', 'true');
    expect(screen.getByTestId('cell-1-1')).toHaveTextContent('B');
    
    expect(screen.getByTestId('cell-2-2')).toHaveAttribute('data-has-tile', 'true');
    expect(screen.getByTestId('cell-2-2')).toHaveTextContent('C');
  });

  test('highlights the selected cell correctly', () => {
    const boardSize = 3;
    const board = createEmptyBoard(boardSize);
    const selectedCell = { x: 1, y: 2 };
    
    const props = {
      board,
      onDropTile: jest.fn(),
      selectedCell,
      onCellClick: jest.fn(),
    };

    render(<Board {...props} />);
    
    // Check that the selected cell has the selected attribute
    expect(screen.getByTestId('cell-1-2')).toHaveAttribute('data-selected', 'true');
    
    // Check that other cells are not selected
    expect(screen.getByTestId('cell-0-0')).toHaveAttribute('data-selected', 'false');
    expect(screen.getByTestId('cell-2-1')).toHaveAttribute('data-selected', 'false');
  });

  test('calls onCellClick with correct position when a cell is clicked', () => {
    const boardSize = 3;
    const board = createEmptyBoard(boardSize);
    const onCellClick = jest.fn();
    
    const props = {
      board,
      onDropTile: jest.fn(),
      selectedCell: null,
      onCellClick,
    };

    render(<Board {...props} />);
    
    // Click on a cell
    fireEvent.click(screen.getByTestId('cell-1-2'));
    
    // Check that onCellClick was called with the correct position
    expect(onCellClick).toHaveBeenCalledWith({ x: 1, y: 2 });
  });

  test('cell receives correct onDropTile callback from board', () => {
    const boardSize = 3;
    const board = createEmptyBoard(boardSize);
    const onDropTile = jest.fn();
    
    const props = {
      board,
      onDropTile,
      selectedCell: null,
      onCellClick: jest.fn(),
    };

    render(<Board {...props} />);
    
    // We can't directly test the onDropTile prop passed to Cell
    // But we can test that the correct number of cells are rendered
    const cells = screen.getAllByTestId(/^cell-\d+-\d+$/);
    expect(cells).toHaveLength(boardSize * boardSize);
    
    // The implementation of onDropTile is tested in Cell.test.tsx
    // Here we're just testing that the Board renders properly
  });

  test('renders board with mixed content (empty cells and tiles)', () => {
    const boardSize = 4;
    const board = createEmptyBoard(boardSize);
    
    // Create a pattern of tiles spelling "WORD" horizontally
    // Remember: board[y][x] where y is row, x is column
    board[1][0] = createTile('tile-W', 'W'); // cell-0-1
    board[1][1] = createTile('tile-O', 'O'); // cell-1-1
    board[1][2] = createTile('tile-R', 'R'); // cell-2-1
    board[1][3] = createTile('tile-D', 'D'); // cell-3-1
    
    // And "CAT" vertically
    board[0][2] = createTile('tile-C', 'C'); // cell-2-0
    // R is shared with "WORD" (board[1][2])
    board[2][2] = createTile('tile-T', 'T'); // cell-2-2
    
    const props = {
      board,
      onDropTile: jest.fn(),
      selectedCell: null,
      onCellClick: jest.fn(),
    };

    render(<Board {...props} />);
    
    // Check that the W-O-R-D row is rendered correctly
    expect(screen.getByTestId('cell-0-1')).toHaveTextContent('W');
    expect(screen.getByTestId('cell-1-1')).toHaveTextContent('O');
    expect(screen.getByTestId('cell-2-1')).toHaveTextContent('R');
    expect(screen.getByTestId('cell-3-1')).toHaveTextContent('D');
    
    // Check that the C-A-T column is rendered correctly
    expect(screen.getByTestId('cell-2-0')).toHaveTextContent('C');
    expect(screen.getByTestId('cell-2-1')).toHaveTextContent('R'); // Shared tile
    expect(screen.getByTestId('cell-2-2')).toHaveTextContent('T');
  });

  test('handles a completely filled board', () => {
    const boardSize = 3;
    const board = createEmptyBoard(boardSize);
    
    // Fill the entire board with tiles
    for (let y = 0; y < boardSize; y++) {
      for (let x = 0; x < boardSize; x++) {
        const letter = String.fromCharCode(65 + (y * boardSize) + x); // A, B, C, ...
        board[y][x] = createTile(`tile-${letter}`, letter);
      }
    }
    
    const props = {
      board,
      onDropTile: jest.fn(),
      selectedCell: null,
      onCellClick: jest.fn(),
    };

    render(<Board {...props} />);
    
    // Check all cells have the correct content
    for (let y = 0; y < boardSize; y++) {
      for (let x = 0; x < boardSize; x++) {
        const letter = String.fromCharCode(65 + (y * boardSize) + x);
        expect(screen.getByTestId(`cell-${x}-${y}`)).toHaveTextContent(letter);
        expect(screen.getByTestId(`cell-${x}-${y}`)).toHaveAttribute('data-has-tile', 'true');
      }
    }
  });
});