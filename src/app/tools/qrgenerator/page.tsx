"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import QRCode from "qrcode";

export default function QRGenerator() {
  const [text, setText] = useState("");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const generateQRCode = async () => {
    if (!text.trim()) {
      setError("Please enter some text or a URL");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const dataUrl = await QRCode.toDataURL(text, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF"
        }
      });
      setQrCodeDataUrl(dataUrl);
    } catch (err) {
      setError("Failed to generate QR code. Please try again.");
      console.error("QR Code generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeDataUrl) return;

    const link = document.createElement("a");
    link.download = "qrcode.png";
    link.href = qrCodeDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearQRCode = () => {
    setQrCodeDataUrl("");
    setText("");
    setError("");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen py-8 px-4"
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          QR Code Generator
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Generate QR Code
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="qr-text" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Enter text or URL
                  </label>
                  <textarea
                    id="qr-text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter any text, URL, or contact information..."
                    className="w-full h-32 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#89cff0] dark:focus:ring-[#0077b6] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={generateQRCode}
                    disabled={isGenerating || !text.trim()}
                    className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                      isGenerating || !text.trim()
                        ? "bg-gray-400 text-gray-600 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400"
                        : "bg-[#89cff0] hover:bg-[#7bb8d9] text-[#171717] dark:bg-[#0077b6] dark:hover:bg-[#005a8a] dark:text-[#ededed]"
                    }`}
                  >
                    {isGenerating ? "Generating..." : "Generate QR Code"}
                  </button>
                  
                  {qrCodeDataUrl && (
                    <button
                      onClick={downloadQRCode}
                      className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors duration-200"
                    >
                      Download PNG
                    </button>
                  )}
                </div>

                {error && (
                  <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                    {error}
                  </div>
                )}

                {qrCodeDataUrl && (
                  <button
                    onClick={clearQRCode}
                    className="w-full px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors duration-200"
                  >
                    Clear & Start Over
                  </button>
                )}
              </div>
            </div>

            {/* QR Code Display */}
            <div className="flex flex-col items-center justify-center">
              {qrCodeDataUrl ? (
                <div className="text-center">
                  <div className="bg-white p-4 rounded-lg shadow-lg mb-4">
                    <img
                      src={qrCodeDataUrl}
                      alt="Generated QR Code"
                      className="w-64 h-64 mx-auto"
                    />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Scan this QR code with your phone&apos;s camera
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-64 h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                    <div className="text-center">
                      <svg className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z" />
                      </svg>
                      <p className="text-gray-500 dark:text-gray-400">
                        QR Code will appear here
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 