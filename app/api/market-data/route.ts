import { NextResponse } from 'next/server';

export async function GET() {
  console.log('API ROUTE /api/market-data WAS CALLED!'); // This log is CRITICAL for debugging

  try {
    // We will use the public demo key first to rule out environment variable issues.
    const DEMO_API_KEY = 'CG-xV4Qa4hV4Qa4hV4Qa4hV4Qa4hV4Qa4hV4Qa'; // Replace with a real demo key from CoinGecko if this one is invalid
    const apiUrl = `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&x_cg_demo_api_key=${DEMO_API_KEY}`;

    console.log('Fetching from CoinGecko...');

    const response = await fetch(apiUrl);

    if (!response.ok) {
      console.error(`CoinGecko API Error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: `CoinGecko API Error: ${response.status}` }, 
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log('Success! Data from CoinGecko:', data);
    
    return NextResponse.json({ bitcoin: data.bitcoin });

  } catch (error) {
    console.error('API Route CATCH block error:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred.' }, 
      { status: 500 }
    );
  }
}