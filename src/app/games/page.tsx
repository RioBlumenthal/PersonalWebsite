"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function Games() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen py-8 px-4"
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          Games
        </h1>
        
        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Wordle Unlimited Card */}
          <Link href="/games/wordleunlimited" className="group">
            <div className="card card--interactive">
              <div className="flex items-start space-x-4">
                <div className="card-icon">
                    <div className="grid grid-cols-5 gap-0.5">
                      {Array(5).fill(null).map((_, i) => (
                        <div key={i} className="w-3 h-3 border border-gray-300 flex items-center justify-center text-xs font-bold bg-green-500 text-white">
                          W
                        </div>
                      ))}
                      {Array(5).fill(null).map((_, i) => (
                        <div key={i + 5} className="w-3 h-3 border border-gray-300 flex items-center justify-center text-xs font-bold bg-yellow-500 text-white">
                          O
                        </div>
                      ))}
                      {Array(5).fill(null).map((_, i) => (
                        <div key={i + 10} className="w-3 h-3 border border-gray-300 flex items-center justify-center text-xs font-bold">
                          R
                        </div>
                      ))}
                    </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-[#89cff0] dark:group-hover:text-[#0077b6] transition-colors">
                    Wordle Unlimited
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Play unlimited games of Wordle with AI-powered hints and custom feedback.
                  </p>
                  
                </div>
              </div>
            </div>
          </Link>

          {/* MTG Guesser Card */}
          <Link href="/games/mtgguesser" className="group">
            <div className="card card--interactive">
              <div className="flex items-start space-x-4">
                <div className="card-icon">
                    <Image
                      src="/tools/mtgguesser/Magic_card_back.webp"
                      alt="MTG Card Back"
                      width={48}
                      height={64}
                      className="object-cover rounded"
                    />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-[#89cff0] dark:group-hover:text-[#0077b6] transition-colors">
                    MTG Guesser
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Guess Magic: The Gathering cards based on progressively revealed information.
                  </p>
                </div>
              </div>
            </div>
          </Link>

          {/* Eyeball (Three.js) Card */}
          <Link href="/games/eyeball" className="group">
            <div className="card card--interactive">
              <div className="flex items-start space-x-4">
                <div className="card-icon">
                  <Image
                    src="/tools/eyeball.png"
                    alt="Eyeball preview"
                    width={48}
                    height={48}
                    className="object-cover rounded"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-[#89cff0] dark:group-hover:text-[#0077b6] transition-colors">
                    Eyeball
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Experiments with Three.js (it&apos;s an eyeball that follows your mouse).
                  </p>
                </div>
              </div>
            </div>
          </Link>

          {/* Tango Card */}
          <Link href="/games/tango" className="group">
            <div className="card card--interactive">
              <div className="flex items-start space-x-4">
                <div className="card-icon">
                    <div className="grid grid-cols-3 gap-1">
                      {Array(9).fill(null).map((_, i) => (
                        <div key={i} className={`w-4 h-4 border border-gray-300 flex items-center justify-center text-xs font-bold ${
                          i % 4 === 0 ? 'bg-red-100 text-red-700' : 
                          i % 3 === 1 ? 'bg-blue-100 text-blue-700' : 
                          'bg-gray-100'
                        }`}>
                          {i % 4 === 0 ? '0' : i % 3 === 1 ? '1' : ''}
                        </div>
                      ))}
                    </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-[#89cff0] dark:group-hover:text-[#0077b6] transition-colors">
                    Tango
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Fill the 6x6 grid with 0s and 1s following Tango rules.
                  </p>
                </div>
              </div>
            </div>
          </Link>

          {/* States Map Card */}
          <Link href="/games/statesmap" className="group">
            <div className="card card--interactive">
              <div className="flex items-start space-x-4">
                <div className="card-icon">
                  <Image
                    src="/tools/US_States.webp"
                    alt="US states map preview"
                    width={48}
                    height={48}
                    className="object-cover rounded"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-[#89cff0] dark:group-hover:text-[#0077b6] transition-colors">
                    States Map
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Click states on the US map to track where you&apos;ve been.
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
