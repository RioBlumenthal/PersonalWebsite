"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export default function FlorrioCalculator() {
  const [petals, setPetals] = useState("");
  const [rarity, setRarity] = useState("");
  const [expectedSuccesses, setExpectedSuccesses] = useState<number | null>(null);

  const rarityPercentages = {
    "Common": 64,
    "Unusual": 32,
    "Rare": 16,
    "Epic": 8,
    "Legendary": 4,
    "Mythic": 2,
    "Ultra": 1
  };

  const calculateExpectedSuccesses = () => {
    const N = parseFloat(petals);
    const p = rarityPercentages[rarity as keyof typeof rarityPercentages] / 100; // Convert percentage to decimal
    
    if (isNaN(N) || !rarity || N <= 0) {
      setExpectedSuccesses(null);
      return;
    }
    
    const result = (N * p) / (2.5 + 2.5 * p);
    setExpectedSuccesses(result);
  };

  const handleCalculate = () => {
    calculateExpectedSuccesses();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      calculateExpectedSuccesses();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen py-8 px-4"
    >
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
          Florr.io Crafting Calculator
        </h1>

        <div className="max-w-2xl mx-auto">
          {/* Calculator Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-8">
              <div className="relative inline-block">
                <img
                  src="/tools/FlorrCrafting.png"
                  alt="Florr.io Crafting"
                  className="w-56 h-auto max-h-56 object-contain mb-4 rounded-lg border-2 border-gray-200 dark:border-gray-600 shadow-md"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Input Fields */}
            <div className="space-y-6">
              <div>
                <label htmlFor="petals" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Number of Petals
                </label>
                <input
                  id="petals"
                  type="number"
                  value={petals}
                  onChange={(e) => setPetals(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter number of petals..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  min="1"
                />
              </div>

              <div>
                <label htmlFor="rarity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rarity of Petals
                </label>
                <select
                  id="rarity"
                  value={rarity}
                  onChange={(e) => setRarity(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Select rarity...</option>
                  <option value="Common">Common</option>
                  <option value="Unusual">Unusual</option>
                  <option value="Rare">Rare</option>
                  <option value="Epic">Epic</option>
                  <option value="Legendary">Legendary</option>
                  <option value="Mythic">Mythic</option>
                  <option value="Ultra">Ultra</option>
                </select>
              </div>

              <button
                onClick={handleCalculate}
                className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 font-medium"
              >
                Calculate Expected Successes
              </button>
            </div>

            {/* Result */}
            {expectedSuccesses !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-700 rounded-lg"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Expected Successes
                </h3>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {expectedSuccesses.toFixed(2)}
                </div>
              </motion.div>
            )}

            {/* Formula Explanation */}
            <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                How it works:
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                This calculator uses the formula: <strong>Expected Successes = (N × p) ÷ (2.5 + 2.5p)</strong> 
                where N is the number of petals and p is the success percentage (as a decimal). 
                This helps you estimate how many successful crafts you can expect from your petals.
              </p>
            </div>

          </div>
        </div>
      </div>
    </motion.div>
  );
} 