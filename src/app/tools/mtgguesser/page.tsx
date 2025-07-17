"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

interface CardData {
  name: string;
  image_uris: {
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

  const fetchRandomCard = useCallback(async () => {
    setIsLoading(true);
    setError("");
    setUserGuess("");
    setIsCorrect(null);
    setShowAnswer(false);
    
    try {
      const response = await fetch("https://api.scryfall.com/cards/random");
      if (!response.ok) {
        throw new Error("Failed to fetch card");
      }
      
      const data = await response.json();
      setCardData(data);
    } catch (err) {
      setError("Failed to load card. Please try again.");
      console.error("Error fetching card:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRandomCard();
  }, [fetchRandomCard]);

  const handleGuess = () => {
    if (!cardData || !userGuess.trim()) return;

    const normalizedGuess = userGuess.trim().toLowerCase();
    const normalizedCardName = cardData.name.toLowerCase();
    
    const isGuessCorrect = normalizedGuess === normalizedCardName;
    setIsCorrect(isGuessCorrect);
    
    if (isGuessCorrect) {
      setScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }));
    } else {
      setScore(prev => ({ ...prev, total: prev.total + 1 }));
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
    setIsCorrect(false);
    setScore(prev => ({ ...prev, total: prev.total + 1 }));
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
                  disabled={isCorrect !== null}
                />
                <button
                  onClick={handleGuess}
                  disabled={!userGuess.trim() || isCorrect !== null}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Guess
                </button>
              </div>
            </div>

            {/* Result Display */}
            {isCorrect !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto mb-6"
              >
                {isCorrect ? (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    <p className="font-bold">Correct! 🎉</p>
                    <p>You guessed it right!</p>
                  </div>
                ) : (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <p className="font-bold">Incorrect</p>
                    <p>The correct answer was: <span className="font-semibold">{cardData.name}</span></p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Card Details (shown after guess or reveal) */}
            {(isCorrect !== null || showAnswer) && (
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
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-md hover:shadow-lg"
              >
                New Card
              </button>
              
              {isCorrect === null && !showAnswer && (
                <button
                  onClick={handleRevealAnswer}
                  className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md hover:shadow-lg"
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