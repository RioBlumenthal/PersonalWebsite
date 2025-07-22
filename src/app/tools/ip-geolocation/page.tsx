"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface GeolocationData {
  ip_address?: string;
  city?: string;
  city_geoname_id?: number;
  region?: string;
  region_iso_code?: string;
  region_geoname_id?: number;
  postal_code?: string;
  country?: string;
  country_code?: string;
  country_geoname_id?: number;
  country_is_eu?: boolean;
  continent?: string;
  continent_code?: string;
  continent_geoname_id?: number;
  longitude?: number;
  latitude?: number;
  security?: {
    is_vpn?: boolean;
  };
  timezone?: {
    name?: string;
    abbreviation?: string;
    gmt_offset?: number;
    current_time?: string;
    is_dst?: boolean;
  };
  flag?: {
    emoji?: string;
    unicode?: string;
    png?: string;
    svg?: string;
  };
  currency?: {
    currency_name?: string;
    currency_code?: string;
  };
  connection?: {
    autonomous_system_number?: number;
    autonomous_system_organization?: string;
    connection_type?: string | null;
    isp_name?: string | null;
    organization_name?: string | null;
  };
  error?: string;
}

export default function IPGeolocation() {
  const [geolocationData, setGeolocationData] = useState<GeolocationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGeolocationData = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch('/api/ip-geolocation');
        if (!response.ok) {
          throw new Error('Failed to fetch geolocation data');
        }

        const data = await response.json();
        
        // Check if the API returned an error
        if (data.error) {
          throw new Error(data.error);
        }
        
        setGeolocationData(data);
      } catch (err) {
        setError("Failed to load geolocation data. Please try again.");
        console.error("Error fetching geolocation data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGeolocationData();
  }, []);

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
            IP Geolocation
          </h1>
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">Loading geolocation data...</p>
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
          IP Geolocation
        </h1>

        {error && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          </div>
        )}

        {geolocationData && (
          <div className="max-w-4xl mx-auto">
            {/* IP Address Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700 mb-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-green-500 rounded-full flex items-center justify-center">
                  <div className="text-white text-xl">🌍</div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Your IP Address
                  </h2>
                  <p className="text-2xl font-mono text-blue-600 dark:text-blue-400">
                    {geolocationData.ip_address || 'Unknown'}
                  </p>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="mr-2">📍</span>
                  Location
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">City:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{geolocationData.city || 'Unknown'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Region:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{geolocationData.region || 'Unknown'} {geolocationData.region_iso_code ? `(${geolocationData.region_iso_code})` : ''}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Postal Code:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{geolocationData.postal_code || 'Unknown'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Country:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{geolocationData.country || 'Unknown'} {geolocationData.country_code ? `(${geolocationData.country_code})` : ''}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Continent:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{geolocationData.continent || 'Unknown'} {geolocationData.continent_code ? `(${geolocationData.continent_code})` : ''}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Coordinates:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{geolocationData.latitude && geolocationData.longitude ? `${geolocationData.latitude}, ${geolocationData.longitude}` : 'Unknown'}</p>
                  </div>
                  {geolocationData.flag?.emoji && (
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Flag:</span>
                      <p className="font-medium text-gray-900 dark:text-white text-2xl">{geolocationData.flag.emoji}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="mr-2">🕐</span>
                  Timezone
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Timezone:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{geolocationData.timezone?.name || 'Unknown'} {geolocationData.timezone?.abbreviation ? `(${geolocationData.timezone.abbreviation})` : ''}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">GMT Offset:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{geolocationData.timezone?.gmt_offset !== undefined ? `${geolocationData.timezone.gmt_offset} hours` : 'Unknown'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Current Time:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{geolocationData.timezone?.current_time || 'Unknown'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Daylight Saving:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{geolocationData.timezone?.is_dst ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Network Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="mr-2">💰</span>
                  Currency
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Currency Name:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{geolocationData.currency?.currency_name || 'Unknown'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Currency Code:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{geolocationData.currency?.currency_code || 'Unknown'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="mr-2">🔒</span>
                  Security
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">VPN:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${geolocationData.security?.is_vpn ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'}`}>
                      {geolocationData.security?.is_vpn ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Connection Information */}
            <div className="grid grid-cols-1 gap-6 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="mr-2">🌐</span>
                  Connection
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">ISP:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{geolocationData.connection?.isp_name || 'Unknown'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Connection Type:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{geolocationData.connection?.connection_type || 'Unknown'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Organization:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{geolocationData.connection?.organization_name || 'Unknown'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">AS Number:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{geolocationData.connection?.autonomous_system_number || 'Unknown'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">AS Organization:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{geolocationData.connection?.autonomous_system_organization || 'Unknown'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
} 