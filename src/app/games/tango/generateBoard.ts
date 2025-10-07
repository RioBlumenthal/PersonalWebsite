import { Grid, canPlace, isCompleteAndValid } from './checkBoard';

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
  generateWithTreePruning(grid, positions, 0);
  return grid;
  
}

/**
 * Recursive function to generate a complete solution using tree pruning
 */
function generateWithTreePruning(grid: Grid, positions: [number, number][], positionIndex: number): boolean {
  // If we've filled all cells, check if it's valid
  if (positionIndex === positions.length) {
    return isCompleteAndValid(grid);
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
  
  function solve(grid: Grid, positionIndex: number): void {
    // If we've processed all empty cells, check if it's a valid solution
    if (positionIndex === emptyPositions.length) {
      if (isCompleteAndValid(grid)) {
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
 * Generate a board with its complete solution for hint functionality
 */
export function generateOptimalBoardWithSolution(size: number = 6, attempts: number = 5): { puzzle: Grid; solution: Grid } {
  let bestBoard: Grid | null = null;
  let bestSolution: Grid | null = null;
  let mostEmptyCells = -1;
  
  for (let i = 0; i < attempts; i++) {
    // First generate a complete solution
    const solution = generateCompleteSolution(size);
    
    // Then create a puzzle from it
    const puzzle = removeCellsFromSolution(solution, Math.floor(size * size * 0.5));
    
    const emptyCells = puzzle.flat().filter(cell => cell === null).length;
        
    if (emptyCells > mostEmptyCells) {
      mostEmptyCells = emptyCells;
      bestBoard = puzzle;
      bestSolution = solution;
    }
  }
  
  return {
    puzzle: bestBoard || Array(size).fill(null).map(() => Array(size).fill(null)),
    solution: bestSolution || Array(size).fill(null).map(() => Array(size).fill(null))
  };
}