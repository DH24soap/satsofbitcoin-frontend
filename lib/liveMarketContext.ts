type PriceSnapshot = {
  btcUsd: number | null;
  btcChange24h: number | null;
  goldUsdOz: number | null;
  silverUsdOz: number | null;
};

async function fetchJson(url: string, init?: RequestInit): Promise<unknown | null> {
  try {
    const res = await fetch(url, { ...init, cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Best-effort live prices for injection into Oracle / Satoshi prompts. */
export async function fetchLiveMarketSnapshot(): Promise<PriceSnapshot> {
  const twelveKey = process.env.TWELVEDATA_API_KEY;
  const cgKey = process.env.COINGECKO_API_KEY;

  let btcUsd: number | null = null;
  let btcChange24h: number | null = null;
  let goldUsdOz: number | null = null;
  let silverUsdOz: number | null = null;

  // CoinGecko first for BTC + 24h change
  try {
    const params = new URLSearchParams({
      ids: 'bitcoin',
      vs_currencies: 'usd',
      include_24hr_change: 'true',
    });
    const headers: HeadersInit = { Accept: 'application/json' };
    if (cgKey) {
      headers['x-cg-demo-api-key'] = cgKey;
      params.set('x-cg-demo-api-key', cgKey);
    }
    const data = (await fetchJson(
      `https://api.coingecko.com/api/v3/simple/price?${params.toString()}`,
      { headers }
    )) as { bitcoin?: { usd?: number; usd_24h_change?: number } } | null;
    if (data?.bitcoin?.usd) {
      btcUsd = data.bitcoin.usd;
      btcChange24h = data.bitcoin.usd_24h_change ?? null;
    }
  } catch {
    // continue
  }

  if (twelveKey) {
    const data = (await fetchJson(
      `https://api.twelvedata.com/price?symbol=BTC/USD,XAU/USD,XAG/USD&apikey=${twelveKey}`
    )) as Record<string, { price?: string }> | null;

    if (data) {
      if (!btcUsd && data['BTC/USD']?.price) btcUsd = parseFloat(data['BTC/USD'].price);
      if (data['XAU/USD']?.price) goldUsdOz = parseFloat(data['XAU/USD'].price);
      if (data['XAG/USD']?.price) silverUsdOz = parseFloat(data['XAG/USD'].price);
    }
  }

  // Silver fallback
  if (silverUsdOz == null) {
    const gp = (await fetchJson('https://data-asg.goldprice.org/dbXRates/USD')) as {
      items?: Array<{ xagPrice?: number }>;
    } | null;
    const xag = gp?.items?.[0]?.xagPrice;
    if (typeof xag === 'number' && xag > 0) silverUsdOz = xag;
  }

  return { btcUsd, btcChange24h, goldUsdOz, silverUsdOz };
}

export function formatMarketContext(snap: PriceSnapshot): string {
  const lines: string[] = ['Live market snapshot (use when the user asks about prices or markets):'];
  if (snap.btcUsd != null) {
    const ch =
      snap.btcChange24h != null
        ? ` (${snap.btcChange24h >= 0 ? '+' : ''}${snap.btcChange24h.toFixed(2)}% 24h)`
        : '';
    lines.push(`- Bitcoin (BTC): $${snap.btcUsd.toLocaleString('en-US', { maximumFractionDigits: 2 })}${ch}`);
  }
  if (snap.goldUsdOz != null) {
    lines.push(
      `- Gold: $${snap.goldUsdOz.toLocaleString('en-US', { maximumFractionDigits: 2 })} per troy ounce`
    );
  }
  if (snap.silverUsdOz != null) {
    lines.push(
      `- Silver: $${snap.silverUsdOz.toLocaleString('en-US', { maximumFractionDigits: 2 })} per troy ounce`
    );
  }
  if (lines.length === 1) {
    lines.push('- Live prices temporarily unavailable; say so if asked about current prices.');
  }
  return lines.join('\n');
}
