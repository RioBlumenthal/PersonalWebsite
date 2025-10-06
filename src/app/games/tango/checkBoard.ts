export type CellValue = 0 | 1 | null;
export type Grid = CellValue[][];

/**
 * Checks if the current board state is invalid (has violations)
 */
export function isInvalid(grid: Grid): boolean {
  const size = grid.length;
  
  // Helper function to check linear constraints (rows or columns)
  const checkLinear = (isRow: boolean): boolean => {
    const major = size;
    const minor = size;
    
    for (let y = 0; y < major; ++y) {
      let recent1 = 0;
      let recent2 = 0;
      let total1 = 0;
      let total2 = 0;
      
      for (let x = 0; x < minor; ++x) {
        const val = isRow ? grid[y][x] : grid[x][y];
        
        if (val === 1) {
          if (++recent1 > 2) {
            return true; // Three 1s in a row
          }
          recent2 = 0;
          total1++;
        } else if (val === 0) {
          if (++recent2 > 2) {
            return true; // Three 0s in a row
          }
          recent1 = 0;
          total2++;
        } else {
          // null value - reset counters
          recent1 = 0;
          recent2 = 0;
        }
      }
      
      // Check if we have more than half of one type (only for complete rows/columns)
      const nonNullCount = total1 + total2;
      if (nonNullCount === minor) { // Only check if row/column is complete
        if (total1 > minor / 2 || total2 > minor / 2) {
          return true;
        }
      }
    }
    
    return false;
  };
  
  return checkLinear(true) || checkLinear(false);
}

/**
 * Check that there's no 3 in a row
 */
export function canPlace(grid: Grid, row: number, col: number, value: CellValue): boolean {
  if (value === null) return true;
  
  const size = grid.length;
  
  // Check for three in a row horizontally
  let count = 1;
  // Check left
  for (let i = col - 1; i >= 0 && grid[row][i] === value; i--) {
    count++;
  }
  // Check right
  for (let i = col + 1; i < size && grid[row][i] === value; i++) {
    count++;
  }
  if (count >= 3) return false;
  
  // Check for three in a row vertically
  count = 1;
  // Check up
  for (let i = row - 1; i >= 0 && grid[i][col] === value; i--) {
    count++;
  }
  // Check down
  for (let i = row + 1; i < size && grid[i][col] === value; i++) {
    count++;
  }
  if (count >= 3) return false;
  
  return true;
}

/**
 * Check if the board is complete and valid (win condition)
 */
export function isCompleteAndValid(grid: Grid): boolean {
  const size = grid.length;
  
  // First check if all cells are filled
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (grid[i][j] === null) {
        return false; // Game not complete
      }
    }
  }
  
  // Check if the board is valid (no violations)
  if (isInvalid(grid)) {
    return false;
  }
  
  return true;
}
