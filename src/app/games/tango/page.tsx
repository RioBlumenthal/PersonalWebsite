"use client";

import { useState, useEffect } from 'react';
import { Grid, isCompleteAndValid } from './checkBoard';
import { generateOptimalBoardWithSolution } from './generateBoard';

const TangoGame: React.FC = () => {
  const [grid, setGrid] = useState<Grid>([]);
  const [prefilledCells, setPrefilledCells] = useState<boolean[][]>([]);
  const [hintCells, setHintCells] = useState<boolean[][]>([]);
  const [errorCells, setErrorCells] = useState<boolean[][]>([]);
  const [solution, setSolution] = useState<Grid>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [errorTimers, setErrorTimers] = useState<Map<string, NodeJS.Timeout>>(new Map());

  // Initialize the game
  useEffect(() => {
    const { puzzle, solution: completeSolution } = generateOptimalBoardWithSolution();
    setGrid(puzzle);
    setSolution(completeSolution);
    
    // Track which cells are prefilled (not null)
    const prefilled = puzzle.map(row => 
      row.map(cell => cell !== null)
    );
    setPrefilledCells(prefilled);
    
    // Initialize hint cells as all false
    const hints = puzzle.map(row => 
      row.map(() => false)
    );
    setHintCells(hints);
    
    // Initialize error cells as all false
    const errors = puzzle.map(row => 
      row.map(() => false)
    );
    setErrorCells(errors);
    
    setIsComplete(false);
    setShowPopup(false);
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      errorTimers.forEach(timer => clearTimeout(timer));
    };
  }, [errorTimers]);

  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    if (isComplete) return;
    
    // Don't allow editing prefilled cells or hint cells
    if (prefilledCells[row]?.[col] || hintCells[row]?.[col]) return;
    
    const newGrid = grid.map(row => [...row]);
    const currentValue = newGrid[row][col];
    
    // Clear any existing error state for this cell
    const newErrorCells = errorCells.map(row => [...row]);
    newErrorCells[row][col] = false;
    setErrorCells(newErrorCells);
    
    // Clear any existing timer for this cell
    const cellKey = `${row}-${col}`;
    const existingTimer = errorTimers.get(cellKey);
    if (existingTimer) {
      clearTimeout(existingTimer);
      const newTimers = new Map(errorTimers);
      newTimers.delete(cellKey);
      setErrorTimers(newTimers);
    }
    
    // Cycle through: null -> 0 -> 1 -> null
    if (currentValue === null) {
      newGrid[row][col] = 0;
    } else if (currentValue === 0) {
      newGrid[row][col] = 1;
    } else {
      newGrid[row][col] = null;
    }
    
    setGrid(newGrid);
    
    // Check if the new value is wrong and set up error timer
    const newValue = newGrid[row][col];
    if (newValue !== null && newValue !== solution[row][col]) {
      const timer = setTimeout(() => {
        setErrorCells(prev => {
          const updated = prev.map(row => [...row]);
          updated[row][col] = true;
          return updated;
        });
      }, 1000);
      
      const newTimers = new Map(errorTimers);
      newTimers.set(cellKey, timer);
      setErrorTimers(newTimers);
    }
    
    // Check win condition
    if (isCompleteAndValid(newGrid)) {
      setIsComplete(true);
      setShowPopup(true);
    }
  };

  // Generate new board
  const handleNewGame = () => {
    const { puzzle, solution: completeSolution } = generateOptimalBoardWithSolution();
    setGrid(puzzle);
    setSolution(completeSolution);
    
    // Track which cells are prefilled (not null)
    const prefilled = puzzle.map(row => 
      row.map(cell => cell !== null)
    );
    setPrefilledCells(prefilled);
    
    // Initialize hint cells as all false
    const hints = puzzle.map(row => 
      row.map(() => false)
    );
    setHintCells(hints);
    
    // Initialize error cells as all false
    const errors = puzzle.map(row => 
      row.map(() => false)
    );
    setErrorCells(errors);
    
    // Clear any existing error timers
    errorTimers.forEach(timer => clearTimeout(timer));
    setErrorTimers(new Map());
    
    setIsComplete(false);
    setShowPopup(false);
  };

  // Close popup
  const handleClosePopup = () => {
    setShowPopup(false);
  };

  // View board (close popup to see the completed board)
  const handleViewBoard = () => {
    setShowPopup(false);
  };

  // Handle hint
  const handleHint = () => {
    if (isComplete) return;
    
    // Find all empty cells that are not prefilled or already hinted
    const emptyCells: [number, number][] = [];
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        if (grid[row][col] === null && !prefilledCells[row][col] && !hintCells[row][col]) {
          emptyCells.push([row, col]);
        }
      }
    }
    
    // If no empty cells available, return
    if (emptyCells.length === 0) return;
    
    // Pick a random empty cell
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    const [row, col] = emptyCells[randomIndex];
    
    // Reveal the correct value from the solution
    const newGrid = grid.map(row => [...row]);
    newGrid[row][col] = solution[row][col];
    setGrid(newGrid);
    
    // Mark this cell as a hint cell
    const newHintCells = hintCells.map(row => [...row]);
    newHintCells[row][col] = true;
    setHintCells(newHintCells);
    
    // Check win condition
    if (isCompleteAndValid(newGrid)) {
      setIsComplete(true);
      setShowPopup(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Tango</h1>
          <p className="text-gray-600">
            Fill the grid with X&apos;s and O&apos;s. Each row and column must have exactly 3 of each type, 
            and no three identical symbols can be adjacent.
          </p>
        </div>

        {showPopup && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.55)' }}
            />
            
            {/* Popup */}
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-2xl border-4 border-green-500 max-w-md w-full animate-slide-down">
                <div className="p-6">
                  {/* Header with close button */}
                  <div className="relative mb-4">
                    <div className="flex flex-col items-center">
                      <h2 className="text-2xl font-bold text-green-600 mb-2">Congratulations!</h2>
                      <p className="text-gray-700">You solved the Tango puzzle!</p>
                    </div>
                    <button
                      onClick={handleClosePopup}
                      className="absolute top-0 right-0 text-gray-400 hover:text-gray-600 text-2xl font-bold transition-colors"
                      aria-label="Close"
                    >
                      ×
                    </button>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={handleViewBoard}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 text-sm"
                    >
                      View Board
                    </button>
                    <button
                      onClick={handleNewGame}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 text-sm"
                    >
                      New Game
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6 w-fit mx-auto">
          <div className="w-80 h-80 grid grid-cols-6 grid-rows-6">
            {grid.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const isPrefilled = prefilledCells[rowIndex]?.[colIndex];
                const isHint = hintCells[rowIndex]?.[colIndex];
                const isError = errorCells[rowIndex]?.[colIndex];
                return (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    className={`
                      aspect-square border font-bold text-lg transition-all duration-200 relative
                      ${cell === null 
                        ? 'bg-white border-gray-300 hover:bg-gray-50' 
                        : isPrefilled
                          ? 'bg-gray-100 border-gray-300 cursor-default'
                          : isHint
                            ? 'bg-yellow-100 border-yellow-400 cursor-default'
                            : isError
                              ? 'bg-red-100 border-red-400 cursor-pointer hover:bg-red-200'
                              : 'bg-white border-gray-300 hover:bg-gray-50'
                      }
                      ${isComplete ? 'cursor-default' : (isPrefilled || isHint ? 'cursor-default' : 'cursor-pointer hover:scale-105')}
                    `}
                  >
                    {cell === 0 ? (
                      <span className={`font-bold ${isHint ? 'text-orange-600' : 'text-red-600'}`}>O</span>
                    ) : cell === 1 ? (
                      <span className={`font-bold ${isHint ? 'text-orange-600' : 'text-blue-600'}`}>X</span>
                    ) : null}
                    {isError && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-red-500 text-4xl font-bold opacity-60">X</div>
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Click cells to cycle through: empty → O → X → empty</p>
        </div>

        <div className="mt-6 text-center">
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleHint}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              Hint
            </button>
            <button
              onClick={handleNewGame}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              New Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TangoGame;
