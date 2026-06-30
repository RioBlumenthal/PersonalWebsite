"use client";

import { useEffect, useRef, useState } from "react";
import {
  BOARD_SIZES,
  BoardSize,
  CellState,
  GeneratedPuzzle,
  PlayerBoard,
  REGION_COLORS,
  countQueens,
  createEmptyBoard,
  generatePuzzle,
  applyQueenAutofill,
  removeQueenAutofill,
  toCellKey,
  isQueenPlacementValid,
  QueenAutofillClaims,
  validatePlayerSolution,
} from "./solver";

const THIN_BORDER = "1px";
const THICK_BORDER = "2.5px";
const DRAG_THRESHOLD_PX = 6;

function QueenIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden
    >
      <path d="M3 18h18v2H3v-2zm2.5-11 2.5 4 3-7 3 7 2.5-4L19 16H5l.5-9z" />
    </svg>
  );
}

function getCellCoordsFromPoint(
  clientX: number,
  clientY: number
): [number, number] | null {
  const element = document.elementFromPoint(clientX, clientY);
  const cell = element?.closest<HTMLElement>("[data-cell-row]");
  if (!cell) return null;

  const row = Number(cell.dataset.cellRow);
  const col = Number(cell.dataset.cellCol);
  if (Number.isNaN(row) || Number.isNaN(col)) return null;

  return [row, col];
}

function getCellBorderStyle(
  regions: GeneratedPuzzle["regions"],
  row: number,
  col: number,
  size: number
): React.CSSProperties {
  const regionId = regions[row][col];

  return {
    borderStyle: "solid",
    borderColor: "#000",
    borderTopWidth: row === 0 ? THIN_BORDER : "0",
    borderLeftWidth: col === 0 ? THIN_BORDER : "0",
    borderBottomWidth:
      row === size - 1
        ? THIN_BORDER
        : regions[row + 1][col] !== regionId
          ? THICK_BORDER
          : THIN_BORDER,
    borderRightWidth:
      col === size - 1
        ? THIN_BORDER
        : regions[row][col + 1] !== regionId
          ? THICK_BORDER
          : THIN_BORDER,
  };
}

