import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.COINGECKO_API_KEY;

  try {
    const params = new URLSearchParams({
      ids: 'bitcoin',
      vs_currencies: 'usd',
      include_24hr_change: 'true',
      include_market_cap: 'true',
      include_last_updated_at: 'true',
    });

    if (apiKey) {
      params.set('x-cg-demo-api-key', apiKey);
    }

    const apiUrl = `https://api.coingecko.com/api/v3/simple/price?${params.toString()}`;
    const response = await fetch(apiUrl, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      console.error(`CoinGecko API Error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: `CoinGecko API Error: ${response.status}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    return NextResponse.json({ bitcoin: data.bitcoin });
  } catch (error) {
    console.error('API Route /api/market-data error:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
