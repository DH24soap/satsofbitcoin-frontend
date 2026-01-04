'use client';

import DonationSection from './components/DonationSection';
import { useState, useEffect } from 'react';
import axios from 'axios';

// Define a type for our market data
type MarketData = {
  usd: number | string;
  usd_24h_change: number;
  usd_market_cap: number;
  last_updated_at: number;
} | null;

export default function Home() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [marketData, setMarketData] = useState<MarketData>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState('oracle'); // State for the selected mode

  const BACKEND_URL = 'https://satsofbitcoin-backend.onrender.com';

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        // Call the local API route on Vercel, not the backend directly.
        const response = await axios.get('/api/market-data');
        if (isMounted && response.data && response.data.bitcoin) {
          setMarketData(response.data.bitcoin);
        }
      } catch (error) {
        console.error('Error fetching market data:', error);
        if (isMounted) {
          setMarketData({
            usd: 'Error loading data',
            usd_24h_change: 0,
            usd_market_cap: 0,
            last_updated_at: Date.now() / 1000,
          });
        }
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  // The function to handle the API call
  const handleAsk = async () => {
    if (!question.trim()) return;
    setIsLoading(true);
    setAnswer('');
    try {
      // This is the CORRECT API call for asking a question
      const response = await axios.post(`${BACKEND_URL}/api/ask`, { prompt: question, mode: mode });

      if (response.data && response.data.answer) {
        setAnswer(response.data.answer);
      } else {
        setAnswer('Received an unexpected response from the server.');
      }
    } catch (error: any) {
      console.error('Error asking question:', error);
      if (error.response) {
        setAnswer(`Server error: ${error.response.status}`);
      } else if (error.request) {
        setAnswer('Could not connect to the server. Please check your connection.');
      } else {
        setAnswer('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
      setQuestion(''); // Clears the question box after response
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <head>
        <title>Satoshi Oracle</title>
        <meta name="description" content="Ask the Satoshi Oracle anything about Bitcoin." />
      </head>

      <main className="w-full max-w-2xl">
        {/* --- UPDATED NAVIGATION BAR --- */}
        <nav className="flex justify-center space-x-4 mb-6">
          <a href="/" className="px-4 py-2 bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600 transition-colors" > Oracle </a>
          <a href="/calculator" className="px-4 py-2 bg-gray-700 text-gray-300 font-semibold rounded-md hover:bg-gray-600 hover:text-white transition-colors" > Calculator </a>
        </nav>

        <h1 className="text-5xl font-bold text-center mb-2 text-orange-500">Satoshi Oracle</h1>
        <p className="text-center text-gray-400 mb-8">Ask questions about Bitcoin, economics, and technology.</p>

        {/* Market Data Dashboard */}
        {marketData && (
          <div className="bg-gray-800 p-6 rounded-lg mb-8 shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Market Data</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Price (USD)</p>
                <p className="text-xl font-bold"> ${typeof marketData.usd === 'number' ? marketData.usd.toLocaleString() : marketData.usd} </p>
              </div>
              <div>
                <p className="text-gray-400">24h Change</p>
                <p className={`text-xl font-bold ${marketData.usd_24h_change > 0 ? 'text-green-500' : 'text-red-500'}`}> {marketData.usd_24h_change.toFixed(2)}% </p>
              </div>
              <div>
                <p className="text-gray-400">Market Cap</p>
                <p className="text-xl font-bold">${(marketData.usd_market_cap / 1e9).toFixed(2)}B</p>
              </div>
              <div>
                <p className="text-gray-400">Last Updated</p>
                <p className="text-xl font-bold">{new Date(marketData.last_updated_at * 1000).toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Q&A Section */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          {/* --- MODE SELECTION UI --- */}
          <div className="flex justify-center mb-6 space-x-6">
            <label className="flex items-center text-gray-300 cursor-pointer">
              <input
                type="radio"
                name="mode"
                value="oracle"
                checked={mode === 'oracle'}
                onChange={(e) => setMode(e.target.value)}
                className="mr-2 text-orange-500 focus:ring-orange-500"
              />
              Oracle Mode
            </label>
            <label className="flex items-center text-orange-500 cursor-pointer">
              <input
                type="radio"
                name="mode"
                value="satoshi"
                checked={mode === 'satoshi'}
                onChange={(e) => setMode(e.target.value)}
                className="mr-2 text-orange-500 focus:ring-orange-500"
              />
              Satoshi Nakamoto's Perspective
            </label>
          </div>

          <textarea
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            rows={4}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What is the halving?"
            disabled={isLoading}
          />

          {/* --- UPDATED BUTTON AND LOADING MESSAGE --- */}
          <button
            onClick={handleAsk}
            disabled={isLoading}
            className="mt-4 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 disabled:bg-gray-600"
          >
            {isLoading ? (
              mode === 'satoshi' ? 'Consulting Satoshi...' : 'Thinking...'
            ) : (
              'Ask the Oracle'
            )}
          </button>

          {isLoading && mode === 'satoshi' && (
            <p className="text-center text-sm text-gray-400 mt-2 animate-pulse">
              Connecting to the original node... This may take a moment for a deeper response.
            </p>
          )}

          {answer && (
            <div className="mt-6 p-4 bg-gray-700 rounded-md">
              <p className="whitespace-pre-wrap">{answer}</p>
            </div>
          )}
        </div>

        {/* CoinGecko Attribution */}
        <p className="text-center text-gray-500 text-sm mt-8">
          Market data provided by{' '}
          <a href="https://www.coingecko.com" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">
            CoinGecko
          </a>
        </p>

        {/* Donation Section */}
        <DonationSection />
      </main>
    </div>
  );
}