import { NextResponse } from 'next/server';

function parseNumber(value: unknown): number | null {
  const n = typeof value === 'number' ? value : parseFloat(String(value ?? ''));
  return Number.isFinite(n) && n > 0 ? n : null;
}

async function fetchTwelvePrice(symbol: string, apiKey: string): Promise<number | null> {
  try {
    const url = `https://api.twelvedata.com/price?symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`;
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) return null;

    const data = await response.json();
    if (data.status === 'error') {
      console.error(`Twelve Data error for ${symbol}:`, data.message ?? data);
      return null;
    }

    return parseNumber(data.price);
  } catch (error) {
    console.error(`Twelve Data fetch failed for ${symbol}:`, error);
    return null;
  }
}

async function fetchSilverFromFcs(apiKey?: string): Promise<number | null> {
  if (!apiKey) return null;

  try {
    const fcsUrl = `https://fcsapi.com/api-v3/forex/latest?symbol=XAG/USD&access_key=${apiKey}`;
    const fcsResponse = await fetch(fcsUrl, { cache: 'no-store' });
    if (!fcsResponse.ok) {
      console.error('FCSAPI HTTP error:', fcsResponse.status);
      return null;
    }

    const fcsData = await fcsResponse.json();
    console.error('FCSAPI silver raw:', JSON.stringify(fcsData).slice(0, 500));

    if (fcsData.status === true && Array.isArray(fcsData.response) && fcsData.response.length > 0) {
      const row = fcsData.response[0];
      return parseNumber(row.c ?? row.close ?? row.price ?? row.o);
    }

    if (fcsData.response && typeof fcsData.response === 'object' && !Array.isArray(fcsData.response)) {
      const row = fcsData.response['XAG/USD'] ?? Object.values(fcsData.response)[0];
      if (row && typeof row === 'object') {
        const r = row as Record<string, unknown>;
        return parseNumber(r.c ?? r.close ?? r.price ?? r.o);
      }
    }

    return null;
  } catch (error) {
    console.error('FCSAPI silver fetch failed:', error);
    return null;
  }
}

/** Free public gold/silver feed used by many sites (no API key). */
async function fetchSilverFromGoldPriceOrg(): Promise<number | null> {
  try {
    const response = await fetch('https://data-asg.goldprice.org/dbXRates/USD', {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; satsofbitcoin/1.0)',
      },
    });
    if (!response.ok) {
      console.error('goldprice.org HTTP error:', response.status);
      return null;
    }

    const data = await response.json();
    const item = Array.isArray(data?.items) ? data.items[0] : null;
    return parseNumber(item?.xagPrice);
  } catch (error) {
    console.error('goldprice.org silver fetch failed:', error);
    return null;
  }
}

/** Free fallback via Yahoo chart API. */
async function fetchSilverFromYahoo(): Promise<number | null> {
  const symbols = ['SI=F', 'XAGUSD=X', 'SLV'];

  for (const symbol of symbols) {
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`;
      const response = await fetch(url, {
        cache: 'no-store',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          Accept: 'application/json',
        },
      });
      if (!response.ok) {
        console.error(`Yahoo HTTP error for ${symbol}:`, response.status);
        continue;
      }

      const data = await response.json();
      const meta = data?.chart?.result?.[0]?.meta;
      const quote = data?.chart?.result?.[0]?.indicators?.quote?.[0];
      const closes: unknown[] = Array.isArray(quote?.close) ? quote.close : [];
      const lastClose = [...closes].reverse().find((v) => parseNumber(v) !== null);

      const price =
        parseNumber(meta?.regularMarketPrice) ??
        parseNumber(meta?.previousClose) ??
        parseNumber(lastClose);

      if (price !== null) return price;
    } catch (error) {
      console.error(`Yahoo silver fetch failed for ${symbol}:`, error);
    }
  }

  return null;
}

/** Stooq free CSV quote. */
async function fetchSilverFromStooq(): Promise<number | null> {
  try {
    const response = await fetch('https://stooq.com/q/l/?s=xagusd&f=sd2t2ohlcv&h&e=csv', {
      cache: 'no-store',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; satsofbitcoin/1.0)' },
    });
    if (!response.ok) return null;

    const text = await response.text();
    // CSV: Symbol,Date,Time,Open,High,Low,Close,Volume
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return null;
    const cols = lines[1].split(',');
    // Close is typically index 6
    return parseNumber(cols[6] ?? cols[3]);
  } catch (error) {
    console.error('Stooq silver fetch failed:', error);
    return null;
  }
}

async function fetchSilverPrice(twelveDataKey: string, fcsApiKey?: string): Promise<number | null> {
  for (const symbol of ['XAG/USD', 'XAGUSD', 'SILVER']) {
    const price = await fetchTwelvePrice(symbol, twelveDataKey);
    if (price !== null) return price;
  }

  const fromFcs = await fetchSilverFromFcs(fcsApiKey);
  if (fromFcs !== null) return fromFcs;

  const fromGoldPrice = await fetchSilverFromGoldPriceOrg();
  if (fromGoldPrice !== null) return fromGoldPrice;

  const fromYahoo = await fetchSilverFromYahoo();
  if (fromYahoo !== null) return fromYahoo;

  return fetchSilverFromStooq();
}

export async function GET() {
  try {
    const twelveDataKey = process.env.TWELVEDATA_API_KEY;
    const fcsApiKey = process.env.FCSAPI_API_KEY;

    if (!twelveDataKey) {
      return NextResponse.json(
        { error: 'TWELVEDATA_API_KEY is not configured on the server.' },
        { status: 500 }
      );
    }

    const [btcPrice, goldPrice, silverPrice] = await Promise.all([
      fetchTwelvePrice('BTC/USD', twelveDataKey),
      fetchTwelvePrice('XAU/USD', twelveDataKey),
      fetchSilverPrice(twelveDataKey, fcsApiKey),
    ]);

    if (btcPrice === null) {
      return NextResponse.json(
        { error: 'Failed to fetch Bitcoin price.' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      bitcoin: { usd: btcPrice },
      gold: { price_per_ounce_usd: goldPrice },
      silver: { price_per_ounce_usd: silverPrice },
    });
  } catch (error) {
    console.error('Error in /api/asset-prices:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred while fetching asset prices.' },
      { status: 500 }
    );
  }
}
