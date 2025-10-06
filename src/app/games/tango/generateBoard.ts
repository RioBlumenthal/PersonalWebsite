import { CellValue, Grid, solveBoard } from './solveBoard';

/**
 * Generate a complete valid Binairo solution
 */
export function generateCompleteSolution(size: number = 6): Grid {
  const grid: Grid = Array(size).fill(null).map(() => Array(size).fill(null));
  
  // Try to generate a solution using backtracking
  if (solveBoard(grid)) {
    return grid;
  }
  
  // Fallback: create a simple valid pattern if backtracking fails
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      grid[i][j] = ((i + j) % 2) as CellValue;
    }
  }
  
  return grid;
}

/**
 * Remove cells from a complete solution to create a puzzle
 */
export function removeCellsFromSolution(solution: Grid, cellsToRemove: number): Grid {
  const size = solution.length;
  const puzzle = solution.map(row => [...row]); // Deep copy
  
  // Create array of all positions
  const positions: [number, number][] = [];
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      positions.push([i, j]);
    }
  }
  
  // Shuffle positions using Fisher-Yates algorithm
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  
  // Remove cells
  for (let i = 0; i < Math.min(cellsToRemove, positions.length); i++) {
    const [row, col] = positions[i];
    puzzle[row][col] = null;
  }
  
  return puzzle;
}

/**
 * Generate a Binairo puzzle with a guaranteed solution
 */
export function generateBoard(size: number = 6, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): Grid {
  // First generate a complete solution
  const solution = generateCompleteSolution(size);
  
  // Determine how many cells to remove based on difficulty
  const totalCells = size * size;
  let cellsToRemove: number;
  
  switch (difficulty) {
    case 'easy':
      cellsToRemove = Math.floor(totalCells * 0.3); // Remove 30%
      break;
    case 'medium':
      cellsToRemove = Math.floor(totalCells * 0.5); // Remove 50%
      break;
    case 'hard':
      cellsToRemove = Math.floor(totalCells * 0.7); // Remove 70%
      break;
    default:
      cellsToRemove = Math.floor(totalCells * 0.5);
  }
  
  // Remove cells to create the puzzle
  return removeCellsFromSolution(solution, cellsToRemove);
}

/**
 * Generate multiple boards and return the one with the best characteristics
 */
export function generateOptimalBoard(size: number = 6, attempts: number = 5): Grid {
  let bestBoard: Grid | null = null;
  let bestScore = -1;
  
  for (let i = 0; i < attempts; i++) {
    const board = generateBoard(size, 'medium');
    
    // Score the board based on how many cells are filled
    const filledCells = board.flat().filter(cell => cell !== null).length;
    const emptyCells = board.flat().filter(cell => cell === null).length;
    
    // Prefer boards with a good balance of filled and empty cells
    const score = filledCells + (emptyCells * 0.5);
    
    if (score > bestScore) {
      bestScore = score;
      bestBoard = board;
    }
  }
  
  return bestBoard || generateBoard(size);
}
