import { NextResponse } from 'next/server';

type BitcoinMarket = {
  usd: number;
  usd_24h_change: number;
  usd_market_cap: number;
  last_updated_at: number;
  /** Price ~24h ago inferred from change %, when available */
  usd_yesterday?: number | null;
};

async function fetchFromCoinGecko(apiKey?: string): Promise<BitcoinMarket | null> {
  const params = new URLSearchParams({
    ids: 'bitcoin',
    vs_currencies: 'usd',
    include_24hr_change: 'true',
    include_market_cap: 'true',
    include_last_updated_at: 'true',
  });

  const headers: HeadersInit = {
    Accept: 'application/json',
    'User-Agent': 'satsofbitcoin/1.0',
  };

  if (apiKey) {
    headers['x-cg-demo-api-key'] = apiKey;
    params.set('x-cg-demo-api-key', apiKey);
  }

  const apiUrl = `https://api.coingecko.com/api/v3/simple/price?${params.toString()}`;
  const response = await fetch(apiUrl, { headers, cache: 'no-store' });

  if (!response.ok) {
    console.error(`CoinGecko error: ${response.status} ${await response.text()}`);
    return null;
  }

  const data = await response.json();
  if (!data?.bitcoin?.usd) return null;

  const usd = data.bitcoin.usd as number;
  const change = (data.bitcoin.usd_24h_change as number) ?? 0;
  const usdYesterday =
    Number.isFinite(change) && change !== -100 ? usd / (1 + change / 100) : null;

  return {
    usd,
    usd_24h_change: change,
    usd_market_cap: data.bitcoin.usd_market_cap ?? 0,
    last_updated_at: data.bitcoin.last_updated_at ?? Math.floor(Date.now() / 1000),
    usd_yesterday: usdYesterday,
  };
}

async function fetchFromTwelveData(apiKey?: string): Promise<BitcoinMarket | null> {
  if (!apiKey) return null;

  // Current price
  const priceUrl = `https://api.twelvedata.com/price?symbol=BTC/USD&apikey=${apiKey}`;
  const priceRes = await fetch(priceUrl, { cache: 'no-store' });
  if (!priceRes.ok) {
    console.error(`Twelve Data BTC error: ${priceRes.status}`);
    return null;
  }
  const priceData = await priceRes.json();
  const usd = parseFloat(priceData.price);
  if (!usd || Number.isNaN(usd)) return null;

  // Try previous close via time series for vs-yesterday
  let usd_24h_change = 0;
  let usd_yesterday: number | null = null;
  try {
    const tsUrl = `https://api.twelvedata.com/time_series?symbol=BTC/USD&interval=1day&outputsize=2&apikey=${apiKey}`;
    const tsRes = await fetch(tsUrl, { cache: 'no-store' });
    if (tsRes.ok) {
      const ts = await tsRes.json();
      const values = Array.isArray(ts?.values) ? ts.values : [];
      // values[0] is latest day, values[1] previous
      const prevClose = values[1] ? parseFloat(values[1].close) : NaN;
      if (Number.isFinite(prevClose) && prevClose > 0) {
        usd_yesterday = prevClose;
        usd_24h_change = ((usd - prevClose) / prevClose) * 100;
      }
    }
  } catch {
    // optional
  }

  return {
    usd,
    usd_24h_change,
    usd_market_cap: 0,
    last_updated_at: Math.floor(Date.now() / 1000),
    usd_yesterday,
  };
}

export async function GET() {
  try {
    const coinGeckoKey = process.env.COINGECKO_API_KEY;
    const twelveDataKey = process.env.TWELVEDATA_API_KEY;

    const fromCoinGecko = await fetchFromCoinGecko(coinGeckoKey);
    if (fromCoinGecko) {
      return NextResponse.json({ bitcoin: fromCoinGecko, source: 'coingecko' });
    }

    const fromTwelve = await fetchFromTwelveData(twelveDataKey);
    if (fromTwelve) {
      return NextResponse.json({ bitcoin: fromTwelve, source: 'twelvedata' });
    }

    return NextResponse.json(
      { error: 'Unable to fetch Bitcoin market data from providers.' },
      { status: 502 }
    );
  } catch (error) {
    console.error('API Route /api/market-data error:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
