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
        
        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Wordle Unlimited Card */}
          <Link href="/tools/wordleunlimited" className="group">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-200 cursor-pointer h-full">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 w-20 h-20 flex items-center justify-center">
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
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-[#89cff0] dark:group-hover:text-[#0077b6] transition-colors">
                    Wordle Unlimited
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Play unlimited games of Wordle with AI-powered hints and custom feedback.
                  </p>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <span>Unlimited games • AI hints • Responsive</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* MTG Guesser Card */}
          <Link href="/tools/mtgguesser" className="group">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-200 cursor-pointer h-full">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 w-20 h-20 flex items-center justify-center">
                    <img
                      src="/tools/mtgguesser/Magic_card_back.webp"
                      alt="MTG Card Back"
                      className="w-12 h-16 object-cover rounded"
                      loading="lazy"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-[#89cff0] dark:group-hover:text-[#0077b6] transition-colors">
                    MTG Guesser
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Guess Magic: The Gathering cards based on progressively revealed information.
                  </p>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <span>Progressive hints • Card database • Multiple formats</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Florr.io Crafting Calculator Card */}
          <Link href="/tools/florrio-calculator" className="group">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-200 cursor-pointer h-full">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 w-20 h-20 flex items-center justify-center">
                    <img
                      src="/tools/FlorrCrafting.png"
                      alt="Florr.io Crafting"
                      className="w-12 h-12 object-contain"
                      loading="lazy"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-[#89cff0] dark:group-hover:text-[#0077b6] transition-colors">
                    Florr.io Crafting Calculator
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Calculate crafting recipes and optimize your Florr.io gameplay with detailed ingredient tracking.
                  </p>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <span>Crafting recipes • Ingredient tracking • Game optimization</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* IP Geolocation Card */}
          <Link href="/tools/ip-geolocation" className="group">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-200 cursor-pointer h-full">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 w-20 h-20 flex items-center justify-center">
                    <div className="relative">
                      {/* Globe icon */}
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-green-500 rounded-full flex items-center justify-center">
                        <div className="text-white text-lg">🌍</div>
                      </div>
                      {/* Location pin */}
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">📍</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-[#89cff0] dark:group-hover:text-[#0077b6] transition-colors">
                    IP Geolocation
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    View detailed information about your IP address including location, ISP, and network details.
                  </p>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <span>Real-time data • Location details • Network info</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* QR Code Generator Card */}
          <Link href="/tools/qrgenerator" className="group">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-200 cursor-pointer h-full">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 w-20 h-20 flex items-center justify-center">
                    <div className="grid grid-cols-8 gap-0.5">
                      {Array(64).fill(null).map((_, i) => (
                        <div 
                          key={i} 
                          className={`w-1.5 h-1.5 ${
                            i % 9 === 0 || i % 9 === 8 || Math.floor(i / 8) === 0 || Math.floor(i / 8) === 7
                              ? 'bg-black'
                              : (i % 3 === 0 && i % 5 === 0) || (i % 7 === 0)
                              ? 'bg-black'
                              : 'bg-white'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-[#89cff0] dark:group-hover:text-[#0077b6] transition-colors">
                    QR Code Generator
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Generate QR codes for any text, URL, or contact information instantly.
                  </p>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <span>Instant generation • PNG download • Dark mode</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </motion.div>
  );
} 