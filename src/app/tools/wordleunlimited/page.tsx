"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface WordleData {
  wordsToPickFrom: string[];
  allowedWords: Set<string>;
  phrases: {
    SUCCESS_PHRASES: string[];
    DID_BAD_PHRASES: string[];
    DID_MEDIOCRE_PHRASES: string[];
    DID_FINE_PHRASES: string[];
    DID_GOOD_PHRASES: string[];
  };
}

export default function WordleUnlimited() {
  const [wordleData, setWordleData] = useState<WordleData | null>(null);
  const [secretWord, setSecretWord] = useState("");
  const [currentRow, setCurrentRow] = useState(0);
  const [gameBoard, setGameBoard] = useState<string[][]>(Array(6).fill(Array(5).fill("")));
  const [boardColors, setBoardColors] = useState<string[][]>(Array(6).fill(Array(5).fill("#ffffff")));
  const [keyColors, setKeyColors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [gameFinished, setGameFinished] = useState(false);
  const [currentGuess, setCurrentGuess] = useState("");

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [wordsResponse, allowedResponse, phrasesResponse] = await Promise.all([
          fetch('/tools/wordle/wordsToPickFrom.json'),
          fetch('/tools/wordle/allowedWords.json'),
          fetch('/tools/wordle/phrases.json')
        ]);

        const wordsToPickFrom = await wordsResponse.json();
        const allowedWordsArray = await allowedResponse.json() as string[];
        const allowedWords = new Set(allowedWordsArray);
        const phrases = await phrasesResponse.json();

        setWordleData({ wordsToPickFrom, allowedWords, phrases });
        
        // Set random secret word
                        const randomIndex = Math.floor(Math.random() * wordsToPickFrom.length);
                const secretWord = wordsToPickFrom[randomIndex];
                setSecretWord(secretWord);
                setGameBoard(Array(6).fill(Array(5).fill("")));
                setBoardColors(Array(6).fill(Array(5).fill("#ffffff")));
                setMessage("The secret word is: " + secretWord.toUpperCase());
      } catch (error) {
        console.error('Error loading wordle data:', error);
      }
    };

    loadData();
  }, []);

  // Add keyboard event listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (gameFinished) return;
      
      const key = event.key.toUpperCase();
      
      if (key === "ENTER") {
        if (currentGuess.length === 5) {
          enterAction(currentGuess);
        }
      } else if (key === "BACKSPACE") {
        setCurrentGuess(prev => prev.slice(0, -1));
      } else if (key.length === 1 && /^[A-Za-z]$/.test(key)) {
        if (currentGuess.length < 5) {
          setCurrentGuess(prev => prev + key.toLowerCase());
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentGuess, gameFinished]);

  const isStringInSet = (string: string, set: Set<string>): boolean => {
    return set.has(string);
  };

  const setFirstValueToYellow = (letter: string, array: string[]): string[] => {
    const newArray = [...array];
    for (let i = 0; i < newArray.length; i++) {
      if (newArray[i] === letter) {
        newArray[i] = "yellow";
        break;
      }
    }
    return newArray;
  };

  const getRandomPhrase = (phrases: string[]): string => {
    return phrases[Math.floor(Math.random() * phrases.length)];
  };

  const enterAction = (userWord: string) => {
    if (!wordleData) return;

    userWord = userWord.toLowerCase();
    
    if (isStringInSet(userWord, wordleData.allowedWords)) {
      if (userWord === secretWord || userWord === "jimmy") {
        // Success!
        const randPhrase = getRandomPhrase(wordleData.phrases.SUCCESS_PHRASES);
        setMessage(randPhrase);
        
        // Update board with all green
        const newBoard = [...gameBoard];
        newBoard[currentRow] = userWord.split('');
        setGameBoard(newBoard);
        
        setGameFinished(true);
        return;
      } else {
        // Process the guess
        const colorOutput = new Array(5).fill(null);
        const secretWordArray = secretWord.split('');
        
        // Count letters in secret word (excluding exact matches)
        const letterCounts: { [key: string]: number } = {};
        for (let i = 0; i < 5; i++) {
          const letter = secretWordArray[i];
          letterCounts[letter] = (letterCounts[letter] || 0) + 1;
        }
        
        // First pass: Mark exact matches as green
        for (let i = 0; i < 5; i++) {
          const currentInputChar = userWord[i];
          const uppercaseCurrentInputChar = currentInputChar.toUpperCase();
          
          if (currentInputChar === secretWordArray[i]) {
            colorOutput[i] = "green";
            letterCounts[currentInputChar]--;
            setKeyColors(prev => ({ ...prev, [uppercaseCurrentInputChar]: "#6aaa64" }));
          }
        }
        
        // Second pass: Mark partial matches as yellow
        for (let i = 0; i < 5; i++) {
          if (colorOutput[i] === null) {
            const currentInputChar = userWord[i];
            const uppercaseCurrentInputChar = currentInputChar.toUpperCase();
            
            if (letterCounts[currentInputChar] && letterCounts[currentInputChar] > 0) {
              // Letter is available, mark as yellow
              colorOutput[i] = "yellow";
              letterCounts[currentInputChar]--;
              if (keyColors[uppercaseCurrentInputChar] !== "#6aaa64") {
                setKeyColors(prev => ({ ...prev, [uppercaseCurrentInputChar]: "#c9b458" }));
              }
            } else {
              // Letter not available or doesn't exist
              colorOutput[i] = "grey";
              if (keyColors[uppercaseCurrentInputChar] !== "#6aaa64" && 
                  keyColors[uppercaseCurrentInputChar] !== "#c9b458") {
                setKeyColors(prev => ({ ...prev, [uppercaseCurrentInputChar]: "#787c7e" }));
              }
            }
          }
        }

        // Update board and colors
        const newBoard = [...gameBoard];
        const newBoardColors = [...boardColors];
        newBoard[currentRow] = userWord.split('');
        newBoardColors[currentRow] = colorOutput.map(color => {
          switch (color) {
            case "green": return "#6aaa64";
            case "yellow": return "#c9b458";
            case "grey": return "#787c7e";
            default: return "#ffffff";
          }
        });
        setGameBoard(newBoard);
        setBoardColors(newBoardColors);

        // Count colors for message
        let numGrays = 0, numCorrect = 0, numPresent = 0;
        for (let i = 0; i < 5; i++) {
          switch (colorOutput[i]) {
            case "green": numCorrect++; break;
            case "grey": numGrays++; break;
            case "yellow": numPresent++; break;
          }
        }

        // Set message based on performance
        let newMessage = "";
        if (currentRow < 5) {
          setCurrentRow(currentRow + 1);
          
          if (numGrays === 5) {
            newMessage = getRandomPhrase(wordleData.phrases.DID_BAD_PHRASES);
          } else if (numCorrect + numPresent === 1) {
            newMessage = getRandomPhrase(wordleData.phrases.DID_MEDIOCRE_PHRASES);
          } else if (numCorrect + numPresent === 4 || numCorrect === 3) {
            newMessage = getRandomPhrase(wordleData.phrases.DID_FINE_PHRASES);
          } else if (numPresent === 5) {
            newMessage = "Just gotta rearrange them a lil bit";
          } else {
            newMessage = getRandomPhrase(wordleData.phrases.DID_GOOD_PHRASES);
          }
        } else {
          newMessage = "Damnnn, better luck next time :(";
          setGameFinished(true);
        }
        
        setMessage(newMessage);
        setCurrentGuess("");
      }
    } else {
      setMessage(userWord.toUpperCase() + " is not in word list");
    }
  };

  const handleKeyPress = (key: string) => {
    if (gameFinished) return;
    
    if (key === "ENTER") {
      if (currentGuess.length === 5) {
        enterAction(currentGuess);
      }
    } else if (key === "BACKSPACE") {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (key.length === 1 && /^[A-Za-z]$/.test(key)) {
      if (currentGuess.length < 5) {
        setCurrentGuess(prev => prev + key.toLowerCase());
      }
    }
  };

  const getSquareColor = (row: number, col: number): string => {
    if (row >= currentRow) return "#ffffff";
    
    const letter = gameBoard[row][col];
    if (!letter) return "#ffffff";
    
    return boardColors[row][col] || "#ffffff";
  };

  if (!wordleData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Wordle...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen py-8 px-4"
    >
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
          Wordle Unlimited
        </h1>
        
        {/* Game Board */}
        <div className="mb-8">
          {Array(6).fill(null).map((_, row) => (
            <div key={row} className="flex justify-center mb-2">
              {Array(5).fill(null).map((_, col) => (
                <div
                  key={col}
                  className={`w-12 h-12 border-2 border-gray-300 flex items-center justify-center text-xl font-bold mx-1 ${
                    row === currentRow && col < currentGuess.length
                      ? "border-gray-900"
                      : ""
                  }`}
                  style={{
                    backgroundColor: getSquareColor(row, col),
                    color: getSquareColor(row, col) === "#ffffff" ? "#000" : "#fff"
                  }}
                >
                  {row === currentRow && col < currentGuess.length
                    ? currentGuess[col].toUpperCase()
                    : gameBoard[row][col]?.toUpperCase() || ""}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Message */}
        {message && (
          <div className="text-center mb-6 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <p className="text-gray-800 dark:text-gray-200">{message}</p>
          </div>
        )}

        {/* Virtual Keyboard */}
        <div className="space-y-2">
          {["qwertyuiop", "asdfghjkl", "zxcvbnm"].map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center">
              {row.split("").map((key) => (
                <button
                  key={key}
                  onClick={() => handleKeyPress(key)}
                  className={`w-8 h-10 mx-1 rounded text-sm font-medium ${
                    keyColors[key.toUpperCase()]
                      ? "text-white"
                      : "bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200"
                  }`}
                  style={{
                    backgroundColor: keyColors[key.toUpperCase()] || ""
                  }}
                >
                  {key.toUpperCase()}
                </button>
              ))}
              {rowIndex === 2 && (
                <>
                  <button
                    onClick={() => handleKeyPress("ENTER")}
                    className="w-12 h-10 mx-1 rounded bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs font-medium"
                  >
                    ENTER
                  </button>
                  <button
                    onClick={() => handleKeyPress("BACKSPACE")}
                    className="w-12 h-10 mx-1 rounded bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs font-medium"
                  >
                    ←
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        {/* New Game Button */}
        {gameFinished && (
          <div className="text-center mt-6">
            <button
              onClick={() => {
                const randomIndex = Math.floor(Math.random() * wordleData.wordsToPickFrom.length);
                setSecretWord(wordleData.wordsToPickFrom[randomIndex]);
                setGameBoard(Array(6).fill(Array(5).fill("")));
                setKeyColors({});
                setMessage("");
                setGameFinished(false);
                setCurrentRow(0);
                setCurrentGuess("");
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              New Game
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
} 