const QueensGame: React.FC = () => {
  const [boardSize, setBoardSize] = useState<BoardSize>(7);
  const [puzzle, setPuzzle] = useState<GeneratedPuzzle | null>(null);
  const [board, setBoard] = useState<PlayerBoard>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isWin, setIsWin] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [autofill, setAutofill] = useState(false);
  const [manualMarks, setManualMarks] = useState<Set<string>>(() => new Set());
  const [autofillClaims, setAutofillClaims] = useState<QueenAutofillClaims>(
    () => new Map()
  );
  const [errorCells, setErrorCells] = useState<boolean[][]>([]);
  const [errorTimers, setErrorTimers] = useState<Map<string, NodeJS.Timeout>>(
    new Map()
  );
  const gridRef = useRef<HTMLDivElement>(null);
  const isPointerDown = useRef(false);
  const hasDragged = useRef(false);
  const startCell = useRef<[number, number] | null>(null);
  const activePointerId = useRef<number | null>(null);
  const lastMarkedCell = useRef<string | null>(null);
  const pointerStartPosition = useRef<{ x: number; y: number } | null>(null);

  const checkWinCondition = (nextBoard: PlayerBoard) => {
    if (!puzzle) return;

    if (countQueens(nextBoard) === puzzle.size) {
      const result = validatePlayerSolution(
        nextBoard,
        puzzle.regions,
        puzzle.size,
        puzzle.solution
      );

      if (result.valid) {
        setIsWin(true);
        setShowPopup(true);
        setStatusMessage(result.message);
      } else {
        setStatusMessage(result.message);
      }
    }
  };

  const startNewGame = (size: BoardSize) => {
    const nextPuzzle = generatePuzzle(size);
    setPuzzle(nextPuzzle);
    setBoard(createEmptyBoard(size));
    setManualMarks(new Set());
    setAutofillClaims(new Map());
    setErrorCells(createEmptyBoard(size).map((row) => row.map(() => false)));
    errorTimers.forEach((timer) => clearTimeout(timer));
    setErrorTimers(new Map());
    setStatusMessage(null);
    setIsWin(false);
    setShowPopup(false);
  };

  const handleClear = () => {
    if (!puzzle) return;

    setBoard(createEmptyBoard(puzzle.size));
    setManualMarks(new Set());
    setAutofillClaims(new Map());
    setErrorCells(createEmptyBoard(puzzle.size).map((row) => row.map(() => false)));
    errorTimers.forEach((timer) => clearTimeout(timer));
    setErrorTimers(new Map());
    setStatusMessage(null);
    setIsWin(false);
    setShowPopup(false);
  };

  const clearErrorTimer = (row: number, col: number) => {
    const cellKey = `${row}-${col}`;
    const existingTimer = errorTimers.get(cellKey);
    if (existingTimer) {
      clearTimeout(existingTimer);
      const nextTimers = new Map(errorTimers);
      nextTimers.delete(cellKey);
      setErrorTimers(nextTimers);
    }
  };

  const clearCellError = (row: number, col: number) => {
    clearErrorTimer(row, col);
    setErrorCells((prev) => {
      if (!prev[row]?.[col]) return prev;
      const next = prev.map((boardRow) => [...boardRow]);
      next[row][col] = false;
      return next;
    });
  };

  const scheduleQueenValidation = (row: number, col: number) => {
    if (!puzzle) return;

    clearErrorTimer(row, col);

    const cellKey = `${row}-${col}`;
    const timer = setTimeout(() => {
      setBoard((currentBoard) => {
        if (currentBoard[row][col] !== "queen") {
          return currentBoard;
        }

        if (isQueenPlacementValid(currentBoard, puzzle.regions, row, col)) {
          return currentBoard;
        }

        setErrorCells((prev) => {
          const next = prev.map((boardRow) => [...boardRow]);
          next[row][col] = true;
          return next;
        });

        return currentBoard;
      });

      setErrorTimers((prev) => {
        const next = new Map(prev);
        next.delete(cellKey);
        return next;
      });
    }, 1000);

    setErrorTimers((prev) => {
      const next = new Map(prev);
      next.set(cellKey, timer);
      return next;
    });
  };

  useEffect(() => {
    startNewGame(boardSize);
  }, [boardSize]);

  useEffect(() => {
    return () => {
      errorTimers.forEach((timer) => clearTimeout(timer));
    };
  }, [errorTimers]);

  const markCellAsX = (row: number, col: number) => {
    if (!puzzle || isWin) return;

    const cellKey = toCellKey(row, col);

    setBoard((prev) => {
      if (prev[row][col] !== "empty") return prev;

      const nextBoard = prev.map((boardRow) => [...boardRow]);
      nextBoard[row][col] = "x";
      return nextBoard;
    });

    setManualMarks((prev) => {
      if (prev.has(cellKey)) return prev;

      const nextManualMarks = new Set(prev);
      nextManualMarks.add(cellKey);
      return nextManualMarks;
    });

    setStatusMessage(null);
  };

  const handleCellClick = (row: number, col: number) => {
    if (!puzzle || isWin) return;

    clearCellError(row, col);

    const nextBoard = board.map((boardRow) => [...boardRow]);
    const current = nextBoard[row][col];

    const cellKey = toCellKey(row, col);
    const nextManualMarks = new Set(manualMarks);

    let nextState: CellState;
    if (current === "empty") {
      nextState = "x";
      nextManualMarks.add(cellKey);
    } else if (current === "x") {
      nextState = "queen";
      nextManualMarks.delete(cellKey);
    } else {
      nextState = "empty";
    }

    nextBoard[row][col] = nextState;

    let finalBoard = nextBoard;
    let finalClaims = autofillClaims;

    if (current === "queen" && nextState === "empty") {
      clearErrorTimer(row, col);
      const result = removeQueenAutofill(
        nextBoard,
        row,
        col,
        puzzle.regions,
        nextManualMarks,
        autofillClaims
      );
      finalBoard = result.board;
      finalClaims = result.claims;
    } else if (autofill && nextState === "queen") {
      const result = applyQueenAutofill(
        nextBoard,
        row,
        col,
        puzzle.regions,
        autofillClaims
      );
      finalBoard = result.board;
      finalClaims = result.claims;
    }

    setManualMarks(nextManualMarks);
    setAutofillClaims(finalClaims);
    setBoard(finalBoard);
    setStatusMessage(null);

    if (current === "x" && nextState === "queen") {
      scheduleQueenValidation(row, col);
    }

    checkWinCondition(finalBoard);
  };

  const markDragCell = (row: number, col: number) => {
    const cellKey = `${row}-${col}`;
    if (lastMarkedCell.current === cellKey) return;

    lastMarkedCell.current = cellKey;
    markCellAsX(row, col);
  };

  const processDragAt = (clientX: number, clientY: number) => {
    if (!isPointerDown.current || !puzzle || isWin) return;

    if (!hasDragged.current && pointerStartPosition.current) {
      const dx = clientX - pointerStartPosition.current.x;
      const dy = clientY - pointerStartPosition.current.y;
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
    }

    const coords = getCellCoordsFromPoint(clientX, clientY);
    if (!coords) return;

    const [row, col] = coords;

    if (!hasDragged.current && startCell.current) {
      hasDragged.current = true;
      markDragCell(startCell.current[0], startCell.current[1]);
    }

    markDragCell(row, col);
  };

  const finishPointerInteraction = () => {
    if (!puzzle || isWin) return;

    if (!hasDragged.current && startCell.current) {
      handleCellClick(startCell.current[0], startCell.current[1]);
    }

    isPointerDown.current = false;
    hasDragged.current = false;
    startCell.current = null;
    lastMarkedCell.current = null;
    activePointerId.current = null;
    pointerStartPosition.current = null;
  };

  const handlePointerDown = (
    row: number,
    col: number,
    event: React.PointerEvent<HTMLButtonElement>
  ) => {
    if (!puzzle || isWin) return;

    event.preventDefault();
    gridRef.current?.setPointerCapture(event.pointerId);

    isPointerDown.current = true;
    hasDragged.current = false;
    startCell.current = [row, col];
    activePointerId.current = event.pointerId;
    lastMarkedCell.current = null;
    pointerStartPosition.current = {
      x: event.clientX,
      y: event.clientY,
    };
  };

  const handleGridPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (
      !isPointerDown.current ||
      activePointerId.current !== event.pointerId
    ) {
      return;
    }

    processDragAt(event.clientX, event.clientY);
  };

  const handleGridPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (
      !isPointerDown.current ||
      activePointerId.current !== event.pointerId
    ) {
      return;
    }

    if (gridRef.current?.hasPointerCapture(event.pointerId)) {
      gridRef.current.releasePointerCapture(event.pointerId);
    }

    finishPointerInteraction();
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  if (!puzzle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4 flex items-center justify-center">
        <p className="text-gray-600">Loading puzzle...</p>
      </div>
    );
  }

  const cellSizeClass =
    puzzle.size === 7
      ? "w-10 h-10 sm:w-12 sm:h-12 text-lg"
      : puzzle.size === 9
        ? "w-8 h-8 sm:w-10 sm:h-10 text-base"
        : "w-7 h-7 sm:w-9 sm:h-9 text-sm";

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-2 sm:p-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-2">
            Queens
          </h1>
          <p className="text-sm sm:text-base text-gray-600 px-2">
            Place one queen in each row, column, and colored region. Queens
            cannot touch, even diagonally. Click cells to cycle: empty → X →
            queen. Drag across cells to mark multiple X&apos;s.
          </p>
        </div>

        {showPopup && (
          <>
            <div
              className="fixed inset-0 z-40"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.55)" }}
            />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-2 sm:p-4">
              <div className="bg-white rounded-lg shadow-2xl border-4 border-green-500 max-w-md w-full">
                <div className="p-4 sm:p-6">
                  <div className="relative mb-4">
                    <div className="flex flex-col items-center">
                      <h2 className="text-xl sm:text-2xl font-bold text-green-600 mb-2">
                        Congratulations!
                      </h2>
                      <p className="text-sm sm:text-base text-gray-700">
                        You solved the Queens puzzle!
                      </p>
                    </div>
                    <button
                      onClick={handleClosePopup}
                      className="absolute top-0 right-0 text-gray-400 hover:text-gray-600 text-2xl font-bold transition-colors"
                      aria-label="Close"
                    >
                      ×
                    </button>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={handleClosePopup}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
                    >
                      View Board
                    </button>
                    <button
                      onClick={() => startNewGame(boardSize)}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
                    >
                      New Game
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {BOARD_SIZES.map((size) => (
            <button
              key={size}
              onClick={() => setBoardSize(size)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors text-sm sm:text-base ${
                boardSize === size
                  ? "bg-purple-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
              }`}
            >
              {size}×{size}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-2 sm:p-6 w-fit mx-auto select-none">
          <div
            ref={gridRef}
            className="inline-grid gap-0 touch-none"
            style={{
              gridTemplateColumns: `repeat(${puzzle.size}, minmax(0, 1fr))`,
              touchAction: "none",
            }}
            onPointerMove={handleGridPointerMove}
            onPointerUp={handleGridPointerUp}
            onPointerCancel={handleGridPointerUp}
          >
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const regionId = puzzle.regions[rowIndex][colIndex];
                const regionColor = REGION_COLORS[regionId % REGION_COLORS.length];
                const isError = errorCells[rowIndex]?.[colIndex];

                return (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    type="button"
                    data-cell-row={rowIndex}
                    data-cell-col={colIndex}
                    onPointerDown={(event) =>
                      handlePointerDown(rowIndex, colIndex, event)
                    }
                    className={`
                      ${cellSizeClass}
                      font-bold transition-all duration-150
                      flex items-center justify-center relative
                      ${isWin ? "cursor-default" : "cursor-pointer hover:brightness-95 hover:scale-[1.02]"}
                    `}
                    style={{
                      backgroundColor: regionColor,
                      ...getCellBorderStyle(
                        puzzle.regions,
                        rowIndex,
                        colIndex,
                        puzzle.size
                      ),
                    }}
                    aria-label={`Row ${rowIndex + 1}, column ${colIndex + 1}`}
                  >
                    {cell === "x" ? (
                      <span className="text-gray-800/80 leading-none">×</span>
                    ) : cell === "queen" ? (
                      <QueenIcon className="w-[1.15em] h-[1.15em] text-gray-900" />
                    ) : null}
                    {isError && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-red-200/70">
                        <span className="text-red-600 text-2xl sm:text-4xl font-bold leading-none">
                          ×
                        </span>
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="mt-4 sm:mt-6 text-center text-sm text-gray-700 min-h-[1.5rem] px-2">
          <p>
            Queens placed: {countQueens(board)} / {puzzle.size}
          </p>
          {statusMessage && (
            <p
              className={`mt-2 font-semibold ${
                isWin ? "text-green-600" : "text-red-600"
              }`}
            >
              {statusMessage}
            </p>
          )}
        </div>

        <div className="mt-4 sm:mt-6 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-2 sm:gap-4">
              <button
                onClick={() => startNewGame(boardSize)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold transition-colors text-sm sm:text-base"
              >
                New Game
              </button>
              <button
                onClick={handleClear}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold transition-colors text-sm sm:text-base"
              >
                Clear
              </button>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autofill}
                onChange={(e) => setAutofill(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              Autofill
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueensGame;
