'use client';

import { useState, useEffect, useMemo, useCallback, type ReactNode } from 'react';
import axios from 'axios';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useCountUp } from '@/app/hooks/useCountUp';
import {
  CURRENCIES,
  CURRENCY_STORAGE_KEY,
  DEFAULT_CURRENCY,
  getCurrency,
  isCurrencyCode,
  LANGUAGE_DEFAULT_CURRENCY,
  type CurrencyCode,
} from '@/lib/currencies';

interface AssetPrices {
  bitcoin: { usd: number; usd_24h_change?: number; usd_yesterday?: number | null };
  gold: { price_per_ounce_usd: number | null };
  silver: { price_per_ounce_usd: number | null };
}

type CalcResults = {
  bitcoin: { btc: number; sats: number };
  gold: { ounces: number; grams: number } | null;
  silver: { ounces: number; grams: number } | null;
  amountInCurrency: number;
  amountUsd: number;
};

type MetalUnit = 'oz' | 'g';

type ResultCardProps = {
  icon: string;
  label: string;
  accent: string;
  glow: string;
  primary: ReactNode;
  secondary?: ReactNode;
  unavailable?: string | null;
};

function ResultCard({ icon, label, accent, glow, primary, secondary, unavailable }: ResultCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br from-gray-800/90 to-gray-900/90 p-4 shadow-lg transition-transform duration-200 hover:-translate-y-0.5 ${accent}`}
    >
      <div className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl opacity-40 ${glow}`} />
      <div className="relative flex items-start justify-between gap-2 mb-3">
        <span className="text-2xl leading-none" aria-hidden>
          {icon}
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{label}</span>
      </div>
      {unavailable ? (
        <p className="relative text-sm text-red-400 leading-snug">{unavailable}</p>
      ) : (
        <>
          <p className="relative text-xl sm:text-2xl font-bold text-white tracking-tight break-words tabular-nums">
            {primary}
          </p>
          {secondary ? <p className="relative mt-1.5 text-sm text-gray-400">{secondary}</p> : null}
        </>
      )}
    </div>
  );
}

function AnimatedValue({
  value,
  decimals,
  locale,
  suffix,
}: {
  value: number;
  decimals: number;
  locale: string;
  suffix?: string;
}) {
  const n = useCountUp(value, 750, true);
  const formatted =
    decimals <= 0
      ? Math.round(n).toLocaleString(locale)
      : n.toLocaleString(locale, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        });
  return (
    <>
      {formatted}
      {suffix ? <span className="text-base font-semibold ml-1">{suffix}</span> : null}
    </>
  );
}

const QUICK_AMOUNTS_USD = [100, 500, 1000, 5000, 10000];
const VENICE_REF_URL = 'https://venice.ai/chat?ref=pkIvLm';

