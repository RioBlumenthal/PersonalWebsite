export type CellValue = 0 | 1 | null;
export type Grid = CellValue[][];

/**
 * Checks if the current board state is invalid (has violations)
 */
export function isInvalid(grid: Grid, connectionsVertical?: Grid, connectionsHorizontal?: Grid): boolean {
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

        if (connectionsHorizontal && connectionsVertical) {
        if (isRow) {
          // check right
          if (x < size-1) { 
            if (connectionsHorizontal[y][x] === 1 && grid[y][x+1] === val) { 
              return false; 
            } else if (connectionsHorizontal[y][x] === 0 && grid[y][x+1] !== val) { 
              return false; 
            }
          }

          // check left
          if (x > 0) { 
            if (connectionsHorizontal[y][x-1] === 1 && grid[y][x-1] === val) { 
              return false; 
            } else if (connectionsHorizontal[y][x-1] === 0 && grid[y][x-1] !== val) { 
              return false; 
            }
          }
        }

        else {
          // check up
          if (y > 0) { 
            if (connectionsVertical[y-1][x] === 1 && grid[y-1][x] === val) { 
              return false; 
            } else if (connectionsVertical[y-1][x] === 0 && grid[y-1][x] !== val) { 
              return false; 
            }
          }

          // check down
          if (y < size-1) { 
            if (connectionsVertical[y][x] === 1 && grid[y+1][x] === val) { 
              return false; 
            } else if (connectionsVertical[y][x] === 0 && grid[y+1][x] !== val) { 
              return false; 
            }
          }
        }
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
export function canPlace(grid: Grid, row: number, col: number, value: CellValue, connectionsVertical?: Grid, connectionsHorizontal?: Grid): boolean {
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

  // check connections

  if (connectionsHorizontal) {
    // check right
    if (col < size-1) { 
      if (connectionsHorizontal[row][col] === 1 && grid[row][col+1] === value) { 
        return false; 
      } else if (connectionsHorizontal[row][col] === 0 && grid[row][col+1] !== value) { 
        return false; 
      }
    }

    // check left
    if (col > 0) { 
      if (connectionsHorizontal[row][col-1] === 1 && grid[row][col-1] === value) { 
        return false; 
      } else if (connectionsHorizontal[row][col-1] === 0 && grid[row][col-1] !== value) { 
        return false; 
      }
    }
  }

  if (connectionsVertical) {
    // check up
    if (row > 0) { 
      if (connectionsVertical[row-1][col] === 1 && grid[row-1][col] === value) { 
        return false; 
      } else if (connectionsVertical[row-1][col] === 0 && grid[row-1][col] !== value) { 
        return false; 
      }
    }

    // check down
    if (row < size-1) { 
      if (connectionsVertical[row][col] === 1 && grid[row+1][col] === value) { 
        return false; 
      } else if (connectionsVertical[row][col] === 0 && grid[row+1][col] !== value) { 
        return false; 
      }
    }
  }

  return true;
}

/**
 * Check if the board is complete and valid (win condition)
 */
export function isCompleteAndValid(grid: Grid, connectionsVertical?: Grid, connectionsHorizontal?: Grid): boolean {
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
  if (connectionsVertical && connectionsHorizontal) {
    if (isInvalid(grid, connectionsVertical, connectionsHorizontal)) {
      return false;
    }
  }
  else {
    if (isInvalid(grid)) {
      return false;
    }
  }
  return true;
}
