"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

interface CardData {
  name: string;
  image_uris?: {
    art_crop: string;
  };
  mana_cost: string;
  type_line: string;
  oracle_text: string;
  power?: string;
  toughness?: string;
  colors: string[];
  rarity: string;
  set_name: string;
}

export default function MTGGuesser() {
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [userGuess, setUserGuess] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [error, setError] = useState("");
  const [hintLevel, setHintLevel] = useState(0);
  const [guessCount, setGuessCount] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [showIncorrectMessage, setShowIncorrectMessage] = useState(false);

  const fetchRandomCard = useCallback(async () => {
    setIsLoading(true);
    setError("");
    setUserGuess("");
    setIsCorrect(null);
    setShowAnswer(false);
    setHintLevel(0);
    setGuessCount(0);
    setGameFinished(false);
    setShowIncorrectMessage(false);
    
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      try {
        const response = await fetch("https://api.scryfall.com/cards/random");
        if (!response.ok) {
          throw new Error("Failed to fetch card");
        }
        
        const data = await response.json();
        
        // Check if the card has the required properties
        if (!data.name || !data.mana_cost || !data.type_line || !data.oracle_text) {
          throw new Error("Invalid card data received");
        }
        
        // Check if the card has image_uris with art_crop
        if (!data.image_uris?.art_crop) {
          attempts++;
          continue; // Try another card
        }
        
        setCardData(data);
        setIsLoading(false);
        return; // Successfully found a card with artwork
      } catch (err) {
        attempts++;
        if (attempts >= maxAttempts) {
          setError("Failed to load a valid card after multiple attempts. Please try again.");
          console.error("Error fetching card:", err);
          break;
        }
      }
    }
    
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchRandomCard();
  }, [fetchRandomCard]);

  const handleGuess = () => {
    if (!cardData || !userGuess.trim()) return;

    const normalizedGuess = userGuess.trim().toLowerCase().replace(/[^\w\s]/g, '');
    const normalizedCardName = cardData.name.toLowerCase().replace(/[^\w\s]/g, '');
    
    const isGuessCorrect = normalizedGuess === normalizedCardName;
    const newGuessCount = guessCount + 1;
    setGuessCount(newGuessCount);
    
    if (isGuessCorrect) {
      setScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }));
      setGameFinished(true);
      setIsCorrect(true);
    } else {
      // Show incorrect message (but not on the last guess)
      if (newGuessCount < 4) {
        setShowIncorrectMessage(true);
      }
      
      // Give hints after each incorrect guess
      if (newGuessCount === 1) {
        setHintLevel(1); // Mana cost after 1st wrong guess
      } else if (newGuessCount === 2) {
        setHintLevel(2); // Type line after 2nd wrong guess
      } else if (newGuessCount === 3) {
        setHintLevel(3); // Rules text after 3rd wrong guess
      }
      
      // End game after 4th guess
      if (newGuessCount >= 4) {
        setGameFinished(true);
        setIsCorrect(false);
        setScore(prev => ({ ...prev, total: prev.total + 1 })); // Only count as loss after 4th guess
      } else {
        // Reset for next guess and hide incorrect message after a delay
        setUserGuess("");
        setTimeout(() => setShowIncorrectMessage(false), 2000); // Hide after 2 seconds
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleGuess();
    }
  };

  const handleNewCard = () => {
    fetchRandomCard();
  };

  const handleRevealAnswer = () => {
    setShowAnswer(true);
    setGameFinished(true);
    setIsCorrect(false);
    setScore(prev => ({ ...prev, total: prev.total + 1 }));
  };

  const handleHint = () => {
    const newGuessCount = guessCount + 1;
    setGuessCount(newGuessCount);
    
    // Don't show incorrect message for hint clicks
    
    // Give hints after each hint button click
    if (newGuessCount === 1) {
      setHintLevel(1); // Mana cost after 1st hint
    } else if (newGuessCount === 2) {
      setHintLevel(2); // Type line after 2nd hint
    } else if (newGuessCount === 3) {
      setHintLevel(3); // Rules text after 3rd hint
    }
    
    // End game after 4th hint
    if (newGuessCount >= 4) {
      setGameFinished(true);
      setIsCorrect(false);
      setScore(prev => ({ ...prev, total: prev.total + 1 })); // Count as loss
    } else {
      // Reset for next guess and hide incorrect message after a delay
      setUserGuess("");
      setTimeout(() => setShowIncorrectMessage(false), 2000); // Hide after 2 seconds
    }
  };

  const getManaSymbols = (manaCost: string) => {
    if (!manaCost) return [];
    
    // Extract mana symbols from mana cost string like "{1}{U}{R}"
    const symbols = manaCost.match(/\{[^}]+\}/g) || [];
    return symbols.map(symbol => symbol.replace(/[{}]/g, ''));
  };

  const getColorClass = (color: string) => {
    const colorMap: { [key: string]: string } = {
      'W': 'bg-yellow-300 text-yellow-900',
      'U': 'bg-blue-500 text-white',
      'B': 'bg-gray-800 text-white',
      'R': 'bg-red-500 text-white',
      'G': 'bg-green-500 text-white',
    };
    return colorMap[color] || 'bg-gray-300 text-gray-700';
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen py-8 px-4"
      >
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            MTG Guesser
          </h1>
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">Loading card...</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen py-8 px-4"
    >
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
          MTG Guesser
        </h1>

        {/* Score Display */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-4 bg-white dark:bg-gray-800 rounded-lg px-6 py-3 shadow-md">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Score: <span className="font-bold text-green-600">{score.correct}</span> / <span className="font-bold">{score.total}</span>
            </span>
            {score.total > 0 && (
              <span className="text-sm text-gray-600 dark:text-gray-300">
                ({Math.round((score.correct / score.total) * 100)}%)
              </span>
            )}
          </div>
        </div>

        {error && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          </div>
        )}

        {cardData && (
          <div className="max-w-4xl mx-auto">
            {/* Card Artwork */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <img
                  src={cardData.image_uris.art_crop}
                  alt="Card artwork"
                  className="rounded-lg shadow-lg max-w-sm w-full"
                />
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                  {cardData.rarity}
                </div>
              </div>
            </div>

            {/* Guess Input */}
            <div className="max-w-md mx-auto mb-6">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={userGuess}
                  onChange={(e) => setUserGuess(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter card name..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  disabled={gameFinished}
                />
                <button
                  onClick={handleGuess}
                  disabled={!userGuess.trim() || gameFinished}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
                >
                  Guess
                </button>
                <button
                  onClick={handleHint}
                  disabled={gameFinished || guessCount >= 4}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
                >
                  Hint
                </button>
              </div>
            </div>

            {/* Guess Counter */}
            <div className="text-center mb-4">
              <div className="inline-flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Guesses: <span className="font-bold">{guessCount}</span>/4
                </span>
              </div>
            </div>

            {/* Incorrect Guess Message */}
            {showIncorrectMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-md mx-auto mb-4"
              >
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-center">
                  <p className="font-medium">Incorrect</p>
                </div>
              </motion.div>
            )}

            {/* Result Display */}
            {gameFinished && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto mb-6"
              >
                {isCorrect ? (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    <p className="font-bold">Correct! 🎉</p>
                    <p>You guessed it right in {guessCount} tries!</p>
                    <div className="mt-3">
                      <button
                        onClick={handleNewCard}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 text-sm"
                      >
                        Next Card
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <p className="font-bold">Game Over</p>
                    <p>The correct answer was: <span className="font-semibold">{cardData.name}</span></p>
                    <div className="mt-3">
                      <button
                        onClick={handleNewCard}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 text-sm"
                      >
                        Next Card
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

                        {/* Progressive Hints */}
            {hintLevel > 0 && (
              <div className="max-w-2xl mx-auto mb-6 space-y-3">
                {hintLevel >= 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                        💡 Hint #1
                      </h3>
                      <div className="text-sm text-blue-700 dark:text-blue-300">
                        <p><span className="font-semibold">Mana Cost:</span> {cardData.mana_cost}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {hintLevel >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                      <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                        💡 Hint #2
                      </h3>
                      <div className="text-sm text-green-700 dark:text-green-300">
                        <p><span className="font-semibold">Type:</span> {cardData.type_line}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {hintLevel >= 3 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
                      <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">
                        💡 Hint #3
                      </h3>
                      <div className="text-sm text-purple-700 dark:text-purple-300">
                        <div>
                          <p className="font-semibold mb-1">Rules Text:</p>
                          <p className="whitespace-pre-line">{cardData.oracle_text}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* Card Details (shown after game ends) */}
            {gameFinished && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto mb-6"
              >
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {cardData.name}
                    </h3>
                    <div className="flex space-x-1">
                      {getManaSymbols(cardData.mana_cost).map((symbol, index) => (
                        <span
                          key={index}
                          className={`px-2 py-1 rounded text-xs font-bold ${getColorClass(symbol)}`}
                        >
                          {symbol}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <p><span className="font-semibold">Type:</span> {cardData.type_line}</p>
                    {cardData.power && cardData.toughness && (
                      <p><span className="font-semibold">Power/Toughness:</span> {cardData.power}/{cardData.toughness}</p>
                    )}
                    <p><span className="font-semibold">Set:</span> {cardData.set_name}</p>
                    <p><span className="font-semibold">Rarity:</span> {cardData.rarity}</p>
                    {cardData.oracle_text && (
                      <div>
                        <p className="font-semibold mb-1">Rules Text:</p>
                        <p className="whitespace-pre-line">{cardData.oracle_text}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleNewCard}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
              >
                New Card
              </button>
              
              {!gameFinished && (
                <button
                  onClick={handleRevealAnswer}
                  className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
                >
                  Give Up
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
} 