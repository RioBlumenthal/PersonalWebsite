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
  '#b3ffb3',
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

function growRegions(size: number, queens: [number, number][]): RegionGrid | null {
  const regions: RegionGrid = Array(size)
    .fill(null)
    .map(() => Array(size).fill(-1));

  for (let regionId = 0; regionId < queens.length; regionId++) {
    const [row, col] = queens[regionId];
    regions[row][col] = regionId;
  }

  const regionSizes = Array(size).fill(1);
  let unassigned = size * size - queens.length;

  while (unassigned > 0) {
    const candidates: {
      regionId: number;
      row: number;
      col: number;
      priority: number;
    }[] = [];

    const sizeTwoCount = regionSizes.filter((regionSize) => regionSize === 2).length;
    const sizeOneCount = regionSizes.filter((regionSize) => regionSize === 1).length;

    for (let regionId = 0; regionId < queens.length; regionId++) {
      const [queenRow, queenCol] = queens[regionId];
      const currentSize = regionSizes[regionId];

      if (currentSize === 1 && sizeTwoCount >= 1) {
        continue;
      }

      for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
          if (regions[row][col] !== regionId) continue;

          for (const [dr, dc] of [
            [0, 1],
            [0, -1],
            [1, 0],
            [-1, 0],
          ] as [number, number][]) {
            const nr = row + dr;
            const nc = col + dc;

            if (
              nr < 0 ||
              nr >= size ||
              nc < 0 ||
              nc >= size ||
              regions[nr][nc] !== -1
            ) {
              continue;
            }

            let priority = nr === queenRow || nc === queenCol ? 1 : 0;

            if (currentSize === 2 && sizeOneCount > 0) {
              priority -= 3;
            } else if (currentSize === 1 && sizeTwoCount === 0) {
              priority -= 2;
            } else if (currentSize === 2 && sizeTwoCount === 1) {
              priority -= 1;
            }

            candidates.push({
              regionId,
              row: nr,
              col: nc,
              priority,
            });
          }
        }
      }
    }

    if (candidates.length === 0) {
      return null;
    }

    const minPriority = Math.min(...candidates.map((candidate) => candidate.priority));
    const bestCandidates = shuffle(
      candidates.filter((candidate) => candidate.priority === minPriority)
    );
    const chosen = bestCandidates[0];

    regions[chosen.row][chosen.col] = chosen.regionId;
    regionSizes[chosen.regionId]++;
    unassigned--;
  }

  return hasValidRegionSizes(regions, size) ? regions : null;
}

function getRegionSizes(regions: RegionGrid, size: number): number[] {
  const sizes = Array(size).fill(0);

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      sizes[regions[row][col]]++;
    }
  }

  return sizes;
}

function hasValidRegionSizes(regions: RegionGrid, size: number): boolean {
  const sizes = getRegionSizes(regions, size);
  let regionsOfSizeTwo = 0;

  for (const regionSize of sizes) {
    if (regionSize === 1) {
      return false;
    }

    if (regionSize === 2) {
      regionsOfSizeTwo++;
      if (regionsOfSizeTwo > 1) {
        return false;
      }
    }
  }

  return true;
}

export function generatePuzzle(size: BoardSize): GeneratedPuzzle {
  const maxAttempts = size === 7 ? 2000 : size === 9 ? 5000 : 10000;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const queens = findRandomQueenPlacement(size);
    if (!queens) continue;

    const regions = growRegions(size, queens);
    if (!regions || !hasValidRegionSizes(regions, size)) continue;

    const solutions = enumeratePuzzleSolutions(regions, size, 2);

    if (solutions.length === 1) {
      return {
        size,
        regions,
        solution: solutions[0],
      };
    }
  }

  throw new Error(
    `Failed to generate a ${size}x${size} Queens puzzle with a unique solution`
  );
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
  size: number,
  regions: RegionGrid
): [number, number][] {
  const cells: [number, number][] = [];
  const queenRegion = regions[queenRow][queenCol];

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (row === queenRow && col === queenCol) continue;

      const sameRow = row === queenRow;
      const sameCol = col === queenCol;
      const touching =
        Math.abs(row - queenRow) <= 1 && Math.abs(col - queenCol) <= 1;
      const sameRegion = regions[row][col] === queenRegion;

      if (sameRow || sameCol || touching || sameRegion) {
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
  regions: RegionGrid,
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
    board.length,
    regions
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
  regions: RegionGrid,
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
    board.length,
    regions
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

export function isQueenPlacementValid(
  board: PlayerBoard,
  regions: RegionGrid,
  row: number,
  col: number
): boolean {
  const region = regions[row][col];

  for (let otherRow = 0; otherRow < board.length; otherRow++) {
    for (let otherCol = 0; otherCol < board[otherRow].length; otherCol++) {
      if (otherRow === row && otherCol === col) continue;
      if (board[otherRow][otherCol] !== 'queen') continue;

      if (otherRow === row) return false;
      if (otherCol === col) return false;
      if (regions[otherRow][otherCol] === region) return false;
      if (queensAreAdjacent(row, col, otherRow, otherCol)) return false;
    }
  }

  return true;
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

function enumeratePuzzleSolutions(
  regions: RegionGrid,
  size: number,
  maxSolutions = 2
): [number, number][][] {
  const solutions: [number, number][][] = [];
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

  function backtrack(row: number): void {
    if (solutions.length >= maxSolutions) return;

    if (row === size) {
      solutions.push(queens.map(([solutionRow, solutionCol]) => [solutionRow, solutionCol]));
      return;
    }

    for (let col = 0; col < size; col++) {
      if (!canPlace(row, col)) continue;

      queens.push([row, col]);
      usedCols.add(col);
      usedRegions.add(regions[row][col]);

      backtrack(row + 1);

      queens.pop();
      usedCols.delete(col);
      usedRegions.delete(regions[row][col]);

      if (solutions.length >= maxSolutions) return;
    }
  }

  backtrack(0);
  return solutions;
}

export function hasUniqueSolution(regions: RegionGrid, size: number): boolean {
  return enumeratePuzzleSolutions(regions, size, 2).length === 1;
}

export function solvePuzzle(regions: RegionGrid, size: number): [number, number][] | null {
  const solutions = enumeratePuzzleSolutions(regions, size, 1);
  return solutions[0] ?? null;
}
