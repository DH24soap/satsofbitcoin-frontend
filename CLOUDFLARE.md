# Deploy Satsofbitcoin on Cloudflare (full stack)

The app is a single Next.js project. UI + API routes run on **Cloudflare Workers** via OpenNext. No DigitalOcean droplet or Vercel required.

## API routes (same origin)

| Route | Purpose |
|-------|---------|
| `POST /api/ask` | Venice AI oracle |
| `GET /api/asset-prices` | BTC / gold / silver |
| `GET /api/market-data` | CoinGecko market panel |
| `GET /api/health` | Health check |

## Secrets (set in Cloudflare dashboard)

| Name | Required |
|------|----------|
| `VENICE_API_KEY` | Yes (oracle) |
| `TWELVEDATA_API_KEY` | Yes (calculator) |
| `FCSAPI_API_KEY` | Yes (silver) |
| `COINGECKO_API_KEY` | Optional (market panel works without it on free tier) |

## Deploy from your Mac

```bash
cd satsofbitcoin-frontend
npm install
npx wrangler login
npm run deploy
```

When prompted, set secrets:

```bash
npx wrangler secret put VENICE_API_KEY
npx wrangler secret put TWELVEDATA_API_KEY
npx wrangler secret put FCSAPI_API_KEY
npx wrangler secret put COINGECKO_API_KEY
```

## Connect the domain

1. Cloudflare dashboard → **Workers & Pages** → **satsofbitcoin**
2. **Settings** → **Domains & Routes** → **Add** → `satsofbitcoin.com` and `www.satsofbitcoin.com`
3. Cloudflare will attach the domain (DNS is already on Cloudflare)

## After it works

1. Confirm oracle + calculator on https://satsofbitcoin.com
2. Suspend/delete the DigitalOcean droplet
3. Suspend the Render backend service
4. You can ignore Vercel (no access needed)

## Local dev

```bash
cp .dev.vars.example .dev.vars
# fill in keys in .dev.vars
npm run dev
```
