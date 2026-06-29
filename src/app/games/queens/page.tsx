"use client";

import { useEffect, useState } from "react";
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
  validatePlayerSolution,
} from "./solver";

const QueensGame: React.FC = () => {
  const [boardSize, setBoardSize] = useState<BoardSize>(7);
  const [puzzle, setPuzzle] = useState<GeneratedPuzzle | null>(null);
  const [board, setBoard] = useState<PlayerBoard>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isWin, setIsWin] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const startNewGame = (size: BoardSize) => {
    const nextPuzzle = generatePuzzle(size);
    setPuzzle(nextPuzzle);
    setBoard(createEmptyBoard(size));
    setStatusMessage(null);
    setIsWin(false);
    setShowPopup(false);
  };

  useEffect(() => {
    startNewGame(boardSize);
  }, [boardSize]);

  const handleCellClick = (row: number, col: number) => {
    if (!puzzle || isWin) return;

    const nextBoard = board.map((boardRow) => [...boardRow]);
    const current = nextBoard[row][col];

    let nextState: CellState;
    if (current === "empty") {
      nextState = "x";
    } else if (current === "x") {
      nextState = "queen";
    } else {
      nextState = "empty";
    }

    nextBoard[row][col] = nextState;
    setBoard(nextBoard);
    setStatusMessage(null);

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
            queen.
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

        <div className="bg-white rounded-lg shadow-lg p-2 sm:p-6 w-fit mx-auto">
          <div
            className="inline-grid gap-0.5 sm:gap-1"
            style={{
              gridTemplateColumns: `repeat(${puzzle.size}, minmax(0, 1fr))`,
            }}
          >
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const regionId = puzzle.regions[rowIndex][colIndex];
                const regionColor = REGION_COLORS[regionId % REGION_COLORS.length];

                return (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    className={`
                      ${cellSizeClass}
                      border border-gray-700/30 font-bold transition-all duration-150
                      flex items-center justify-center
                      ${isWin ? "cursor-default" : "cursor-pointer hover:brightness-95 hover:scale-105"}
                    `}
                    style={{ backgroundColor: regionColor }}
                    aria-label={`Row ${rowIndex + 1}, column ${colIndex + 1}`}
                  >
                    {cell === "x" ? (
                      <span className="text-gray-800/80 leading-none">×</span>
                    ) : cell === "queen" ? (
                      <span className="text-xl sm:text-2xl leading-none">♛</span>
                    ) : null}
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
          <button
            onClick={() => startNewGame(boardSize)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold transition-colors text-sm sm:text-base"
          >
            New Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default QueensGame;
