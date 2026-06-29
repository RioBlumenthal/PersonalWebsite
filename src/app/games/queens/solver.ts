export type BoardSize = 7 | 9 | 11;
export type CellState = 'empty' | 'x' | 'queen';
export type PlayerBoard = CellState[][];
export type RegionGrid = number[][];

export interface GeneratedPuzzle {
  size: BoardSize;
  regions: RegionGrid;
  solution: [number, number][];
}

export const BOARD_SIZES: BoardSize[] = [7, 9, 11];

export const REGION_COLORS = [
  '#fcd5b0',
  '#f8b4b4',
  '#b8e6dc',
  '#b8cdd8',
  '#f5e6a8',
  '#c8e8f5',
  '#a8d8ea',
  '#ffe4a3',
  '#ffc899',
  '#c5ddb8',
  '#d4c0f0',
];

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function createEmptyBoard(size: number): PlayerBoard {
  return Array(size)
    .fill(null)
    .map(() => Array(size).fill('empty' as CellState));
}

export function queensAreAdjacent(
  r1: number,
  c1: number,
  r2: number,
  c2: number
): boolean {
  return Math.abs(r1 - r2) <= 1 && Math.abs(c1 - c2) <= 1;
}

function canPlaceQueen(
  queens: [number, number][],
  row: number,
  col: number
): boolean {
  for (const [qr, qc] of queens) {
    if (qc === col) return false;
    if (queensAreAdjacent(qr, qc, row, col)) return false;
  }
  return true;
}

function findRandomQueenPlacement(size: number): [number, number][] | null {
  const queens: [number, number][] = [];

  function backtrack(row: number): boolean {
    if (row === size) return true;

    for (const col of shuffle([...Array(size).keys()])) {
      if (canPlaceQueen(queens, row, col)) {
        queens.push([row, col]);
        if (backtrack(row + 1)) return true;
        queens.pop();
      }
    }

    return false;
  }

  return backtrack(0) ? queens : null;
}

function growRegions(size: number, queens: [number, number][]): RegionGrid {
  const regions: RegionGrid = Array(size)
    .fill(null)
    .map(() => Array(size).fill(-1));

  const queues: [number, number][][] = queens.map(([row, col], regionId) => {
    regions[row][col] = regionId;
    return [[row, col]];
  });

  let unassigned = size * size - queens.length;
  let regionIndex = 0;

  while (unassigned > 0) {
    const nextQueue: [number, number][] = [];
    const directions: [number, number][] = [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ];

    for (const [row, col] of queues[regionIndex]) {
      for (const [dr, dc] of directions) {
        const nr = row + dr;
        const nc = col + dc;

        if (
          nr >= 0 &&
          nr < size &&
          nc >= 0 &&
          nc < size &&
          regions[nr][nc] === -1
        ) {
          regions[nr][nc] = regionIndex;
          nextQueue.push([nr, nc]);
          unassigned--;
        }
      }
    }

    queues[regionIndex] = shuffle(nextQueue);
    regionIndex = (regionIndex + 1) % size;
  }

  return regions;
}

export function generatePuzzle(size: BoardSize): GeneratedPuzzle {
  for (let attempt = 0; attempt < 100; attempt++) {
    const queens = findRandomQueenPlacement(size);
    if (!queens) continue;

    return {
      size,
      regions: growRegions(size, queens),
      solution: queens,
    };
  }

  throw new Error(`Failed to generate a ${size}x${size} Queens puzzle`);
}

export function countQueens(board: PlayerBoard): number {
  return board.reduce(
    (total, row) => total + row.filter((cell) => cell === 'queen').length,
    0
  );
}

export type CellKey = string;
export type QueenAutofillClaims = Map<CellKey, Set<CellKey>>;

export function toCellKey(row: number, col: number): CellKey {
  return `${row},${col}`;
}

export function getQueenAutofillCells(
  queenRow: number,
  queenCol: number,
  size: number
): [number, number][] {
  const cells: [number, number][] = [];

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (row === queenRow && col === queenCol) continue;

      const sameRow = row === queenRow;
      const sameCol = col === queenCol;
      const touching =
        Math.abs(row - queenRow) <= 1 && Math.abs(col - queenCol) <= 1;

      if (sameRow || sameCol || touching) {
        cells.push([row, col]);
      }
    }
  }

  return cells;
}

