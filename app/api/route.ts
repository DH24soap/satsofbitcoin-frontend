import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Using the demo API key for testing. Replace with your env var later.
    const apiKey = process.env.COINGECKO_API_KEY; 
    const apiUrl = `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&x_cg_demo_api_key=${apiKey}`;

    console.log('Fetching market data from CoinGecko...'); // This will appear in Vercel logs

    const response = await fetch(apiUrl);

    if (!response.ok) {
      console.error(`CoinGecko API Error: ${response.status} ${response.statusText}`);
      throw new Error(`CoinGecko API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Successfully fetched data:', data); // This will also appear in Vercel logs
    
    return NextResponse.json({ bitcoin: data.bitcoin });

  } catch (error) {
    console.error('Failed to fetch market data in /api/market-data/route.ts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market data from CoinGecko' }, 
      { status: 500 }
    );
  }
}