// app/components/AssetCalculator.tsx
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

// Define the structure of the data we expect from the API
interface AssetPrices {
  bitcoin: { usd: number };
  gold: { price_per_ounce_usd: number | null };
  silver: { price_per_ounce_usd: number | null }; // Allow null for prices
}

export default function AssetCalculator() {
  const [prices, setPrices] = useState<AssetPrices | null>(null);
  const [usdInput, setUsdInput] = useState<string>('');
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const BACKEND_URL = 'https://satsofbitcoin-backend.onrender.com';

  // Fetch prices when the component mounts
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
      gold: {
        // Check if gold price is available before calculating
        ...(goldPricePerOz && {
          ounces: price / goldPricePerOz,
          grams: (price / goldPricePerOz) * OUNCES_IN_GRAM,
        }),
      },
      silver: {
        // Check if silver price is available before calculating
        ...(silverPricePerOz && {
          ounces: price / silverPricePerOz,
          grams: (price / silverPricePerOz) * OUNCES_IN_GRAM,
        }),
      },
    };

    setResults(newResults);
  };

  // Helper function to render results safely
  const renderAssetValue = (asset: any, assetName: string) => {
    if (!asset) {
      return <span className="text-red-500">Price data unavailable for {assetName}</span>;
    }
    return (
      <>
        <span>{asset.ounces.toFixed(4)} oz / {asset.grams.toFixed(2)} g</span>
      </>
    );
  };

  return (
    <div className="p-6 border rounded-lg shadow-lg bg-white max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Asset Price Calculator</h2>
      
      {isLoading && <p className="text-center text-gray-500">Loading current market prices...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!isLoading && !error && (
        <>
          <div className="flex gap-3 mb-6">
            <div className="relative flex-grow">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={usdInput}
                onChange={(e) => setUsdInput(e.target.value)}
                placeholder="Enter USD price"
                className="w-full p-3 pl-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleCalculate}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
            >
              Calculate
            </button>
          </div>

          {results && (
            <div className="space-y-4 text-sm bg-gray-50 p-4 rounded-md">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">Bitcoin (BTC):</span>
                <span>{results.bitcoin.btc.toFixed(6)} BTC</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">Bitcoin (Sats):</span>
                <span>{results.bitcoin.sats.toLocaleString()} sats</span>
              </div>
              <hr className="my-2"/>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">Gold:</span>
                {renderAssetValue(results.gold, 'Gold')}
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">Silver:</span>
                {renderAssetValue(results.silver, 'Silver')}
              </div>
            </div>
          )}

          <div className="mt-4 text-xs text-center text-gray-400">
            Prices provided by Twelve Data. Not financial advice. Silver data may be unavailable on free plans.
          </div>
        </>
      )}
    </div>
  );
}