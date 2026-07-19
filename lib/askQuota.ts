export const DAILY_QUESTION_LIMIT = 10;
export const ASK_QUOTA_COOKIE = 'sob_ask_quota';
export const ASK_QUOTA_STORAGE_KEY = 'satsofbitcoin-ask-quota';

export type AskQuota = {
  date: string; // YYYY-MM-DD (UTC)
  count: number;
};

export function utcDateKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function parseQuota(raw: string | null | undefined): AskQuota {
  const today = utcDateKey();
  if (!raw) return { date: today, count: 0 };
  try {
    const parsed = JSON.parse(raw) as Partial<AskQuota>;
    if (parsed.date === today && typeof parsed.count === 'number' && parsed.count >= 0) {
      return { date: today, count: Math.min(parsed.count, DAILY_QUESTION_LIMIT + 50) };
    }
  } catch {
    // ignore
  }
  return { date: today, count: 0 };
}

export function remainingFromQuota(quota: AskQuota): number {
  if (quota.date !== utcDateKey()) return DAILY_QUESTION_LIMIT;
  return Math.max(0, DAILY_QUESTION_LIMIT - quota.count);
}

export function serializeQuota(quota: AskQuota): string {
  return JSON.stringify(quota);
}
