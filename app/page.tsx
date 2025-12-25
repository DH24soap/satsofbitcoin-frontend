'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Head from 'next/head';

export default function Home() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [marketData, setMarketData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // We will replace this with our backend URL later
  const BACKEND_URL = 'https://your-backend-url.onrender.com';

  useEffect(() => {
    // Fetch market data on component mount
    axios.get(`${BACKEND_URL}/api/market-data`)
      .then(response => {
        setMarketData(response.data.bitcoin);
      })
      .catch(error => {
        console.error('Error fetching market data:', error);
        // For now, we'll show a placeholder so the site doesn't look broken
        setMarketData({ usd: 'Loading...', usd_24h_change: 0, usd_market_cap: 0, last_updated_at: Date.now() / 1000 });
      });
  }, []);

  const handleAsk = async () => {
    if (!question.trim()) return;
    setIsLoading(true);
    setAnswer('');
    try {
      const response = await axios.post(`${BACKEND_URL}/api/ask`, { prompt: question });
      setAnswer(response.data.answer);
    } catch (error) {
      console.error('Error asking question:', error);
      setAnswer('The backend is not connected yet. We will build this in the next phase.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <Head>
        <title>Satoshi Oracle</title>
        <meta name="description" content="Ask the Satoshi Oracle anything about Bitcoin." />
      </Head>

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
                <p className="text-xl font-bold">${marketData.usd.toLocaleString()}</p>
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
            rows="4"
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
      </main>
    </div>
  );
}