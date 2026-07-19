import { NextResponse } from 'next/server';

async function fetchSilverFromFcs(apiKey?: string): Promise<number | null> {
  if (!apiKey) return null;

  try {
    const fcsUrl = `https://fcsapi.com/api-v3/forex/latest?symbol=XAG/USD&access_key=${apiKey}`;
    const fcsResponse = await fetch(fcsUrl, { cache: 'no-store' });
    if (!fcsResponse.ok) return null;

    const fcsData = await fcsResponse.json();

    // FCSAPI shapes vary by plan/version — handle a few common ones.
    if (fcsData.status === true && Array.isArray(fcsData.response) && fcsData.response.length > 0) {
      const row = fcsData.response[0];
      const price = parseFloat(row.c ?? row.close ?? row.price);
      return Number.isFinite(price) ? price : null;
    }

    if (fcsData.response && typeof fcsData.response === 'object' && !Array.isArray(fcsData.response)) {
      const row = fcsData.response['XAG/USD'] ?? fcsData.response;
      const price = parseFloat(row?.c ?? row?.close ?? row?.price);
      return Number.isFinite(price) ? price : null;
    }

    return null;
  } catch (error) {
    console.error('FCSAPI silver fetch failed:', error);
    return null;
  }
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

    // Prefer Twelve Data for BTC, gold, and silver (more reliable from Workers).
    const twelveDataSymbols = 'BTC/USD,XAU/USD,XAG/USD';
    const twelveDataUrl = `https://api.twelvedata.com/price?symbol=${twelveDataSymbols}&apikey=${twelveDataKey}`;
    const twelveResponse = await fetch(twelveDataUrl, { cache: 'no-store' });
    const twelveData = await twelveResponse.json();

    if (twelveData.status && twelveData.status === 'error') {
      console.error('Twelve Data API Error:', twelveData.message);
      return NextResponse.json(
        { error: 'Failed to fetch data from Twelve Data.' },
        { status: 500 }
      );
    }

    const btcPrice = parseFloat(twelveData['BTC/USD']?.price);
    const goldPrice = parseFloat(twelveData['XAU/USD']?.price);
    let silverPrice = parseFloat(twelveData['XAG/USD']?.price);

    if (!Number.isFinite(silverPrice)) {
      silverPrice = (await fetchSilverFromFcs(fcsApiKey)) ?? NaN;
    }

    const prices = {
      bitcoin: {
        usd: Number.isFinite(btcPrice) ? btcPrice : null,
      },
      gold: {
        price_per_ounce_usd: Number.isFinite(goldPrice) ? goldPrice : null,
      },
      silver: {
        price_per_ounce_usd: Number.isFinite(silverPrice) ? silverPrice : null,
      },
    };

    if (prices.bitcoin.usd === null) {
      return NextResponse.json(
        { error: 'Failed to fetch Bitcoin price.' },
        { status: 502 }
      );
    }

    return NextResponse.json(prices);
  } catch (error) {
    console.error('Error in /api/asset-prices:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred while fetching asset prices.' },
      { status: 500 }
    );
  }
}
