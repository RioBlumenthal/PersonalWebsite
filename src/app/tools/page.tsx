"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Tools() {
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
    </motion.div>
  );
} 