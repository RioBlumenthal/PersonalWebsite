import { Grid, canPlace, isCompleteAndValid } from './checkBoard';

/**
 * Generate a complete valid Tango solution using tree pruning
 */
export function generateCompleteSolution(size: number = 6): { grid: Grid, connectionsVertical: Grid, connectionsHorizontal: Grid } {
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
  
  const { connectionsVertical, connectionsHorizontal } = generateConnections(grid);
  return { grid, connectionsVertical, connectionsHorizontal };
}

export function generateConnections(grid: Grid): { connectionsVertical: Grid, connectionsHorizontal: Grid } {
  const size = grid.length;

  const checkLinear = (isRow: boolean): Grid => {
    const connections: Grid = Array(isRow ? size : size-1).fill(null).map(() => Array(isRow ? size-1 : size).fill(null));

    
    for (let y = 0; y < (isRow ? size : size-1); ++y) {
      for (let x = 0; x < (isRow ? size-1 : size); ++x) {
        const val = isRow ? grid[y][x] : grid[x][y];

        if (isRow) {
          // check right
          if (x < size-1) { 
            if (grid[y][x+1] === val) { 
              connections[y][x] = 1;
            } else if (grid[y][x+1] !== val) { 
              connections[y][x] = 0;
            }
          }

          // check left
          if (x > 0) { 
            if (grid[y][x-1] === val) { 
              connections[y][x] = 1;
            } else if (grid[y][x-1] !== val) { 
              connections[y][x] = 0;
            }
          }
        }
        else {
          // check up
          if (y > 0) { 
            if (grid[y-1][x] === val) { 
              connections[y][x] = 1;
            } else if (grid[y-1][x] !== val) { 
              connections[y][x] = 0;
            }
          }

          // check down
          if (y < size-1) { 
            if (grid[y+1][x] === val) { 
              connections[y][x] = 1;
            } else if (grid[y+1][x] !== val) { 
              connections[y][x] = 0; 
            }
          }
        }
      }
    }
    return connections;
  }
  const connectionsHorizontal: Grid = checkLinear(true);
  const connectionsVertical: Grid = checkLinear(false);
  return { connectionsVertical, connectionsHorizontal };
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
function countSolutions(grid: Grid, connectionsVertical: Grid, connectionsHorizontal: Grid): number {
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
  
  function solve(grid: Grid, connectionsVertical: Grid, connectionsHorizontal: Grid, positionIndex: number): void {
    // If we've processed all empty cells, check if it's a valid solution
    if (positionIndex === emptyPositions.length) {
      if (isCompleteAndValid(grid, connectionsVertical, connectionsHorizontal)) {
        solutionCount++;
      }
      return;
    }
    
    // Get current empty position
    const [row, col] = emptyPositions[positionIndex];
    
    // Try placing 0 and 1
    for (const value of [0, 1] as const) {
      if (canPlace(grid, row, col, value, connectionsVertical, connectionsHorizontal)) {
        grid[row][col] = value;
        solve(grid, connectionsVertical, connectionsHorizontal, positionIndex + 1);
        grid[row][col] = null;
        
        // Early termination if we find more than one solution
        if (solutionCount > 1) return;
      }
    }
  }
  
  solve(grid, connectionsVertical, connectionsHorizontal, 0);
  return solutionCount;
}

/**
 * Remove cells from a complete solution to create a puzzle with exactly one solution
 */
export function removeCellsFromSolution(solution: Grid, connectionsVertical: Grid, connectionsHorizontal: Grid, cellsToRemove: number): { puzzle: Grid, connectionsVerticalPuzzle: Grid, connectionsHorizontalPuzzle: Grid } {
  const size = solution.length;
  const puzzle = solution.map(row => [...row]); // Deep copy
  const connectionsVerticalPuzzle = connectionsVertical.map(row => [...row]);
  const connectionsHorizontalPuzzle = connectionsHorizontal.map(row => [...row]);
  
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
    const solutions = countSolutions(puzzle, connectionsVertical, connectionsHorizontal);
    
    if (solutions === 1) {
      removedCount++;
    } else {
      // Restore the cell if removing it breaks uniqueness
      puzzle[row][col] = originalValue;
    }
  }
  
  return { puzzle, connectionsVerticalPuzzle, connectionsHorizontalPuzzle };
}

/**
 * Generate a board with its complete solution for hint functionality
 */
export function generateOptimalBoardWithSolution(size: number = 6, attempts: number = 5): { puzzle: Grid; connectionsVerticalPuzzle: Grid; connectionsHorizontalPuzzle: Grid; solution: Grid; } {
  let bestBoard: { puzzle: Grid, connectionsVerticalPuzzle: Grid, connectionsHorizontalPuzzle: Grid } | null = null;
  let bestSolution: Grid | null = null;
  let mostEmptyCells = -1;
  
  for (let i = 0; i < attempts; i++) {
    // First generate a complete solution
    const { grid, connectionsVertical, connectionsHorizontal } = generateCompleteSolution(size);
    
    // Then create a puzzle from it
    const { puzzle, connectionsVerticalPuzzle, connectionsHorizontalPuzzle } = removeCellsFromSolution(grid, connectionsVertical, connectionsHorizontal, Math.floor(size * size * 0.5));
    
    const emptyCells = puzzle.flat().filter(cell => cell === null).length;
        
    if (emptyCells > mostEmptyCells) {
      mostEmptyCells = emptyCells;
      bestBoard = { puzzle, connectionsVerticalPuzzle, connectionsHorizontalPuzzle };
      bestSolution = grid;
    }
  }
  
  return {
    puzzle: bestBoard?.puzzle || Array(size).fill(null).map(() => Array(size).fill(null)),
    connectionsVerticalPuzzle: bestBoard?.connectionsVerticalPuzzle || Array(size-1).fill(null).map(() => Array(size).fill(null)),
    connectionsHorizontalPuzzle: bestBoard?.connectionsHorizontalPuzzle || Array(size).fill(null).map(() => Array(size-1).fill(null)),
    solution: bestSolution || Array(size).fill(null).map(() => Array(size).fill(null))
  };
}