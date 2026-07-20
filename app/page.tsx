'use client';

import DonationSection from './components/DonationSection';
import VenicePromo from './components/VenicePromo';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { DAILY_QUESTION_LIMIT } from '@/lib/askQuota';

type MarketData = {
  usd: number | string;
  usd_24h_change: number;
  usd_market_cap: number;
  last_updated_at: number;
  usd_yesterday?: number | null;
} | null;

type MarketSource = 'coingecko' | 'twelvedata' | null;

type QaEntry = {
  id: string;
  mode: 'oracle' | 'satoshi';
  question: string;
  answer: string;
  at: number;
};

const VENICE_URL = 'https://venice.ai/chat?ref=pkIvLm';
const MAX_PROMPT = 1000;
const MAX_HISTORY = 3;

const EXAMPLE_PROMPTS = [
  'What is the halving?',
  'Why is Bitcoin scarce?',
  'What is the current Bitcoin price?',
  'Who is Michael Saylor?',
];

const FOLLOW_UPS: Record<string, string[]> = {
  default: [
    'How does proof-of-work secure Bitcoin?',
    'What are sats?',
    'Why compare Bitcoin to gold?',
  ],
  price: [
    'What drives Bitcoin’s price long term?',
    'How does the halving affect supply?',
    'Is Bitcoin a store of value?',
  ],
  halving: [
    'When is the next halving?',
    'How does issuance change after a halving?',
    'Why is the 21 million cap important?',
  ],
  saylor: [
    'What is a Bitcoin treasury strategy?',
    'Why do companies hold BTC on the balance sheet?',
    'What is HODL?',
  ],
  scarce: [
    'How is the 21 million cap enforced?',
    'What is stock-to-flow in simple terms?',
    'Can Bitcoin’s supply ever increase?',
  ],
  mining: [
    'What is a difficulty adjustment?',
    'Why does mining use energy?',
    'What is a block reward?',
  ],
};

function pickFollowUps(question: string, answer: string): string[] {
  const blob = `${question} ${answer}`.toLowerCase();
  if (/price|usd|\$|market|spot/.test(blob)) return FOLLOW_UPS.price;
  if (/halv/.test(blob)) return FOLLOW_UPS.halving;
  if (/saylor|microstrategy|treasury/.test(blob)) return FOLLOW_UPS.saylor;
  if (/scarce|scarcity|21\s*million|fixed supply/.test(blob)) return FOLLOW_UPS.scarce;
  if (/min(e|ing)|proof.of.work|hashrate|difficulty/.test(blob)) return FOLLOW_UPS.mining;
  return FOLLOW_UPS.default;
}

function MarketSkeleton() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/80 p-6 rounded-2xl mb-8 shadow-xl animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 w-36 rounded-md bg-gray-700/80" />
        <div className="h-6 w-28 rounded-full bg-gray-700/60" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl bg-gray-950/40 border border-gray-700/50 p-3 space-y-2">
            <div className="h-3 w-16 rounded bg-gray-700/70" />
            <div className="h-7 w-24 rounded bg-gray-700/50" />
          </div>
        ))}
      </div>
      <p className="sr-only">Loading market data</p>
    </div>
  );
}

