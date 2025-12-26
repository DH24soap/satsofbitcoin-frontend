'use client';

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

  const BACKEND_URL = 'https://satsofbitcoin-backend.onrender.com';

 useEffect(() => {
  // Use a flag to prevent state updates if the component unmounts
  let isMounted = true;

  const fetchData = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/market-data`);
      // Only update state if the component is still mounted
      if (isMounted && response.data && response.data.bitcoin) {
        setMarketData(response.data.bitcoin);
      }
    } catch (error) {
      console.error('Error fetching market data:', error);
      // Only update state if the component is still mounted
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


 const handleAsk = async () => {
  if (!question.trim()) return;
  setIsLoading(true);
  setAnswer('');
  try {
    const response = await axios.post(`${BACKEND_URL}/api/ask`, { prompt: question });
    // Check if the response contains the answer before setting it
    if (response.data && response.data.answer) {
      setAnswer(response.data.answer);
    } else {
      setAnswer('Received an unexpected response from the server.');
    }
  } catch (error) {
    console.error('Error asking question:', error);
    // Provide a more specific error message
    if (error.response) {
      // The server responded with a status code outside the 2xx range
      setAnswer(`Server error: ${error.response.status}`);
    } else if (error.request) {
      // The request was made but no response was received
      setAnswer('Could not connect to the server. Please check your connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      setAnswer('An unexpected error occurred. Please try again.');
    }
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <head>
        <title>Satoshi Oracle</title>
        <meta name="description" content="Ask the Satoshi Oracle anything about Bitcoin." />
      </head>

      <main className="w-full max-w-2xl">
        <h1 className="text-5xl font-bold text-center mb-2 text-orange-500">Satoshi Oracle</h1>
        <p className="text-center text-gray-400 mb-8">Ask questions about Bitcoin, economics, and technology.</p>

        {/* Market Data Dashboard */}
        {marketData && (
          <div className="bg-gray-800 p-6 rounded-lg mb-8 shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Market Data</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Price (USD)</p>
                <p className="text-xl font-bold">
                  ${typeof marketData.usd === 'number' ? marketData.usd.toLocaleString() : marketData.usd}
                </p>
              </div>
              <div>
                <p className="text-gray-400">24h Change</p>
                <p className={`text-xl font-bold ${marketData.usd_24h_change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {marketData.usd_24h_change.toFixed(2)}%
                </p>
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
          <textarea
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            rows={4}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What is the halving?"
          />
          <button
            onClick={handleAsk}
            disabled={isLoading}
            className="mt-4 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 disabled:bg-gray-600"
          >
            {isLoading ? 'Thinking...' : 'Ask the Oracle'}
          </button>

          {answer && (
            <div className="mt-6 p-4 bg-gray-700 rounded-md">
              <p className="whitespace-pre-wrap">{answer}</p>
            </div>
          )}
        </div>
             {/* CoinGecko Credit */}
        <p className="text-center text-gray-400 mt-8">
          Market data provided by{' '}
          <a href="https://www.coingecko.com" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">
            CoinGecko
          </a>
        </p>
      </main>
    </div>
  );
}{/* CoinGecko Attribution */}
<p className="text-center text-gray-500 text-sm mt-8">
  Data provided by{' '}
  <a 
    href="https://www.coingecko.com" 
    target="_blank" 
    rel="noopener noreferrer" 
    className="text-orange-500 hover:underline"
  >
    CoinGecko
  </a>
</p>
 </main>
    </div>
  );
}