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
  const [gameBoard, setGameBoard] = useState<string[][]>(
    Array(6).fill(Array(5).fill(""))
  );
  const [boardColors, setBoardColors] = useState<string[][]>(
    Array(6).fill(Array(5).fill("#ffffff"))
  );
  const [keyColors, setKeyColors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [gameFinished, setGameFinished] = useState(false);
  const [currentGuess, setCurrentGuess] = useState("");
  const [showRevealConfirm, setShowRevealConfirm] = useState(false);
  const [showNewGameConfirm, setShowNewGameConfirm] = useState(false);
  const [showHintConfirm, setShowHintConfirm] = useState(false);
  const [isGeneratingHint, setIsGeneratingHint] = useState(false);

  const [squareAnimations, setSquareAnimations] = useState<{
    [key: number]: boolean;
  }>({});

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [wordsResponse, allowedResponse, phrasesResponse] =
          await Promise.all([
            fetch("/tools/wordle/wordsToPickFrom.json"),
            fetch("/tools/wordle/allowedWords.json"),
            fetch("/tools/wordle/phrases.json"),
          ]);

        const wordsToPickFrom = await wordsResponse.json();
        const allowedWordsArray = (await allowedResponse.json()) as string[];
        const allowedWords = new Set(allowedWordsArray);
        const phrases = await phrasesResponse.json();

        setWordleData({ wordsToPickFrom, allowedWords, phrases });

        // Set random secret word
        const randomIndex = Math.floor(Math.random() * wordsToPickFrom.length);
        const secretWord = wordsToPickFrom[randomIndex];
        setSecretWord(secretWord);
        setGameBoard(Array(6).fill(Array(5).fill("")));
        setBoardColors(Array(6).fill(Array(5).fill("#ffffff")));
      } catch (error) {
        console.error("Error loading wordle data:", error);
      }
    };

    loadData();
  }, []);

  const isStringInSet = (string: string, set: Set<string>): boolean => {
    return set.has(string);
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

        // Update board with pastel rainbow colors
        const newBoard = [...gameBoard];
        const newBoardColors = [...boardColors];
        newBoard[currentRow] = userWord.split("");
        const rainbowColors = [
          "#ff6b6b",
          "#ffa07a",
          "#ffd93d",
          "#6bcf7f",
          "#4d9de0",
        ]; // Pastel Red, Orange, Yellow, Green, Blue
        newBoardColors[currentRow] = rainbowColors;
        setGameBoard(newBoard);
        setBoardColors(newBoardColors);

        // Update keyboard colors for all letters
        const newKeyColors = { ...keyColors };
        userWord.split("").forEach((letter) => {
          newKeyColors[letter.toUpperCase()] = "#6aaa64";
        });
        setKeyColors(newKeyColors);

        // Start dramatic wave animation with multiple squares in air
        setSquareAnimations({ 0: true });
        setTimeout(
          () => setSquareAnimations((prev) => ({ ...prev, 1: true })),
          150
        );
        setTimeout(
          () => setSquareAnimations((prev) => ({ ...prev, 2: true })),
          300
        );
        setTimeout(
          () => setSquareAnimations((prev) => ({ ...prev, 3: true })),
          450
        );
        setTimeout(
          () => setSquareAnimations((prev) => ({ ...prev, 4: true })),
          600
        );
        setTimeout(() => setSquareAnimations({}), 1800);

        setGameFinished(true);
        return;
      } else {
        // Process the guess
        const colorOutput = new Array(5).fill(null);
        const secretWordArray = secretWord.split("");

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
            setKeyColors((prev) => ({
              ...prev,
              [uppercaseCurrentInputChar]: "#6aaa64",
            }));
          }
        }

        // Second pass: Mark partial matches as yellow
        for (let i = 0; i < 5; i++) {
          if (colorOutput[i] === null) {
            const currentInputChar = userWord[i];
            const uppercaseCurrentInputChar = currentInputChar.toUpperCase();

            if (
              letterCounts[currentInputChar] &&
              letterCounts[currentInputChar] > 0
            ) {
              // Letter is available, mark as yellow
              colorOutput[i] = "yellow";
              letterCounts[currentInputChar]--;
              if (keyColors[uppercaseCurrentInputChar] !== "#6aaa64") {
                setKeyColors((prev) => ({
                  ...prev,
                  [uppercaseCurrentInputChar]: "#c9b458",
                }));
              }
            } else {
              // Letter not available or doesn't exist
              colorOutput[i] = "grey";
              if (
                keyColors[uppercaseCurrentInputChar] !== "#6aaa64" &&
                keyColors[uppercaseCurrentInputChar] !== "#c9b458"
              ) {
                setKeyColors((prev) => ({
                  ...prev,
                  [uppercaseCurrentInputChar]: "#787c7e",
                }));
              }
            }
          }
        }

        // Update board and colors
        const newBoard = [...gameBoard];
        const newBoardColors = [...boardColors];
        newBoard[currentRow] = userWord.split("");
        newBoardColors[currentRow] = colorOutput.map((color) => {
          switch (color) {
            case "green":
              return "#6aaa64";
            case "yellow":
              return "#c9b458";
            case "grey":
              return "#787c7e";
            default:
              return "#ffffff";
          }
        });
        setGameBoard(newBoard);
        setBoardColors(newBoardColors);

        // Count colors for message
        let numGrays = 0,
          numCorrect = 0,
          numPresent = 0;
        for (let i = 0; i < 5; i++) {
          switch (colorOutput[i]) {
            case "green":
              numCorrect++;
              break;
            case "grey":
              numGrays++;
              break;
            case "yellow":
              numPresent++;
              break;
          }
        }

        // Set message based on performance
        let newMessage = "";
        if (currentRow < 5) {
          setCurrentRow(currentRow + 1);

          if (numGrays === 5) {
            newMessage = getRandomPhrase(wordleData.phrases.DID_BAD_PHRASES);
          } else if (numCorrect + numPresent === 1) {
            newMessage = getRandomPhrase(
              wordleData.phrases.DID_MEDIOCRE_PHRASES
            );
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

  // Add keyboard event listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (gameFinished) return;

      const key = event.key.toUpperCase();

      // Prevent Enter from triggering buttons when they're focused
      if (key === "ENTER" && document.activeElement?.tagName === "BUTTON") {
        return;
      }

      if (key === "ENTER") {
        if (currentGuess.length === 5) {
          enterAction(currentGuess);
        }
      } else if (key === "BACKSPACE") {
        setCurrentGuess((prev) => prev.slice(0, -1));
      } else if (key.length === 1 && /^[A-Za-z]$/.test(key)) {
        if (currentGuess.length < 5) {
          setCurrentGuess((prev) => prev + key.toLowerCase());
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentGuess, gameFinished, enterAction]);

  const handleKeyPress = (key: string) => {
    if (gameFinished) return;

    if (key === "ENTER") {
      if (currentGuess.length === 5) {
        enterAction(currentGuess);
      }
    } else if (key === "BACKSPACE") {
      setCurrentGuess((prev) => prev.slice(0, -1));
    } else if (key.length === 1 && /^[A-Za-z]$/.test(key)) {
      if (currentGuess.length < 5) {
        setCurrentGuess((prev) => prev + key.toLowerCase());
      }
    }
  };

  const getSquareColor = (row: number, col: number): string => {
    if (row >= currentRow && !gameFinished) return "#ffffff";

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
    <>
      <style jsx>{`
        @keyframes smoothBounce {
          0%,
          10%,
          60%,
          85%,
          100% {
            transform: translate3d(0, 0, 0);
          }
          25%,
          30% {
            transform: translate3d(0, -20px, 0);
          }
          70% {
            transform: translate3d(0, -10px, 0);
          }
          90% {
            transform: translate3d(0, -5px, 0);
          }
        }
        .smooth-bounce {
          animation: smoothBounce 1.2s ease-in-out;
        }
      `}</style>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen py-8 px-4"
      >
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Wordle Unlimited
          </h1>

          <div className="max-w-4xl mx-auto">
            {/* Game Board */}
            <div className="mb-8">
              {Array(6)
                .fill(null)
                .map((_, row) => (
                  <div key={row} className="flex justify-center mb-2">
                    {Array(5)
                      .fill(null)
                      .map((_, col) => (
                        <div
                          key={col}
                          className={`w-12 h-12 border-2 border-gray-300 flex items-center justify-center text-xl font-bold mx-1 ${
                            row === currentRow && col < currentGuess.length
                              ? "border-gray-900"
                              : ""
                          } ${
                            gameFinished &&
                            row === currentRow &&
                            squareAnimations[col]
                              ? "smooth-bounce"
                              : ""
                          }`}
                          style={{
                            backgroundColor: getSquareColor(row, col),
                            color:
                              getSquareColor(row, col) === "#ffffff"
                                ? "#000"
                                : "#fff",
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
            <div className="space-y-2 mb-6">
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
                        backgroundColor: keyColors[key.toUpperCase()] || "",
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

            {/* Game Controls - Horizontal Row */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => {
                  if (gameFinished) {
                    // If game is finished, start new game immediately without confirmation
                    const randomIndex = Math.floor(
                      Math.random() * wordleData.wordsToPickFrom.length
                    );
                    const newSecretWord =
                      wordleData.wordsToPickFrom[randomIndex];
                    setSecretWord(newSecretWord);
                    setGameBoard(Array(6).fill(Array(5).fill("")));
                    setBoardColors(Array(6).fill(Array(5).fill("#ffffff")));
                    setKeyColors({});
                    setMessage("");
                    setGameFinished(false);
                    setCurrentRow(0);
                    setCurrentGuess("");
                    setSquareAnimations({});
                  } else {
                    // If game is still in progress, show confirmation dialog
                    setShowNewGameConfirm(true);
                  }
                }}
                className="bg-[#89cff0] hover:bg-[#7bb8d9] text-[#171717] px-6 py-3 rounded-lg font-medium transition-colors duration-200 dark:bg-[#0077b6] dark:hover:bg-[#005a8a] dark:text-[#ededed]"
              >
                New Game
              </button>

              <button
                onClick={() => setShowHintConfirm(true)}
                disabled={isGeneratingHint}
                className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                  isGeneratingHint
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
                    : 'bg-[#89cff0] hover:bg-[#7bb8d9] text-[#171717] dark:bg-[#0077b6] dark:hover:bg-[#005a8a] dark:text-[#ededed]'
                }`}
              >
                {isGeneratingHint ? 'Generating...' : 'Hint'}
              </button>

              <button
                onClick={() => setShowRevealConfirm(true)}
                className="bg-[#89cff0] hover:bg-[#7bb8d9] text-[#171717] px-6 py-3 rounded-lg font-medium transition-colors duration-200 dark:bg-[#0077b6] dark:hover:bg-[#005a8a] dark:text-[#ededed]"
              >
                Reveal Word
              </button>
            </div>

            {/* Confirmation Dialogs */}
            {showNewGameConfirm && (
              <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4 shadow-2xl border border-gray-200 dark:border-gray-600">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Start New Game?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Are you sure you want to start a new game? Your current
                    progress will be lost.
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        const randomIndex = Math.floor(
                          Math.random() * wordleData.wordsToPickFrom.length
                        );
                        const newSecretWord =
                          wordleData.wordsToPickFrom[randomIndex];
                        setSecretWord(newSecretWord);
                        setGameBoard(Array(6).fill(Array(5).fill("")));
                        setBoardColors(Array(6).fill(Array(5).fill("#ffffff")));
                        setKeyColors({});
                        setMessage("");
                        setGameFinished(false);
                        setCurrentRow(0);
                        setCurrentGuess("");
                        setSquareAnimations({});
                        setShowNewGameConfirm(false);
                      }}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                    >
                      Yes, New Game
                    </button>
                    <button
                      onClick={() => setShowNewGameConfirm(false)}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showHintConfirm && (
              <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4 shadow-2xl border border-gray-200 dark:border-gray-600">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Get an AI Hint?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Are you sure you want an AI-generated hint? This will analyze your current progress and provide strategic advice.
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={async () => {
                        setIsGeneratingHint(true);
                        try {
                          const response = await fetch('/api/hint', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              secretWord,
                              gameBoard,
                              currentRow,
                            }),
                          });

                          if (!response.ok) {
                            throw new Error('Failed to get hint');
                          }

                          const data = await response.json();
                          setMessage(data.hint);
                        } catch (error) {
                          console.error('Error getting hint:', error);
                          setMessage('Sorry, unable to generate hint right now.');
                        } finally {
                          setIsGeneratingHint(false);
                          setShowHintConfirm(false);
                        }
                      }}
                      className="flex-1 bg-[#89cff0] hover:bg-[#7bb8d9] text-[#171717] px-4 py-2 rounded-lg font-medium transition-colors duration-200 dark:bg-[#0077b6] dark:hover:bg-[#005a8a] dark:text-[#ededed]"
                    >
                      Yes, Get AI Hint
                    </button>
                    <button
                      onClick={() => setShowHintConfirm(false)}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showRevealConfirm && (
              <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4 shadow-2xl border border-gray-200 dark:border-gray-600">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Reveal Word?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Are you sure you want to reveal the secret word? This will
                    end the game.
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setMessage(`The word is: ${secretWord.toUpperCase()}`);
                        setShowRevealConfirm(false);
                      }}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                    >
                      Yes, Reveal
                    </button>
                    <button
                      onClick={() => setShowRevealConfirm(false)}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}