export default function Home() {
  const { language, languageMeta, t } = useLanguage();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [lastQuestion, setLastQuestion] = useState('');
  const [marketData, setMarketData] = useState<MarketData>(null);
  const [marketSource, setMarketSource] = useState<MarketSource>(null);
  const [marketLoading, setMarketLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'oracle' | 'satoshi'>('oracle');
  const [remaining, setRemaining] = useState<number | null>(null);
  const [history, setHistory] = useState<QaEntry[]>([]);
  const [showStickyPrice, setShowStickyPrice] = useState(false);
  const [showStickyAsk, setShowStickyAsk] = useState(false);

  const marketCardRef = useRef<HTMLDivElement | null>(null);
  const askSectionRef = useRef<HTMLDivElement | null>(null);
  const askButtonRef = useRef<HTMLButtonElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const refreshQuota = useCallback(async () => {
    try {
      const res = await axios.get<{ remaining: number }>('/api/ask');
      setRemaining(res.data.remaining);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    refreshQuota();
  }, [refreshQuota]);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setMarketLoading(true);
      try {
        const response = await axios.get('/api/market-data');
        if (isMounted && response.data && response.data.bitcoin) {
          setMarketData(response.data.bitcoin);
          const source = response.data.source;
          setMarketSource(source === 'coingecko' || source === 'twelvedata' ? source : null);
        }
      } catch (error) {
        console.error('Error fetching market data:', error);
        if (isMounted) {
          setMarketData({
            usd: t('errorLoadingData'),
            usd_24h_change: 0,
            usd_market_cap: 0,
            last_updated_at: Date.now() / 1000,
          });
          setMarketSource(null);
        }
      } finally {
        if (isMounted) setMarketLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [t]);

  // Sticky price bar + sticky ask (mobile) based on scroll position
  useEffect(() => {
    const onScrollOrResize = () => {
      const marketEl = marketCardRef.current;
      if (marketEl) {
        const rect = marketEl.getBoundingClientRect();
        // Show sticky bar once the market card has scrolled mostly out of view
        setShowStickyPrice(rect.bottom < 64);
      }

      const askBtn = askButtonRef.current;
      if (askBtn) {
        const r = askBtn.getBoundingClientRect();
        const vh = window.innerHeight || 0;
        // Show mobile sticky ask when primary button is off-screen and user has typed something
        setShowStickyAsk(r.bottom < 0 || r.top > vh - 24);
      }
    };

    onScrollOrResize();
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [marketData, marketLoading, answer, isLoading]);

  const handleAsk = async (promptOverride?: string) => {
    const prompt = (promptOverride ?? question).trim();
    if (!prompt) return;
    if (remaining === 0) {
      setAnswer(t('dailyLimitReached'));
      return;
    }

    setIsLoading(true);
    setAnswer('');
    setLastQuestion(prompt);
    if (promptOverride) setQuestion(prompt);

    try {
      const response = await axios.post('/api/ask', {
        prompt,
        mode,
        language,
      });
      const nextAnswer =
        response.data && response.data.answer ? response.data.answer : t('unexpectedResponse');
      setAnswer(nextAnswer);

      setHistory((prev) => {
        const entry: QaEntry = {
          id: `${Date.now()}`,
          mode,
          question: prompt,
          answer: nextAnswer,
          at: Date.now(),
        };
        return [entry, ...prev].slice(0, MAX_HISTORY);
      });

      if (typeof response.data?.remaining === 'number') {
        setRemaining(response.data.remaining);
      } else {
        refreshQuota();
      }
    } catch (error: unknown) {
      console.error('Error asking question:', error);
      if (axios.isAxiosError(error) && error.response) {
        const data = error.response.data as { answer?: string; remaining?: number; error?: string };
        if (typeof data?.remaining === 'number') setRemaining(data.remaining);
        if (data?.answer) {
          setAnswer(data.answer);
        } else if (error.response.status === 429) {
          setAnswer(t('dailyLimitReached'));
          setRemaining(0);
        } else {
          setAnswer(t('serverError', { status: error.response.status }));
        }
      } else if (axios.isAxiosError(error) && error.request) {
        setAnswer(t('connectionError'));
      } else {
        setAnswer(t('unexpectedError'));
      }
    } finally {
      setIsLoading(false);
      setQuestion('');
    }
  };

  const formatLastUpdated = (timestamp: number | null | undefined) => {
    if (timestamp === null || timestamp === undefined) return t('na');
    if (typeof timestamp !== 'number' || !isFinite(timestamp)) return t('invalidData');
    try {
      const date = new Date(Math.floor(timestamp) * 1000);
      if (isNaN(date.getTime())) return t('invalidDate');
      return date.toLocaleTimeString(languageMeta.locale);
    } catch {
      return t('error');
    }
  };

  const formatNumber = (value: number) => value.toLocaleString(languageMeta.locale);

  const remainingLabel =
    remaining == null
      ? null
      : remaining === 1
        ? t('questionsRemainingOne')
        : t('questionsRemaining', { count: remaining });

  const atLimit = remaining === 0;
  const charCount = question.length;
  const followUps = useMemo(
    () => (answer && lastQuestion ? pickFollowUps(lastQuestion, answer) : []),
    [answer, lastQuestion]
  );

  const priceLabel =
    marketData && typeof marketData.usd === 'number'
      ? `$${formatNumber(marketData.usd)}`
      : marketData && typeof marketData.usd === 'string'
        ? marketData.usd
        : '—';

  const changeOk = marketData && typeof marketData.usd_24h_change === 'number';

  const askDisabled = isLoading || atLimit || !question.trim();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white flex flex-col items-center p-4 pt-8 pb-28 sm:pb-12">
      {/* 1. Sticky mini price bar */}
      <div
        className={`fixed left-0 right-0 z-40 transition-all duration-300 ${
          showStickyPrice && marketData && !marketLoading
            ? 'top-0 opacity-100 translate-y-0'
            : '-top-2 opacity-0 -translate-y-full pointer-events-none'
        }`}
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="border-b border-gray-800/90 bg-gray-950/95 backdrop-blur-md shadow-lg">
          <div className="mx-auto max-w-2xl px-4 py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-orange-400 font-bold text-sm">₿</span>
              <span className="font-semibold tabular-nums text-sm sm:text-base truncate">
                {priceLabel}
              </span>
              {changeOk && (
                <span
                  className={`text-xs font-semibold tabular-nums shrink-0 ${
                    marketData!.usd_24h_change >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {marketData!.usd_24h_change >= 0 ? '▲' : '▼'}{' '}
                  {Math.abs(marketData!.usd_24h_change).toFixed(2)}%
                </span>
              )}
            </div>
            <Link
              href="/calculator"
              className="text-xs sm:text-sm text-gray-400 hover:text-orange-400 shrink-0 py-1 px-2"
            >
              {t('navCalculator')} →
            </Link>
          </div>
        </div>
      </div>

      <main className="w-full max-w-2xl" dir={languageMeta.dir}>
        <nav className="flex justify-center gap-3 mb-8">
          <Link
            href="/"
            className="min-h-11 px-5 py-2.5 bg-orange-500 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/20 cursor-default inline-flex items-center"
          >
            {t('navOracle')}
          </Link>
          <Link
            href="/calculator"
            className="min-h-11 px-5 py-2.5 bg-gray-800/80 border border-gray-700 text-gray-300 font-semibold rounded-xl hover:bg-gray-700 hover:text-white transition-colors inline-flex items-center"
          >
            {t('navCalculator')}
          </Link>
        </nav>

        <h1 className="text-4xl sm:text-5xl font-bold text-center mb-2 text-orange-500 tracking-tight">
          {t('siteTitle')}
        </h1>
        <p className="text-center text-gray-400 mb-2">{t('siteSubtitle')}</p>
        <p className="text-center text-xs text-gray-500 mb-8">{t('topicHint')}</p>

        {/* 5. Skeleton loaders */}
        {marketLoading && <MarketSkeleton />}

        {!marketLoading && marketData && (
          <div
            ref={marketCardRef}
            className="relative overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/80 p-6 rounded-2xl mb-8 shadow-xl"
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-orange-500/10 blur-2xl" />
            <div className="flex items-center justify-between mb-4 gap-2">
              <h2 className="text-xl font-semibold">₿ {t('marketData')}</h2>
              {typeof marketData.usd_24h_change === 'number' && (
                <span
                  className={`text-xs font-semibold px-2.5 py-1.5 rounded-full ${
                    marketData.usd_24h_change >= 0
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-red-500/15 text-red-400'
                  }`}
                >
                  {marketData.usd_24h_change >= 0 ? '▲' : '▼'}{' '}
                  {Math.abs(marketData.usd_24h_change).toFixed(2)}% {t('vsYesterday')}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
              <div className="rounded-xl bg-gray-950/40 border border-gray-700/50 p-3 sm:p-4">
                <p className="text-gray-400 text-xs mb-1">{t('priceUsd')}</p>
                <p className="text-xl sm:text-2xl font-bold tabular-nums tracking-tight">
                  $
                  {typeof marketData.usd === 'number'
                    ? formatNumber(marketData.usd)
                    : marketData.usd}
                </p>
              </div>
              <div className="rounded-xl bg-gray-950/40 border border-gray-700/50 p-3 sm:p-4">
                <p className="text-gray-400 text-xs mb-1">{t('change24h')}</p>
                <p
                  className={`text-xl sm:text-2xl font-bold tabular-nums ${
                    marketData.usd_24h_change > 0
                      ? 'text-emerald-400'
                      : marketData.usd_24h_change < 0
                        ? 'text-red-400'
                        : 'text-white'
                  }`}
                >
                  {marketData.usd_24h_change.toFixed(2)}%
                </p>
              </div>
              <div className="rounded-xl bg-gray-950/40 border border-gray-700/50 p-3 sm:p-4">
                <p className="text-gray-400 text-xs mb-1">{t('marketCap')}</p>
                <p className="text-lg sm:text-xl font-bold tabular-nums">
                  ${(marketData.usd_market_cap / 1e9).toFixed(2)}B
                </p>
              </div>
              <div className="rounded-xl bg-gray-950/40 border border-gray-700/50 p-3 sm:p-4">
                <p className="text-gray-400 text-xs mb-1">{t('lastUpdated')}</p>
                <p className="text-lg sm:text-xl font-bold">
                  {formatLastUpdated(marketData.last_updated_at)}
                </p>
              </div>
            </div>
          </div>
        )}

        <div
          ref={askSectionRef}
          className="bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-700/80 p-5 sm:p-6 rounded-2xl shadow-xl"
        >
          {/* Mode pills + 3. blurbs */}
          <div className="flex p-1 mb-3 rounded-xl bg-gray-950/50 border border-gray-700/60">
            <button
              type="button"
              onClick={() => setMode('oracle')}
              className={`flex-1 min-h-11 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                mode === 'oracle'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {t('oracleMode')}
            </button>
            <button
              type="button"
              onClick={() => setMode('satoshi')}
              className={`flex-1 min-h-11 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                mode === 'satoshi'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {t('satoshiMode')}
            </button>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mb-5 leading-relaxed px-0.5">
            {mode === 'oracle' ? t('oracleBlurb') : t('satoshiBlurb')}
          </p>

          {/* Quota */}
          {remainingLabel && (
            <div
              className={`mb-4 text-center text-sm rounded-xl px-3 py-2.5 border ${
                atLimit
                  ? 'border-red-500/40 bg-red-500/10 text-red-300'
                  : remaining != null && remaining <= 3
                    ? 'border-amber-500/30 bg-amber-500/10 text-amber-200'
                    : 'border-gray-700 bg-gray-950/40 text-gray-400'
              }`}
            >
              {atLimit ? t('dailyLimitReached') : remainingLabel}
              {atLimit && (
                <>
                  {' '}
                  <a
                    href={VENICE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-400 hover:underline font-medium"
                  >
                    {t('tryVenice')}
                  </a>
                </>
              )}
            </div>
          )}

          {/* Example chips */}
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-2">{t('exampleQuestions')}</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_PROMPTS.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  disabled={isLoading || atLimit}
                  onClick={() => {
                    setQuestion(ex);
                    textareaRef.current?.focus();
                  }}
                  className="min-h-9 px-3 py-1.5 text-xs sm:text-sm rounded-full border border-gray-600 text-gray-300 hover:border-orange-500/50 hover:text-orange-300 disabled:opacity-40 transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <textarea
              ref={textareaRef}
              className="w-full p-3.5 pb-8 bg-gray-950/50 border border-gray-600 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder:text-gray-500 disabled:opacity-50 min-h-[7.5rem]"
              rows={4}
              value={question}
              onChange={(e) => setQuestion(e.target.value.slice(0, MAX_PROMPT))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !askDisabled) {
                  e.preventDefault();
                  handleAsk();
                }
              }}
              placeholder={t('questionPlaceholder')}
              disabled={isLoading || atLimit}
              dir={languageMeta.dir}
              maxLength={MAX_PROMPT}
            />
            {/* 4. Character counter */}
            <span
              className={`absolute bottom-2.5 right-3 text-[11px] tabular-nums pointer-events-none ${
                charCount >= MAX_PROMPT
                  ? 'text-red-400'
                  : charCount > 850
                    ? 'text-amber-400'
                    : 'text-gray-500'
              }`}
            >
              {t('charsCount', { count: charCount })}
            </span>
          </div>

          <button
            ref={askButtonRef}
            onClick={() => handleAsk()}
            disabled={askDisabled}
            className="mt-4 w-full min-h-12 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 px-4 rounded-xl transition duration-300 disabled:bg-gray-700 disabled:text-gray-400 shadow-lg shadow-orange-500/10 text-base"
          >
            {isLoading
              ? mode === 'satoshi'
                ? t('consultingSatoshi')
                : t('thinking')
              : t('askOracle')}
          </button>
          {isLoading && mode === 'satoshi' && (
            <p className="text-center text-sm text-gray-400 mt-2 animate-pulse">
              {t('connectingNode')}
            </p>
          )}

          {answer && (
            <div className="mt-6 p-4 bg-gray-950/50 border border-gray-700/60 rounded-xl">
              {lastQuestion && (
                <p className="text-xs text-gray-500 mb-2">
                  <span className="text-gray-600">{t('youAsked')}: </span>
                  <span className="text-gray-400">{lastQuestion}</span>
                </p>
              )}
              <p className="whitespace-pre-wrap leading-relaxed" dir={languageMeta.dir}>
                {answer}
              </p>
              <p className="mt-4 pt-3 border-t border-gray-800 text-[11px] text-gray-500 text-center tracking-wide">
                {t('veniceInferenceFooter')}
              </p>

              {/* 6. Suggested follow-ups */}
              {followUps.length > 0 && !atLimit && (
                <div className="mt-4 pt-3 border-t border-gray-800">
                  <p className="text-xs text-gray-500 mb-2">{t('suggestedFollowUps')}</p>
                  <div className="flex flex-wrap gap-2">
                    {followUps.map((fu) => (
                      <button
                        key={fu}
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleAsk(fu)}
                        className="min-h-9 px-3 py-1.5 text-xs sm:text-sm rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-200 hover:bg-orange-500/20 disabled:opacity-40 transition-colors text-left"
                      >
                        {fu}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. Session history (last 3) */}
          {history.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-300">{t('sessionHistory')}</h3>
                <button
                  type="button"
                  onClick={() => setHistory([])}
                  className="text-xs text-gray-500 hover:text-gray-300 min-h-8 px-2"
                >
                  {t('clearHistory')}
                </button>
              </div>
              <ul className="space-y-2">
                {history.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setLastQuestion(item.question);
                        setAnswer(item.answer);
                        setMode(item.mode);
                        askSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className="w-full text-left rounded-xl border border-gray-700/70 bg-gray-950/40 px-3 py-3 hover:border-orange-500/40 transition-colors min-h-12"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[10px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded ${
                            item.mode === 'satoshi'
                              ? 'bg-amber-500/15 text-amber-300'
                              : 'bg-orange-500/15 text-orange-300'
                          }`}
                        >
                          {item.mode === 'satoshi' ? t('modeSatoshiShort') : t('modeOracleShort')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-200 line-clamp-1">{item.question}</p>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{item.answer}</p>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!atLimit && remaining != null && (
            <p className="mt-3 text-center text-xs text-gray-500">
              {remainingLabel}
              <span className="text-gray-600"> · {DAILY_QUESTION_LIMIT}/day</span>
            </p>
          )}
        </div>

        <p className="text-center text-sm text-orange-400/80 mt-8 max-w-md mx-auto leading-relaxed">
          {t('veniceInferenceBy')}
        </p>
        <p className="text-center text-gray-500 text-sm mt-2">
          {marketSource === 'coingecko'
            ? t('marketSourceCoingecko')
            : marketSource === 'twelvedata'
              ? t('marketSourceTwelve')
              : t('marketSourceGeneric')}
        </p>

        <VenicePromo />
        <DonationSection />
      </main>

      {/* 7. Mobile sticky Ask button */}
      <div
        className={`sm:hidden fixed inset-x-0 bottom-0 z-40 transition-transform duration-300 ${
          showStickyAsk && question.trim() && !atLimit && !isLoading
            ? 'translate-y-0'
            : 'translate-y-full pointer-events-none'
        }`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="border-t border-gray-800 bg-gray-950/95 backdrop-blur-md px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.45)]">
          <button
            type="button"
            onClick={() => handleAsk()}
            disabled={askDisabled}
            className="w-full min-h-12 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 text-white font-bold rounded-xl text-base"
          >
            {t('askSticky')} · {mode === 'satoshi' ? t('modeSatoshiShort') : t('modeOracleShort')}
          </button>
        </div>
      </div>
    </div>
  );
}
