import { NextResponse } from 'next/server';

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_market_cap=true';

export async function GET() {
  try {
    const response = await fetch(COINGECKO_API_URL);
    
    if (!response.ok) {
      throw new Error(`CoinGecko API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json({ bitcoin: data.bitcoin });

  } catch (error) {
    console.error('Error fetching market data in API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market data' }, 
      { status: 500 }
    );
  }
}