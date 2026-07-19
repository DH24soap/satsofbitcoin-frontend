import { NextResponse } from 'next/server';
import { CURRENCIES, type CurrencyCode } from '@/lib/currencies';

type RatesMap = Partial<Record<CurrencyCode, number>>;

async function fetchOpenErApi(): Promise<RatesMap | null> {
  try {
    const response = await fetch('https://open.er-api.com/v6/latest/USD', {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (data.result !== 'success' || !data.rates) return null;
    return data.rates as RatesMap;
  } catch (error) {
    console.error('open.er-api FX fetch failed:', error);
    return null;
  }
}

async function fetchFrankfurter(): Promise<RatesMap | null> {
  try {
    const codes = CURRENCIES.map((c) => c.code).filter((c) => c !== 'USD');
    const url = `https://api.frankfurter.app/latest?from=USD&to=${codes.join(',')}`;
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) return null;
    const data = await response.json();
    if (!data.rates) return null;
    return data.rates as RatesMap;
  } catch (error) {
    console.error('Frankfurter FX fetch failed:', error);
    return null;
  }
}

export async function GET() {
  try {
    const rawRates = (await fetchOpenErApi()) ?? (await fetchFrankfurter());

    if (!rawRates) {
      return NextResponse.json(
        { error: 'Unable to fetch foreign exchange rates.' },
        { status: 502 }
      );
    }

    const rates: Record<string, number> = { USD: 1 };

    for (const currency of CURRENCIES) {
      if (currency.code === 'USD') continue;
      const rate = Number(rawRates[currency.code]);
      if (Number.isFinite(rate) && rate > 0) {
        rates[currency.code] = rate;
      }
    }

    return NextResponse.json({
      base: 'USD',
      rates,
      // units of foreign currency per 1 USD
      updated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in /api/fx-rates:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred while fetching FX rates.' },
      { status: 500 }
    );
  }
}