export default function AssetCalculator() {
  const { t, language, languageMeta } = useLanguage();
  const [prices, setPrices] = useState<AssetPrices | null>(null);
  const [fxRates, setFxRates] = useState<Record<string, number>>({ USD: 1 });
  const [amountInput, setAmountInput] = useState<string>('');
  const [currency, setCurrency] = useState<CurrencyCode>(DEFAULT_CURRENCY);
  const [results, setResults] = useState<CalcResults | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currencyReady, setCurrencyReady] = useState(false);
  const [metalUnit, setMetalUnit] = useState<MetalUnit>('oz');
  const [shareMsg, setShareMsg] = useState<string | null>(null);
  const [btcChange, setBtcChange] = useState<number | null>(null);

  const currencyMeta = useMemo(() => getCurrency(currency), [currency]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CURRENCY_STORAGE_KEY);
      if (saved && isCurrencyCode(saved)) {
        setCurrency(saved);
        setCurrencyReady(true);
        return;
      }
    } catch {
      // ignore
    }
    setCurrency(LANGUAGE_DEFAULT_CURRENCY[language] ?? DEFAULT_CURRENCY);
    setCurrencyReady(true);
  }, [language]);

  useEffect(() => {
    if (!currencyReady) return;
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
    } catch {
      // ignore
    }
  }, [currency, currencyReady]);

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      try {
        const [pricesRes, fxRes, marketRes] = await Promise.all([
          axios.get<AssetPrices>('/api/asset-prices'),
          axios.get<{ rates: Record<string, number> }>('/api/fx-rates'),
          axios.get<{ bitcoin?: { usd_24h_change?: number } }>('/api/market-data').catch(() => null),
        ]);
        setPrices(pricesRes.data);
        setFxRates({ USD: 1, ...(fxRes.data.rates ?? {}) });
        const ch = marketRes?.data?.bitcoin?.usd_24h_change;
        setBtcChange(typeof ch === 'number' ? ch : null);
        setError(null);
      } catch (err: unknown) {
        console.error('Failed to fetch calculator data:', err);
        setError(t('loadPricesError'));
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, [t]);

  const computeResults = useCallback(
    (amount: number, code: CurrencyCode): CalcResults | null => {
      if (!prices) return null;

      let amountUsd = amount;
      if (code !== 'USD') {
        const rate = fxRates[code];
        if (!rate || rate <= 0) return null;
        amountUsd = amount / rate;
      }

      const btcPrice = prices.bitcoin.usd;
      const goldPricePerOz = prices.gold.price_per_ounce_usd;
      const silverPricePerOz = prices.silver.price_per_ounce_usd;
      const OUNCES_IN_GRAM = 31.1035;

      return {
        amountInCurrency: amount,
        amountUsd,
        bitcoin: {
          btc: amountUsd / btcPrice,
          sats: (amountUsd / btcPrice) * 100000000,
        },
        gold:
          goldPricePerOz && goldPricePerOz > 0
            ? {
                ounces: amountUsd / goldPricePerOz,
                grams: (amountUsd / goldPricePerOz) * OUNCES_IN_GRAM,
              }
            : null,
        silver:
          silverPricePerOz && silverPricePerOz > 0
            ? {
                ounces: amountUsd / silverPricePerOz,
                grams: (amountUsd / silverPricePerOz) * OUNCES_IN_GRAM,
              }
            : null,
      };
    },
    [prices, fxRates]
  );

  useEffect(() => {
    if (!results || !amountInput || isNaN(Number(amountInput))) return;
    const next = computeResults(Number(amountInput), currency);
    if (next) {
      setResults(next);
      setError(null);
    } else if (currency !== 'USD') {
      setError(t('currencyRateUnavailable'));
    }
  }, [currency, fxRates, prices]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCalculate = (overrideAmount?: string) => {
    if (!prices) return;
    const raw = overrideAmount ?? amountInput;
    if (!raw || isNaN(Number(raw))) return;

    if (overrideAmount != null) setAmountInput(overrideAmount);

    const next = computeResults(Number(raw), currency);
    if (!next) {
      setError(t('currencyRateUnavailable'));
      setResults(null);
      return;
    }

    setError(null);
    setResults(next);
  };

  const applyQuickAmount = (usdAmount: number) => {
    const rate = currency === 'USD' ? 1 : fxRates[currency];
    if (!rate || rate <= 0) {
      setError(t('currencyRateUnavailable'));
      return;
    }
    const local = usdAmount * rate;
    // Keep whole numbers for most fiats; more precision for JPY-like is still fine as integer
    const display =
      local >= 100 ? String(Math.round(local)) : local.toFixed(2).replace(/\.?0+$/, '');
    handleCalculate(display);
  };

  const formatMoney = (value: number, code: CurrencyCode) => {
    try {
      return new Intl.NumberFormat(languageMeta.locale, {
        style: 'currency',
        currency: code,
        maximumFractionDigits: value >= 1000 ? 2 : 4,
      }).format(value);
    } catch {
      return `${getCurrency(code).symbol}${value.toLocaleString(languageMeta.locale)}`;
    }
  };

  const formatPrice = (value: number) =>
    new Intl.NumberFormat(languageMeta.locale, {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: value >= 100 ? 0 : 2,
    }).format(value);

  const metalPrimary = (m: { ounces: number; grams: number }) =>
    metalUnit === 'oz' ? m.ounces : m.grams;
  const metalSecondary = (m: { ounces: number; grams: number }) =>
    metalUnit === 'oz'
      ? `${m.grams.toFixed(2)} ${t('unitG')}`
      : `${m.ounces.toFixed(4)} ${t('unitOz')}`;
  const metalSuffix = metalUnit === 'oz' ? t('unitOz') : t('unitG');
  const metalDecimals = metalUnit === 'oz' ? 4 : 2;

  const handleShare = async () => {
    if (!results) return;
    const goldLine = results.gold
      ? `Gold: ${results.gold.ounces.toFixed(4)} oz (${results.gold.grams.toFixed(2)} g)`
      : 'Gold: n/a';
    const silverLine = results.silver
      ? `Silver: ${results.silver.ounces.toFixed(4)} oz (${results.silver.grams.toFixed(2)} g)`
      : 'Silver: n/a';
    const text = [
      `Satoshi Oracle — Asset Calculator`,
      `${formatMoney(results.amountInCurrency, currency)}${
        currency !== 'USD' ? ` (≈ ${formatMoney(results.amountUsd, 'USD')})` : ''
      } equals:`,
      `• Bitcoin: ${results.bitcoin.btc.toFixed(6)} BTC`,
      `• Sats: ${Math.round(results.bitcoin.sats).toLocaleString('en-US')}`,
      `• ${goldLine}`,
      `• ${silverLine}`,
      ``,
      `https://satsofbitcoin.com/calculator`,
    ].join('\n');

    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: 'Satoshi Oracle Calculator', text });
        setShareMsg(t('shared'));
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setShareMsg(t('shared'));
      } else {
        setShareMsg(t('shareFailed'));
      }
    } catch {
      try {
        await navigator.clipboard.writeText(text);
        setShareMsg(t('shared'));
      } catch {
        setShareMsg(t('shareFailed'));
      }
    }
    setTimeout(() => setShareMsg(null), 2500);
  };

  return (
    <div className="relative overflow-hidden p-6 sm:p-8 border border-gray-700/80 rounded-2xl shadow-2xl bg-gradient-to-b from-gray-800 to-gray-900 max-w-2xl mx-auto">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-orange-500/10 to-transparent" />

      <h2 className="relative text-2xl sm:text-3xl font-bold mb-2 text-center text-orange-500 tracking-tight">
        {t('calculatorTitle')}
      </h2>
      <p className="relative text-center text-sm text-gray-400 mb-6">
        {currencyMeta.flag} {currencyMeta.code} · BTC · {t('gold').replace(':', '')} ·{' '}
        {t('silver').replace(':', '')}
      </p>

      {isLoading && (
        <div className="flex flex-col items-center gap-3 py-10 text-gray-400">
          <div className="h-8 w-8 rounded-full border-2 border-orange-500/30 border-t-orange-500 animate-spin" />
          <p className="text-sm">{t('loadingPrices')}</p>
        </div>
      )}
      {error && !isLoading && <p className="text-center text-red-400 mb-4 text-sm">{error}</p>}

      {!isLoading && prices && (
        <>
          {/* Live spot prices + vs yesterday */}
          <div className="mb-5 grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-gray-950/50 border border-orange-500/20 px-2 py-2.5 text-center">
              <div className="text-[10px] uppercase tracking-wide text-orange-400/80 mb-0.5">
                {t('spotBtc')}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-white tabular-nums">
                {formatPrice(prices.bitcoin.usd)}
              </div>
              {btcChange != null && (
                <div
                  className={`mt-1 text-[10px] font-medium tabular-nums ${
                    btcChange >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {btcChange >= 0 ? '▲' : '▼'} {Math.abs(btcChange).toFixed(2)}% {t('vsYesterday')}
                </div>
              )}
            </div>
            <div className="rounded-xl bg-gray-950/50 border border-amber-400/20 px-2 py-2.5 text-center">
              <div className="text-[10px] uppercase tracking-wide text-amber-400/80 mb-0.5">
                {t('gold').replace(':', '')}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-white tabular-nums">
                {prices.gold.price_per_ounce_usd
                  ? `${formatPrice(prices.gold.price_per_ounce_usd)}/oz`
                  : '—'}
              </div>
            </div>
            <div className="rounded-xl bg-gray-950/50 border border-slate-300/20 px-2 py-2.5 text-center">
              <div className="text-[10px] uppercase tracking-wide text-slate-300/80 mb-0.5">
                {t('silver').replace(':', '')}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-white tabular-nums">
                {prices.silver.price_per_ounce_usd
                  ? `${formatPrice(prices.silver.price_per_ounce_usd)}/oz`
                  : '—'}
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="calc-currency" className="block text-sm text-gray-400 mb-2">
              {t('currency')}
            </label>
            <select
              id="calc-currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              aria-label={t('selectCurrency')}
              className="w-full bg-gray-950/60 border border-gray-600 text-white text-sm rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code} disabled={!fxRates[c.code]}>
                  {c.flag} {c.code} — {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quick amounts */}
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-2">{t('quickAmount')}</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_AMOUNTS_USD.map((usd) => (
                <button
                  key={usd}
                  type="button"
                  onClick={() => applyQuickAmount(usd)}
                  className="px-3 py-1.5 text-xs sm:text-sm rounded-full border border-gray-600 bg-gray-950/40 text-gray-200 hover:border-orange-500/60 hover:text-orange-300 transition-colors"
                >
                  ${usd.toLocaleString('en-US')}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-grow">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm max-w-[3rem] truncate font-medium">
                {currencyMeta.symbol}
              </span>
              <input
                type="number"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCalculate();
                }}
                placeholder={t('amountPlaceholder', { currency })}
                className="w-full p-3.5 pl-12 bg-gray-950/60 border border-gray-600 rounded-xl text-white text-lg tabular-nums focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder:text-gray-500"
                dir={languageMeta.dir}
              />
            </div>
            <button
              onClick={() => handleCalculate()}
              className="px-7 py-3.5 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 active:scale-[0.98] transition-all shadow-lg shadow-orange-500/20"
            >
              {t('calculate')}
            </button>
          </div>

          {/* Metal unit toggle */}
          <div className="mb-5 flex items-center justify-between gap-3">
            <span className="text-xs text-gray-500">{t('metalUnit')}</span>
            <div className="inline-flex rounded-full border border-gray-600 bg-gray-950/50 p-0.5">
              <button
                type="button"
                onClick={() => setMetalUnit('oz')}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                  metalUnit === 'oz' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {t('unitOz')}
              </button>
              <button
                type="button"
                onClick={() => setMetalUnit('g')}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                  metalUnit === 'g' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {t('unitG')}
              </button>
            </div>
          </div>

          {results && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-gray-600/60 bg-gray-950/40 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-0.5">
                    {t('youEntered')}
                  </p>
                  <p className="text-lg font-semibold text-white tabular-nums">
                    {formatMoney(results.amountInCurrency, currency)}
                  </p>
                </div>
                {currency !== 'USD' && (
                  <div className="text-right">
                    <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-0.5">
                      {t('usdEquivalent')}
                    </p>
                    <p className="text-sm font-medium text-gray-300 tabular-nums">
                      {formatMoney(results.amountUsd, 'USD')}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ResultCard
                  icon="₿"
                  label={t('bitcoinBtc').replace(':', '')}
                  accent="border-orange-500/40"
                  glow="bg-orange-500"
                  primary={
                    <AnimatedValue
                      value={results.bitcoin.btc}
                      decimals={6}
                      locale={languageMeta.locale}
                      suffix="BTC"
                    />
                  }
                  secondary={`${formatMoney(prices.bitcoin.usd, 'USD')} / BTC`}
                />
                <ResultCard
                  icon="⚡"
                  label={t('bitcoinSats').replace(':', '')}
                  accent="border-yellow-400/35"
                  glow="bg-yellow-400"
                  primary={
                    <span className="text-yellow-100">
                      <AnimatedValue
                        value={results.bitcoin.sats}
                        decimals={0}
                        locale={languageMeta.locale}
                        suffix="sats"
                      />
                    </span>
                  }
                  secondary="1 BTC = 100,000,000 sats"
                />
                <ResultCard
                  icon="🥇"
                  label={t('gold').replace(':', '')}
                  accent="border-amber-400/40"
                  glow="bg-amber-400"
                  primary={
                    results.gold ? (
                      <AnimatedValue
                        value={metalPrimary(results.gold)}
                        decimals={metalDecimals}
                        locale={languageMeta.locale}
                        suffix={metalSuffix}
                      />
                    ) : null
                  }
                  secondary={results.gold ? metalSecondary(results.gold) : undefined}
                  unavailable={results.gold ? null : t('goldUnavailable')}
                />
                <ResultCard
                  icon="🥈"
                  label={t('silver').replace(':', '')}
                  accent="border-slate-300/35"
                  glow="bg-slate-300"
                  primary={
                    results.silver ? (
                      <AnimatedValue
                        value={metalPrimary(results.silver)}
                        decimals={metalDecimals}
                        locale={languageMeta.locale}
                        suffix={metalSuffix}
                      />
                    ) : null
                  }
                  secondary={results.silver ? metalSecondary(results.silver) : undefined}
                  unavailable={results.silver ? null : t('silverUnavailable')}
                />
              </div>

              <div className="flex flex-col items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-600 bg-gray-950/50 text-sm text-gray-200 hover:border-orange-500/50 hover:text-orange-300 transition-colors"
                >
                  <span aria-hidden>↗</span> {t('shareResult')}
                </button>
                {shareMsg && <p className="text-xs text-emerald-400">{shareMsg}</p>}
              </div>
            </div>
          )}

          <p className="mt-6 text-center">
            <a
              href={VENICE_REF_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-orange-400/80 hover:text-orange-400 transition-colors underline-offset-2 hover:underline"
            >
              {t('veniceInferenceLink')}
            </a>
          </p>

          <div className="w-full max-w-sm mx-auto mt-5 mb-2 border-t border-gray-700/80" aria-hidden />

          <p className="mt-4 text-xs text-center text-gray-500 leading-relaxed px-2">
            {t('educationalDisclaimer')}
          </p>

          <div className="w-full max-w-sm mx-auto mt-5 mb-2 border-t border-gray-700/80" aria-hidden />

          <div className="mt-4 text-xs text-center text-gray-500 leading-relaxed">
            {t('priceDisclaimer')}
          </div>
        </>
      )}
    </div>
  );
}
