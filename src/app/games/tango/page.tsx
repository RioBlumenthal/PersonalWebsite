"use client";

import { useState, useEffect } from 'react';
import { Grid, isCompleteAndValid } from './solveBoard';
import { generateOptimalBoard } from './generateBoard';

const TangoGame: React.FC = () => {
  const [grid, setGrid] = useState<Grid>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  // Initialize the game
  useEffect(() => {
    setGrid(generateOptimalBoard());
    setIsComplete(false);
    setShowPopup(false);
  }, []);

  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    if (isComplete) return;
    
    const newGrid = grid.map(row => [...row]);
    const currentValue = newGrid[row][col];
    
    // Cycle through: null -> 0 -> 1 -> null
    if (currentValue === null) {
      newGrid[row][col] = 0;
    } else if (currentValue === 0) {
      newGrid[row][col] = 1;
    } else {
      newGrid[row][col] = null;
    }
    
    setGrid(newGrid);
    
    // Check win condition
    if (isCompleteAndValid(newGrid)) {
      setIsComplete(true);
      setShowPopup(true);
    }
  };

  // Generate new board
  const handleNewGame = () => {
    setGrid(generateOptimalBoard());
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Tango</h1>
          <p className="text-gray-600">
            Fill the grid with 0s and 1s. Each row and column must have exactly 3 of each type, 
            and no three identical numbers can be adjacent.
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
          <div className="w-80 h-80 grid grid-cols-6 grid-rows-6 gap-2">
            {grid.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  className={`
                    aspect-square border-2 rounded-lg font-bold text-lg transition-all duration-200
                    ${cell === null 
                      ? 'bg-gray-100 border-gray-300 hover:bg-gray-200' 
                      : cell === 0 
                        ? 'bg-red-100 border-red-300 text-red-700 hover:bg-red-200' 
                        : 'bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200'
                    }
                    ${isComplete ? 'cursor-default' : 'cursor-pointer hover:scale-105'}
                  `}
                >
                  {cell}
                </button>
              ))
            )}
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Click cells to cycle through: empty → 0 → 1 → empty</p>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={handleNewGame}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            New Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default TangoGame;
