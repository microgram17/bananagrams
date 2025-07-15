import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Controls } from '../Controls';
import { GameStatus } from '../../types';

describe('Controls Component', () => {
  // Default props for testing
  const defaultProps = {
    status: 'in-progress' as GameStatus,
    playerCount: 3,
    typingDirection: 'horizontal' as const,
    tilesInPool: 42,
    simulatedPlayerTiles: [15, 18],
    onPlayerCountChange: jest.fn(),
    onStart: jest.fn(),
    onPeel: jest.fn(),
    onCheck: jest.fn(),
    hideSkalaButton: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 1. Test pre-game state rendering
  test('renders pre-game controls correctly', () => {
    render(
      <Controls 
        {...defaultProps} 
        status="pre-game" 
      />
    );
    
    // Player count selector should be visible
    expect(screen.getByLabelText(/simulate player count/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    
    // Start button should be visible
    expect(screen.getByRole('button', { name: /start game/i })).toBeInTheDocument();
    
    // In-game elements should not be visible
    expect(screen.queryByText(/skala/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/check board/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/typing direction/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/tiles in pool/i)).not.toBeInTheDocument();
  });

  // 2. Test in-game state rendering
  test('renders in-game controls correctly', () => {
    render(<Controls {...defaultProps} />);
    
    // Action buttons should be visible
    expect(screen.getByRole('button', { name: /skala/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /check board/i })).toBeInTheDocument();
    
    // Game status information should be visible
    expect(screen.getByText(/typing direction/i)).toBeInTheDocument();
    expect(screen.getByText('HORIZONTAL')).toBeInTheDocument();
    expect(screen.getByText(/tiles in pool/i)).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    
    // Pre-game elements should not be visible
    expect(screen.queryByLabelText(/simulate player count/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /start game/i })).not.toBeInTheDocument();
  });

  // 3. Test button click handlers
  test('calls onStart when start button is clicked', async () => {
    render(
      <Controls 
        {...defaultProps} 
        status="pre-game" 
        onStart={defaultProps.onStart}
      />
    );
    
    const startButton = screen.getByRole('button', { name: /start game/i });
    await userEvent.click(startButton);
    
    expect(defaultProps.onStart).toHaveBeenCalledTimes(1);
  });

  test('calls onPeel when Skala button is clicked', async () => {
    render(
      <Controls 
        {...defaultProps} 
        onPeel={defaultProps.onPeel}
      />
    );
    
    const skalaButton = screen.getByRole('button', { name: /skala/i });
    await userEvent.click(skalaButton);
    
    expect(defaultProps.onPeel).toHaveBeenCalledTimes(1);
  });

  test('calls onCheck when Check Board button is clicked', async () => {
    render(
      <Controls 
        {...defaultProps} 
        onCheck={defaultProps.onCheck}
      />
    );
    
    const checkButton = screen.getByRole('button', { name: /check board/i });
    await userEvent.click(checkButton);
    
    expect(defaultProps.onCheck).toHaveBeenCalledTimes(1);
  });

  // 4. Test player count changes
  test('calls onPlayerCountChange when player count is changed', async () => {
    render(
      <Controls 
        {...defaultProps} 
        status="pre-game" 
        onPlayerCountChange={defaultProps.onPlayerCountChange}
      />
    );
    
    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, '5');
    
    expect(defaultProps.onPlayerCountChange).toHaveBeenCalledWith(5);
  });

  // 5. Test AI player tile counts display
  test('displays AI player tile counts correctly', () => {
    const simulatedPlayerTiles = [3, 12, 7];
    render(
      <Controls 
        {...defaultProps} 
        simulatedPlayerTiles={simulatedPlayerTiles}
      />
    );
    
    // Check for player labels
    expect(screen.getByText(/player 2:/i)).toBeInTheDocument();
    expect(screen.getByText(/player 3:/i)).toBeInTheDocument();
    expect(screen.getByText(/player 4:/i)).toBeInTheDocument();
    
    // Check for tile counts
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    
    // Player with 3 tiles (≤ 5) should have the highlighted style
    const lowTileCount = screen.getByText('3');
    expect(lowTileCount).toHaveClass('text-red-600');
    expect(lowTileCount).toHaveClass('font-bold');
    
    // Player with 12 tiles (> 5) should not have the highlighted style
    const highTileCount = screen.getByText('12');
    expect(highTileCount).not.toHaveClass('text-red-600');
    expect(highTileCount).not.toHaveClass('font-bold');
  });

  // 6. Test hideSkalaButton prop
  test('hides Skala button when hideSkalaButton is true', () => {
    render(
      <Controls 
        {...defaultProps} 
        hideSkalaButton={true}
      />
    );
    
    // Skala button should not be visible
    expect(screen.queryByText(/skala/i)).not.toBeInTheDocument();
    
    // Check Board button should still be visible
    expect(screen.getByText(/check board/i)).toBeInTheDocument();
    
    // Check Board button should have col-span-2 class
    const checkButton = screen.getByRole('button', { name: /check board/i });
    expect(checkButton).toHaveClass('col-span-2');
  });
});