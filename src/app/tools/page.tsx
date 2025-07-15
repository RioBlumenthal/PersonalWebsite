"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Tools() {
  const [selectedColor, setSelectedColor] = useState("#89cff0");
  const [colorName, setColorName] = useState("Baby Blue");

  const colors = [
    { name: "Baby Blue", hex: "#89cff0" },
    { name: "Ocean Blue", hex: "#0077b6" },
    { name: "Purple", hex: "#8b5cf6" },
    { name: "Green", hex: "#10b981" },
    { name: "Orange", hex: "#f59e0b" },
    { name: "Red", hex: "#ef4444" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen py-8 px-4"
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          Interactive Tools
        </h1>
        
        <div className="space-y-8">
          {/* Color Picker Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Color Picker
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Choose a Color
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {colors.map((color) => (
                    <button
                      key={color.hex}
                      onClick={() => {
                        setSelectedColor(color.hex);
                        setColorName(color.name);
                      }}
                      className={`w-16 h-16 rounded-lg border-2 transition-all duration-200 ${
                        selectedColor === color.hex
                          ? "border-gray-900 dark:border-white scale-110"
                          : "border-gray-300 dark:border-gray-600 hover:scale-105"
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Selected Color
                </h3>
                <div className="space-y-4">
                  <div
                    className="w-full h-24 rounded-lg border border-gray-300 dark:border-gray-600"
                    style={{ backgroundColor: selectedColor }}
                  />
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-medium">Name:</span> {colorName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-medium">Hex:</span> {selectedColor}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-medium">RGB:</span> {(() => {
                        const hex = selectedColor.replace('#', '');
                        const r = parseInt(hex.substr(0, 2), 16);
                        const g = parseInt(hex.substr(2, 2), 16);
                        const b = parseInt(hex.substr(4, 2), 16);
                        return `${r}, ${g}, ${b}`;
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                This is a simple interactive color picker. More tools coming soon!
              </p>
            </div>
          </div>

          {/* Wordle Unlimited Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Wordle Unlimited
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Classic Wordle Game
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Play unlimited games of Wordle with my custom implementation! 
                  Features include:
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2 mb-6">
                  <li>• Unlimited games with random words</li>
                  <li>• Custom feedback messages</li>
                  <li>• Color-coded keyboard hints</li>
                  <li>• Responsive design</li>
                </ul>
                <Link
                  href="/tools/wordleunlimited"
                  className="bg-[#89cff0] hover:bg-[#7bb8d9] text-[#171717] px-6 py-3 rounded-lg font-medium transition-colors duration-200 dark:bg-[#0077b6] dark:hover:bg-[#005a8a] dark:text-[#ededed] inline-flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Play Wordle Unlimited
                </Link>
              </div>
              
              <div className="flex items-center justify-center">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 w-full max-w-xs">
                  <div className="grid grid-cols-5 gap-1 mb-2">
                    {Array(5).fill(null).map((_, i) => (
                      <div key={i} className="w-8 h-8 border-2 border-gray-300 flex items-center justify-center text-sm font-bold bg-green-500 text-white">
                        W
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-5 gap-1 mb-2">
                    {Array(5).fill(null).map((_, i) => (
                      <div key={i} className="w-8 h-8 border-2 border-gray-300 flex items-center justify-center text-sm font-bold bg-yellow-500 text-white">
                        O
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    {Array(5).fill(null).map((_, i) => (
                      <div key={i} className="w-8 h-8 border-2 border-gray-300 flex items-center justify-center text-sm font-bold">
                        R
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 