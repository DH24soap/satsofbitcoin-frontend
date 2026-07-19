import { NextResponse } from 'next/server';

type BitcoinMarket = {
  usd: number;
  usd_24h_change: number;
  usd_market_cap: number;
  last_updated_at: number;
};

async function fetchFromCoinGecko(apiKey?: string): Promise<BitcoinMarket | null> {
  const params = new URLSearchParams({
    ids: 'bitcoin',
    vs_currencies: 'usd',
    include_24hr_change: 'true',
    include_market_cap: 'true',
    include_last_updated_at: 'true',
  });

  // Prefer demo key header when present; also support query param fallback.
  const headers: HeadersInit = {
    Accept: 'application/json',
    'User-Agent': 'satsofbitcoin/1.0',
  };

  let apiUrl = `https://api.coingecko.com/api/v3/simple/price?${params.toString()}`;

  if (apiKey) {
    headers['x-cg-demo-api-key'] = apiKey;
    params.set('x-cg-demo-api-key', apiKey);
    apiUrl = `https://api.coingecko.com/api/v3/simple/price?${params.toString()}`;
  }

  const response = await fetch(apiUrl, {
    headers,
    cache: 'no-store',
  });

  if (!response.ok) {
    console.error(`CoinGecko error: ${response.status} ${await response.text()}`);
    return null;
  }

  const data = await response.json();
  if (!data?.bitcoin?.usd) return null;

  return {
    usd: data.bitcoin.usd,
    usd_24h_change: data.bitcoin.usd_24h_change ?? 0,
    usd_market_cap: data.bitcoin.usd_market_cap ?? 0,
    last_updated_at: data.bitcoin.last_updated_at ?? Math.floor(Date.now() / 1000),
  };
}

async function fetchFromTwelveData(apiKey?: string): Promise<BitcoinMarket | null> {
  if (!apiKey) return null;

  const url = `https://api.twelvedata.com/price?symbol=BTC/USD&apikey=${apiKey}`;
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    console.error(`Twelve Data BTC error: ${response.status}`);
    return null;
  }

  const data = await response.json();
  const usd = parseFloat(data.price);
  if (!usd || Number.isNaN(usd)) return null;

  return {
    usd,
    usd_24h_change: 0,
    usd_market_cap: 0,
    last_updated_at: Math.floor(Date.now() / 1000),
  };
}

export async function GET() {
  try {
    const coinGeckoKey = process.env.COINGECKO_API_KEY;
    const twelveDataKey = process.env.TWELVEDATA_API_KEY;

    const fromCoinGecko = await fetchFromCoinGecko(coinGeckoKey);
    if (fromCoinGecko) {
      return NextResponse.json({ bitcoin: fromCoinGecko });
    }

    // Fallback: CoinGecko often rate-limits / blocks datacenter IPs (Cloudflare Workers).
    const fromTwelve = await fetchFromTwelveData(twelveDataKey);
    if (fromTwelve) {
      return NextResponse.json({ bitcoin: fromTwelve });
    }

    return NextResponse.json(
      { error: 'Unable to fetch Bitcoin market data from providers.' },
      { status: 502 }
    );
  } catch (error) {
    console.error('API Route /api/market-data error:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
