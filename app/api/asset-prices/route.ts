import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const twelveDataKey = process.env.TWELVEDATA_API_KEY;
    const fcsApiKey = process.env.FCSAPI_API_KEY;

    if (!twelveDataKey || !fcsApiKey) {
      return NextResponse.json(
        { error: 'API keys are not configured on the server.' },
        { status: 500 }
      );
    }

    const twelveDataSymbols = 'BTC/USD,XAU/USD';
    const twelveDataUrl = `https://api.twelvedata.com/price?symbol=${twelveDataSymbols}&apikey=${twelveDataKey}`;
    const twelveResponse = await fetch(twelveDataUrl);
    const twelveData = await twelveResponse.json();

    if (twelveData.status && twelveData.status === 'error') {
      console.error('Twelve Data API Error:', twelveData.message);
      return NextResponse.json(
        { error: 'Failed to fetch data from Twelve Data.' },
        { status: 500 }
      );
    }

    const fcsUrl = `https://fcsapi.com/api-v3/forex/latest?symbol=XAG/USD&access_key=${fcsApiKey}`;
    const fcsResponse = await fetch(fcsUrl);
    const fcsData = await fcsResponse.json();

    const prices = {
      bitcoin: {
        usd: parseFloat(twelveData['BTC/USD'].price),
      },
      gold: {
        price_per_ounce_usd: parseFloat(twelveData['XAU/USD'].price),
      },
      silver: {
        price_per_ounce_usd:
          fcsData.status === true && fcsData.response && fcsData.response.length > 0
            ? parseFloat(fcsData.response[0].c)
            : null,
      },
    };

    return NextResponse.json(prices);
  } catch (error) {
    console.error('Error in /api/asset-prices:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred while fetching asset prices.' },
      { status: 500 }
    );
  }
}
