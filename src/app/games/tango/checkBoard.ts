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
          if (x < size-1 && grid[y][x+1] !== null) { 
            if (connectionsHorizontal[y][x] === 1 && grid[y][x+1] !== val) { 
              return true; 
            } else if (connectionsHorizontal[y][x] === 0 && grid[y][x+1] === val) { 
              return true; 
            }
          }

          // check left
          if (x > 0 && grid[y][x-1] !== null) { 
            if (connectionsHorizontal[y][x-1] === 1 && grid[y][x-1] !== val) { 
              return true; 
            } else if (connectionsHorizontal[y][x-1] === 0 && grid[y][x-1] === val) { 
              return true; 
            }
          }
        }

        else {
          // We are scanning a column: current cell is at (row = x, col = y)
          // check up
          if (x > 0 && grid[x-1][y] !== null) { 
            if (connectionsVertical[x-1][y] === 1 && grid[x-1][y] !== val) { 
              return true; 
            } else if (connectionsVertical[x-1][y] === 0 && grid[x-1][y] === val) { 
              return true; 
            }
          }

          // check down
          if (x < size-1 && grid[x+1][y] !== null) { 
            if (connectionsVertical[x][y] === 1 && grid[x+1][y] !== val) { 
              return true; 
            } else if (connectionsVertical[x][y] === 0 && grid[x+1][y] === val) { 
              return true; 
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
    if (col < size-1 && grid[row][col+1] !== null) { 
      if (connectionsHorizontal[row][col] === 1 && grid[row][col+1] !== value) { 
        return false; 
      } else if (connectionsHorizontal[row][col] === 0 && grid[row][col+1] === value) { 
        return false; 
      }
    }

    // check left
    if (col > 0 && grid[row][col-1] !== null) { 
      if (connectionsHorizontal[row][col-1] === 1 && grid[row][col-1] !== value) { 
        return false; 
      } else if (connectionsHorizontal[row][col-1] === 0 && grid[row][col-1] === value) { 
        return false; 
      }
    }
  }

  if (connectionsVertical) {
    // check up
    if (row > 0 && grid[row-1][col] !== null) { 
      if (connectionsVertical[row-1][col] === 1 && grid[row-1][col] !== value) { 
        return false; 
      } else if (connectionsVertical[row-1][col] === 0 && grid[row-1][col] === value) { 
        return false; 
      }
    }

    // check down
    if (row < size-1 && grid[row+1][col] !== null) { 
      if (connectionsVertical[row][col] === 1 && grid[row+1][col] !== value) { 
        return false; 
      } else if (connectionsVertical[row][col] === 0 && grid[row+1][col] === value) { 
        return false; 
      }
    }
  }

  return true;
}

/**
 * Connection grids: horizontal[y][x] is between (y,x) and (y,x+1);
 * vertical[y][x] is between (y,x) and (y+1,x). May contain null for unknown.
 */
export type ConnectionGridH = (0 | 1 | null)[][]; // size x (size-1)
export type ConnectionGridV = (0 | 1 | null)[][]; // (size-1) x size

export type ForcedMove = {
  row: number;
  col: number;
  value: 0 | 1;
  reason: string;
};

/**
 * Returns all (row, col, value) moves that are forced by human-deducible rules:
 * 1) Two in a row next to an empty → empty must be the opposite symbol
 * 2) Connection known between filled and empty cell → empty is forced by same/different
 * 3) Row/column already has half of one symbol → remaining empties must be the other
 * Each returned move is one-step deducible (no lookahead). Only returns a move if all
 * rules that apply to that cell agree on the value (no contradictions).
 */
export function getForcedMoves(
  grid: Grid,
  connectionsVertical?: ConnectionGridV | Grid,
  connectionsHorizontal?: ConnectionGridH | Grid
): ForcedMove[] {
  const size = grid.length;
  const byCell = new Map<string, { values: Set<0 | 1>; reasons: Set<string> }>();
  const key = (r: number, c: number) => `${r},${c}`;
  const add = (r: number, c: number, val: 0 | 1, reason: string) => {
    const k = key(r, c);
    if (!byCell.has(k)) {
      byCell.set(k, { values: new Set<0 | 1>(), reasons: new Set<string>() });
    }
    const entry = byCell.get(k)!;
    entry.values.add(val);
    entry.reasons.add(reason);
  };

  // Rule 1: Two in a row → neighbor empty must be opposite
  const checkTwoInRow = (r: number, c: number) => {
    if (grid[r][c] !== null) return;
    const v: (0 | 1)[] = [];
    if (c >= 2) {
      const a = grid[r][c - 2], b = grid[r][c - 1];
      if (a !== null && b !== null && a === b) v.push((1 - a) as 0 | 1);
    }
    if (c <= size - 3) {
      const a = grid[r][c + 1], b = grid[r][c + 2];
      if (a !== null && b !== null && a === b) v.push((1 - a) as 0 | 1);
    }
    if (c >= 1 && c <= size - 2) {
      const a = grid[r][c - 1], b = grid[r][c + 1];
      if (a !== null && b !== null && a === b) v.push((1 - a) as 0 | 1);
    }
    if (r >= 2) {
      const a = grid[r - 2][c], b = grid[r - 1][c];
      if (a !== null && b !== null && a === b) v.push((1 - a) as 0 | 1);
    }
    if (r <= size - 3) {
      const a = grid[r + 1][c], b = grid[r + 2][c];
      if (a !== null && b !== null && a === b) v.push((1 - a) as 0 | 1);
    }
    if (r >= 1 && r <= size - 2) {
      const a = grid[r - 1][c], b = grid[r + 1][c];
      if (a !== null && b !== null && a === b) v.push((1 - a) as 0 | 1);
    }
    if (v.length && v.every(x => x === v[0])) add(r, c, v[0], 'two in a row');
  };

  // Rule 2: Connection where one side filled, other empty → empty forced
  const connH = connectionsHorizontal as (0 | 1 | null)[][] | undefined;
  const connV = connectionsVertical as (0 | 1 | null)[][] | undefined;
  const checkConnection = (r: number, c: number) => {
    if (grid[r][c] !== null) return;
    if (c > 0 && connH) {
      const conn = connH[r]?.[c - 1];
      const left = grid[r]?.[c - 1];
      if (conn !== null && conn !== undefined && left !== null) {
        add(r, c, (conn === 1 ? left : (1 - left)) as 0 | 1, 'connection');
        return;
      }
    }
    if (c < size - 1 && connH) {
      const conn = connH[r]?.[c];
      const right = grid[r]?.[c + 1];
      if (conn !== null && conn !== undefined && right !== null) {
        add(r, c, (conn === 1 ? right : (1 - right)) as 0 | 1, 'connection');
        return;
      }
    }
    if (r > 0 && connV) {
      const conn = connV[r - 1]?.[c];
      const up = grid[r - 1]?.[c];
      if (conn !== null && conn !== undefined && up !== null) {
        add(r, c, (conn === 1 ? up : (1 - up)) as 0 | 1, 'connection');
        return;
      }
    }
    if (r < size - 1 && connV) {
      const conn = connV[r]?.[c];
      const down = grid[r + 1]?.[c];
      if (conn !== null && conn !== undefined && down !== null) {
        add(r, c, (conn === 1 ? down : (1 - down)) as 0 | 1, 'connection');
      }
    }
  };

  // Rule 3: Row/column has half of one symbol → remaining must be the other
  const half = size / 2;
  const checkCount = (getCell: (i: number) => CellValue, getCoords: (i: number) => [number, number]) => {
    let count0 = 0, count1 = 0, empties: [number, number][] = [];
    for (let i = 0; i < size; i++) {
      const v = getCell(i);
      if (v === 0) count0++;
      else if (v === 1) count1++;
      else empties.push(getCoords(i));
    }
    const forcedVal: 0 | 1 | null =
      count0 === half ? 1 : count1 === half ? 0 : null;
    if (forcedVal !== null && empties.length > 0) {
      for (const [r, c] of empties) add(r, c, forcedVal, 'row/column count');
    }
  };

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] !== null) continue;
      checkTwoInRow(r, c);
      checkConnection(r, c);
    }
  }
  for (let r = 0; r < size; r++) {
    checkCount((i) => grid[r][i], (i) => [r, i]);
  }
  for (let c = 0; c < size; c++) {
    checkCount((i) => grid[i][c], (i) => [i, c]);
  }

  // Edge-based patterns involving first/last cells of rows and columns
  if (size >= 3) {
    // Rows
    for (let r = 0; r < size; r++) {
      const first = grid[r][0];
      const last = grid[r][size - 1];
      const second = size > 1 ? grid[r][1] : null;
      const beforeLast = size > 2 ? grid[r][size - 2] : null;

      // first & last same → second and second-to-last must be opposite
      if (first !== null && last !== null && first === last) {
        const opp = (1 - first) as 0 | 1;
        if (second === null && size > 1) add(r, 1, opp, 'edge pattern: first & last same');
        if (beforeLast === null && size > 2) add(r, size - 2, opp, 'edge pattern: first & last same');
      }

      // first & second-to-last same → last must be opposite
      if (first !== null && beforeLast !== null && first === beforeLast && last === null && size > 2) {
        add(r, size - 1, (1 - first) as 0 | 1, 'edge pattern: first & second-to-last same');
      }

      // second & last same → first must be opposite
      if (second !== null && last !== null && second === last && first === null && size > 1) {
        add(r, 0, (1 - second) as 0 | 1, 'edge pattern: second & last same');
      }
    }

    // Columns
    for (let c = 0; c < size; c++) {
      const first = grid[0][c];
      const last = grid[size - 1][c];
      const second = size > 1 ? grid[1][c] : null;
      const beforeLast = size > 2 ? grid[size - 2][c] : null;

      // first & last same → second and second-to-last must be opposite
      if (first !== null && last !== null && first === last) {
        const opp = (1 - first) as 0 | 1;
        if (second === null && size > 1) add(1, c, opp, 'edge pattern: first & last same');
        if (beforeLast === null && size > 2) add(size - 2, c, opp, 'edge pattern: first & last same');
      }

      // first & second-to-last same → last must be opposite
      if (first !== null && beforeLast !== null && first === beforeLast && last === null && size > 2) {
        add(size - 1, c, (1 - first) as 0 | 1, 'edge pattern: first & second-to-last same');
      }

      // second & last same → first must be opposite
      if (second !== null && last !== null && second === last && first === null && size > 1) {
        add(0, c, (1 - second) as 0 | 1, 'edge pattern: second & last same');
      }
    }
  }

  const out: ForcedMove[] = [];
  for (const [k, entry] of byCell) {
    if (entry.values.size === 1) {
      const [r, c] = k.split(',').map(Number);
      const value = [...entry.values][0];
      const reason = [...entry.reasons].join(' + ');
      out.push({ row: r, col: c, value, reason });
    }
  }
  return out;
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
