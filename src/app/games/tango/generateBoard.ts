import { Grid, isInvalid, canPlace } from './checkBoard';

/**
 * Generate a complete valid Tango solution using tree pruning
 */
export function generateCompleteSolution(size: number = 6): Grid {
  const grid: Grid = Array(size).fill(null).map(() => Array(size).fill(null));
  
  // Create shuffled list of all cell positions
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
  
  // Use tree pruning to generate a complete solution
  if (generateWithTreePruning(grid, positions, 0)) {
    return grid;
  }
  
  // If tree pruning fails, fall back to a simple approach
  return generateFallbackSolution(size);
}

/**
 * Recursive function to generate a complete solution using tree pruning
 */
function generateWithTreePruning(grid: Grid, positions: [number, number][], positionIndex: number): boolean {
  // If we've filled all cells, check if it's valid
  if (positionIndex === positions.length) {
    return !isInvalid(grid) && isCompleteSolution(grid);
  }
  
  // Get current position
  const [row, col] = positions[positionIndex];
  
  // Try placing 0 and 1, pruning invalid branches
  for (const value of [0, 1] as const) {
    if (canPlace(grid, row, col, value)) {
      grid[row][col] = value;
      
      // Check if this placement leads to a valid solution
      if (generateWithTreePruning(grid, positions, positionIndex + 1)) {
        return true;
      }
      
      // Backtrack
      grid[row][col] = null;
    }
  }
  
  return false;
}

/**
 * Check if the current grid is a complete valid solution
 */
function isCompleteSolution(grid: Grid): boolean {
  const size = grid.length;
  
  // Check that each row and column has exactly 3 of each type
  for (let i = 0; i < size; i++) {
    const rowCounts = { 0: 0, 1: 0 };
    const colCounts = { 0: 0, 1: 0 };
    
    for (let j = 0; j < size; j++) {
      if (grid[i][j] === null) return false; // Not complete
      rowCounts[grid[i][j]!]++;
      colCounts[grid[j][i]!]++;
    }
    
    if (rowCounts[0] !== 3 || rowCounts[1] !== 3) return false;
    if (colCounts[0] !== 3 || colCounts[1] !== 3) return false;
  }
  
  return true;
}

/**
 * Fallback solution generator if tree pruning fails
 */
function generateFallbackSolution(size: number): Grid {
  const grid: Grid = Array(size).fill(null).map(() => Array(size).fill(null));
  
  // Simple approach: fill each row with 3 zeros and 3 ones
  for (let i = 0; i < size; i++) {
    const row = Array(size).fill(null);
    
    // Place 3 zeros and 3 ones in random positions
    const positions = Array.from({ length: size }, (_, j) => j);
    for (let j = positions.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1));
      [positions[j], positions[k]] = [positions[k], positions[j]];
    }
    
    for (let j = 0; j < 3; j++) {
      row[positions[j]] = 0;
      row[positions[j + 3]] = 1;
    }
    
    grid[i] = row;
  }
  
  // If this creates violations, try to fix them
  if (isInvalid(grid)) {
    return generateFallbackSolution(size); // Recursive retry
  }
  
  return grid;
}

/**
 * Count the number of solutions for a given puzzle
 */
function countSolutions(grid: Grid): number {
  const size = grid.length;
  let solutionCount = 0;
  
  // Create shuffled list of empty cell positions
  const emptyPositions: [number, number][] = [];
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (grid[i][j] === null) {
        emptyPositions.push([i, j]);
      }
    }
  }
  
  // Shuffle empty positions for randomness
  for (let i = emptyPositions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [emptyPositions[i], emptyPositions[j]] = [emptyPositions[j], emptyPositions[i]];
  }
  
  function solve(grid: Grid, positionIndex: number): void {
    // If we've processed all empty cells, check if it's a valid solution
    if (positionIndex === emptyPositions.length) {
      if (!isInvalid(grid) && isCompleteSolution(grid)) {
        solutionCount++;
      }
      return;
    }
    
    // Get current empty position
    const [row, col] = emptyPositions[positionIndex];
    
    // Try placing 0 and 1
    for (const value of [0, 1] as const) {
      if (canPlace(grid, row, col, value)) {
        grid[row][col] = value;
        solve(grid, positionIndex + 1);
        grid[row][col] = null;
        
        // Early termination if we find more than one solution
        if (solutionCount > 1) return;
      }
    }
  }
  
  solve(grid, 0);
  return solutionCount;
}

/**
 * Remove cells from a complete solution to create a puzzle with exactly one solution
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
  
  // Remove cells one by one, ensuring uniqueness
  let removedCount = 0;
  for (const [row, col] of positions) {
    if (removedCount >= cellsToRemove) break;
    
    // Store the original value
    const originalValue = puzzle[row][col];
    
    // Remove the cell
    puzzle[row][col] = null;
    
    // Check if the puzzle still has exactly one solution
    const solutions = countSolutions(puzzle);
    
    if (solutions === 1) {
      removedCount++;
    } else {
      // Restore the cell if removing it breaks uniqueness
      puzzle[row][col] = originalValue;
    }
  }
  
  return puzzle;
}

/**
 * Generate a Tango puzzle with a guaranteed unique solution
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
  
  // Remove cells to create the puzzle while ensuring uniqueness
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

/**
 * Generate a board with its complete solution for hint functionality
 */
export function generateOptimalBoardWithSolution(size: number = 6, attempts: number = 5): { puzzle: Grid; solution: Grid } {
  let bestBoard: Grid | null = null;
  let bestSolution: Grid | null = null;
  let bestScore = -1;
  
  for (let i = 0; i < attempts; i++) {
    // First generate a complete solution
    const solution = generateCompleteSolution(size);
    
    // Then create a puzzle from it
    const puzzle = removeCellsFromSolution(solution, Math.floor(size * size * 0.5));
    
    // Score the board based on how many cells are filled
    const filledCells = puzzle.flat().filter(cell => cell !== null).length;
    const emptyCells = puzzle.flat().filter(cell => cell === null).length;
    
    // Prefer boards with a good balance of filled and empty cells
    const score = filledCells + (emptyCells * 0.5);
    
    if (score > bestScore) {
      bestScore = score;
      bestBoard = puzzle;
      bestSolution = solution;
    }
  }
  
  return {
    puzzle: bestBoard || generateBoard(size),
    solution: bestSolution || generateCompleteSolution(size)
  };
}