export function applyQueenAutofill(
  board: PlayerBoard,
  queenRow: number,
  queenCol: number,
  claims: QueenAutofillClaims
): { board: PlayerBoard; claims: QueenAutofillClaims } {
  const next = board.map((row) => [...row]);
  const nextClaims = new Map(
    [...claims.entries()].map(([key, queens]) => [key, new Set(queens)])
  );
  const queenKey = toCellKey(queenRow, queenCol);

  for (const [row, col] of getQueenAutofillCells(
    queenRow,
    queenCol,
    board.length
  )) {
    if (next[row][col] === 'queen') continue;

    const key = toCellKey(row, col);
    if (!nextClaims.has(key)) {
      nextClaims.set(key, new Set());
    }
    nextClaims.get(key)!.add(queenKey);
    next[row][col] = 'x';
  }

  return { board: next, claims: nextClaims };
}

export function removeQueenAutofill(
  board: PlayerBoard,
  queenRow: number,
  queenCol: number,
  manualMarks: Set<CellKey>,
  claims: QueenAutofillClaims
): { board: PlayerBoard; claims: QueenAutofillClaims } {
  const next = board.map((row) => [...row]);
  const nextClaims = new Map(
    [...claims.entries()].map(([key, queens]) => [key, new Set(queens)])
  );
  const queenKey = toCellKey(queenRow, queenCol);

  for (const [row, col] of getQueenAutofillCells(
    queenRow,
    queenCol,
    board.length
  )) {
    const key = toCellKey(row, col);
    const cellClaims = nextClaims.get(key);

    if (cellClaims) {
      cellClaims.delete(queenKey);
      if (cellClaims.size === 0) {
        nextClaims.delete(key);
      }
    }

    if (
      next[row][col] === 'x' &&
      !manualMarks.has(key) &&
      !nextClaims.has(key)
    ) {
      next[row][col] = 'empty';
    }
  }

  return { board: next, claims: nextClaims };
}

export function isSolutionPosition(
  solution: [number, number][],
  row: number,
  col: number
): boolean {
  return solution.some(([qr, qc]) => qr === row && qc === col);
}

export function validatePlayerSolution(
  board: PlayerBoard,
  regions: RegionGrid,
  size: number,
  solution: [number, number][]
): { valid: boolean; message: string } {
  const queens: [number, number][] = [];

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (board[row][col] === 'queen') {
        queens.push([row, col]);
      }
    }
  }

  if (queens.length !== size) {
    return {
      valid: false,
      message: `Place exactly ${size} queens to finish the puzzle.`,
    };
  }

  const usedRows = new Set<number>();
  const usedCols = new Set<number>();
  const usedRegions = new Set<number>();

  for (const [row, col] of queens) {
    if (usedRows.has(row)) {
      return { valid: false, message: 'Each row can only have one queen.' };
    }
    if (usedCols.has(col)) {
      return { valid: false, message: 'Each column can only have one queen.' };
    }

    const region = regions[row][col];
    if (usedRegions.has(region)) {
      return {
        valid: false,
        message: 'Each colored region can only have one queen.',
      };
    }

    usedRows.add(row);
    usedCols.add(col);
    usedRegions.add(region);
  }

  for (let i = 0; i < queens.length; i++) {
    for (let j = i + 1; j < queens.length; j++) {
      const [r1, c1] = queens[i];
      const [r2, c2] = queens[j];
      if (queensAreAdjacent(r1, c1, r2, c2)) {
        return {
          valid: false,
          message: 'Queens cannot touch, even diagonally.',
        };
      }
    }
  }

  const matchesSolution = solution.every(([row, col]) =>
    board[row][col] === 'queen'
  );

  if (!matchesSolution) {
    return {
      valid: false,
      message: 'Something is wrong with your queen placements.',
    };
  }

  return { valid: true, message: 'You solved the puzzle!' };
}

export function solvePuzzle(regions: RegionGrid, size: number): [number, number][] | null {
  const queens: [number, number][] = [];
  const usedCols = new Set<number>();
  const usedRegions = new Set<number>();

  function canPlace(row: number, col: number): boolean {
    if (usedCols.has(col)) return false;
    if (usedRegions.has(regions[row][col])) return false;

    for (const [qr, qc] of queens) {
      if (queensAreAdjacent(qr, qc, row, col)) return false;
    }

    return true;
  }

  function backtrack(row: number): boolean {
    if (row === size) return true;

    for (let col = 0; col < size; col++) {
      if (!canPlace(row, col)) continue;

      queens.push([row, col]);
      usedCols.add(col);
      usedRegions.add(regions[row][col]);

      if (backtrack(row + 1)) return true;

      queens.pop();
      usedCols.delete(col);
      usedRegions.delete(regions[row][col]);
    }

    return false;
  }

  return backtrack(0) ? queens : null;
}
