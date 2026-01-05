import { NextResponse } from 'next/server';

export async function GET() {
  console.log('API ROUTE /api/market-data WAS CALLED!');
  const apiKey = process.env.COINGECKO_API_KEY;

  if (!apiKey) {
    console.error('CRITICAL: COINGECKO_API_KEY environment variable is not set!');
    return NextResponse.json(
      { error: 'Server configuration error: API key is missing.' },
      { status: 500 }
    );
  }

  try {
    // The parameter for the API key has changed. Use the new one with dashes.
    // --- FIX: Added include_last_updated_at=true to the URL ---
    const apiUrl = `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_last_updated_at=true&x-cg-demo-api-key=${apiKey}`;

    console.log(`Fetching from CoinGecko with URL: ${apiUrl}`);

    const response = await fetch(apiUrl);

    if (!response.ok) {
      console.error(`CoinGecko API Error: ${response.status} ${response.statusText}`);
      const errorBody = await response.text();
      console.error('Error response body:', errorBody);
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