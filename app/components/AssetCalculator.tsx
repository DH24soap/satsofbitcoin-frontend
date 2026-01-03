// app/components/AssetCalculator.tsx
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

// Define the structure of the data we expect from the API
interface AssetPrices {
  bitcoin: { usd: number };
  gold: { price_per_ounce_usd: number | null };
  silver: { price_per_ounce_usd: number | null };
}

export default function AssetCalculator() {
  const [prices, setPrices] = useState<AssetPrices | null>(null);
  const [usdInput, setUsdInput] = useState<string>('');
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const BACKEND_URL = 'https://satsofbitcoin-backend.onrender.com';

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await axios.get<AssetPrices>(`${BACKEND_URL}/api/asset-prices`);
        setPrices(response.data);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch asset prices:', err);
        setError('Could not load live prices. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPrices();
  }, []);

  const handleCalculate = () => {
    if (!prices || !usdInput || isNaN(Number(usdInput))) {
      return;
    }

    const price = Number(usdInput);
    const btcPrice = prices.bitcoin.usd;
    const goldPricePerOz = prices.gold.price_per_ounce_usd;
    const silverPricePerOz = prices.silver.price_per_ounce_usd;
    const OUNCES_IN_GRAM = 31.1035;

    const newResults = {
      bitcoin: {
        btc: price / btcPrice,
        sats: (price / btcPrice) * 100000000,
      },
      gold: (goldPricePerOz && goldPricePerOz > 0) ? {
        ounces: price / goldPricePerOz,
        grams: (price / goldPricePerOz) * OUNCES_IN_GRAM,
      } : null,
      silver: (silverPricePerOz && silverPricePerOz > 0) ? {
        ounces: price / silverPricePerOz,
        grams: (price / silverPricePerOz) * OUNCES_IN_GRAM,
      } : null,
    };

    setResults(newResults);
  };

  return (
    // --- UPDATED: Changed to dark theme to match the site ---
    <div className="p-6 border rounded-lg shadow-lg bg-gray-800 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-400">Asset Price Calculator</h2>
      
      {isLoading && <p className="text-center text-gray-400">Loading current market prices...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!isLoading && !error && (
        <>
          <div className="flex gap-3 mb-6">
            <div className="relative flex-grow">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                value={usdInput}
                onChange={(e) => setUsdInput(e.target.value)}
                placeholder="Enter USD price"
                // --- UPDATED: Dark theme input styles ---
                className="w-full p-3 pl-8 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleCalculate}
              // --- UPDATED: Changed button color to blue to stand out ---
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
            >
              Calculate
            </button>
          </div>

          {results && (
            // --- UPDATED: Dark theme results box ---
            <div className="space-y-4 text-sm bg-gray-700 p-4 rounded-md">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-300">Bitcoin (BTC):</span>
                <span>{results.bitcoin.btc.toFixed(6)} BTC</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-300">Bitcoin (Sats):</span>
                <span>{results.bitcoin.sats.toLocaleString()} sats</span>
              </div>
              <hr className="my-2 border-gray-600"/>
              
              <div className="flex justify-between">
                <span className="font-semibold text-gray-300">Gold:</span>
                {results.gold ? (
                  <span>{results.gold.ounces.toFixed(4)} oz / {results.gold.grams.toFixed(2)} g</span>
                ) : (
                  <span className="text-red-400">Price data unavailable for Gold</span>
                )}
              </div>

              <div className="flex justify-between">
                <span className="font-semibold text-gray-300">Silver:</span>
                {results.silver ? (
                  <span>{results.silver.ounces.toFixed(4)} oz / {results.silver.grams.toFixed(2)} g</span>
                ) : (
                  <span className="text-red-400">Price data unavailable for Silver</span>
                )}
              </div>
            </div>
          )}

          <div className="mt-4 text-xs text-center text-gray-500">
            Prices provided by Twelve Data. Not financial advice. Silver data may be unavailable on free plans.
          </div>
        </>
      )}
    </div>
  );
}