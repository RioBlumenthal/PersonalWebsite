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

  const connectionsHorizontal: Grid = Array(size).fill(null).map(() => Array(size - 1).fill(null));
  const connectionsVertical: Grid = Array(size - 1).fill(null).map(() => Array(size).fill(null));

  // Horizontal connections: compare (y, x) with (y, x+1)
  for (let y = 0; y < size; ++y) {
    for (let x = 0; x < size - 1; ++x) {
      connectionsHorizontal[y][x] = grid[y][x] === grid[y][x + 1] ? 1 : 0;
    }
  }

  // Vertical connections: compare (y, x) with (y+1, x)
  for (let y = 0; y < size - 1; ++y) {
    for (let x = 0; x < size; ++x) {
      connectionsVertical[y][x] = grid[y][x] === grid[y + 1][x] ? 1 : 0;
    }
  }

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
export function removeCellsFromSolution(solution: Grid, connectionsVertical: Grid, connectionsHorizontal: Grid): { puzzle: Grid, connectionsVerticalPuzzle: Grid, connectionsHorizontalPuzzle: Grid } {
  const size = solution.length;
  const puzzle = solution.map(row => [...row]); // Deep copy
  const connectionsVerticalPuzzle = connectionsVertical.map(row => [...row]);
  const connectionsHorizontalPuzzle = connectionsHorizontal.map(row => [...row]);

  // Build a single randomized stream of candidates (cells + connections)
  type Candidate =
    | { kind: 'cell'; row: number; col: number }
    | { kind: 'h'; row: number; col: number }
    | { kind: 'v'; row: number; col: number };

  const candidates: Candidate[] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      candidates.push({ kind: 'cell', row: y, col: x });
    }
  }
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size - 1; x++) {
      candidates.push({ kind: 'h', row: y, col: x });
    }
  }
  for (let y = 0; y < size - 1; y++) {
    for (let x = 0; x < size; x++) {
      candidates.push({ kind: 'v', row: y, col: x });
    }
  }

  // Shuffle candidates using Fisher-Yates algorithm
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  // Enforce quotas: many cells, few connections; but choose targets in random order
  let removedCellsCount = 0;
  let removedConnectionsCount = 0;

  for (const c of candidates) {
    if (c.kind === 'cell') {
      const { row, col } = c;
      const original = puzzle[row][col];
      if (original === null) continue;
      puzzle[row][col] = null;
      const solutions = countSolutions(puzzle, connectionsVerticalPuzzle, connectionsHorizontalPuzzle);
      if (solutions === 1) {
        removedCellsCount++;
      } else {
        puzzle[row][col] = original;
      }
    } else if (c.kind === 'h') {
      const { row, col } = c;
      const original = connectionsHorizontalPuzzle[row][col];
      if (original === null) continue;
      connectionsHorizontalPuzzle[row][col] = null;
      const solutions = countSolutions(puzzle, connectionsVerticalPuzzle, connectionsHorizontalPuzzle);
      if (solutions === 1) {
        removedConnectionsCount++;
      } else {
        connectionsHorizontalPuzzle[row][col] = original;
      }
    } else {
      const { row, col } = c;
      const original = connectionsVerticalPuzzle[row][col];
      if (original === null) continue;
      connectionsVerticalPuzzle[row][col] = null;
      const solutions = countSolutions(puzzle, connectionsVerticalPuzzle, connectionsHorizontalPuzzle);
      if (solutions === 1) {
        removedConnectionsCount++;
      } else {
        connectionsVerticalPuzzle[row][col] = original;
      }
    }
  }
  console.log("removedCellsCount", removedCellsCount);
  console.log("removedConnectionsCount", removedConnectionsCount);

  return { puzzle, connectionsVerticalPuzzle, connectionsHorizontalPuzzle };
}

/**
 * Generate a board with its complete solution for hint functionality
 */
export function generateOptimalBoardWithSolution(size: number = 6, attempts: number = 1): { puzzle: Grid; connectionsVerticalPuzzle: Grid; connectionsHorizontalPuzzle: Grid; solution: Grid; } {
  let bestBoard: { puzzle: Grid, connectionsVerticalPuzzle: Grid, connectionsHorizontalPuzzle: Grid } | null = null;
  let bestSolution: Grid | null = null;
  let mostEmptyCells = -1;
  
  for (let i = 0; i < attempts; i++) {
    // First generate a complete solution
    const { grid, connectionsVertical, connectionsHorizontal } = generateCompleteSolution(size);
    
    // Then create a puzzle from it
    const { puzzle, connectionsVerticalPuzzle, connectionsHorizontalPuzzle } = removeCellsFromSolution(grid, connectionsVertical, connectionsHorizontal);
    
    const emptyCells = puzzle.flat().filter(cell => cell === null).length;
        
    if (emptyCells > mostEmptyCells) {
      mostEmptyCells = emptyCells;
      bestBoard = { puzzle, connectionsVerticalPuzzle, connectionsHorizontalPuzzle };
      bestSolution = grid;
    }
  }
  console.log(bestBoard);
  return {
    puzzle: bestBoard?.puzzle || Array(size).fill(null).map(() => Array(size).fill(null)),
    connectionsVerticalPuzzle: bestBoard?.connectionsVerticalPuzzle || Array(size-1).fill(null).map(() => Array(size).fill(null)),
    connectionsHorizontalPuzzle: bestBoard?.connectionsHorizontalPuzzle || Array(size).fill(null).map(() => Array(size-1).fill(null)),
    solution: bestSolution || Array(size).fill(null).map(() => Array(size).fill(null))
  };
}