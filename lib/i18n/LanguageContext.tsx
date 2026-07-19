'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  DEFAULT_LANGUAGE,
  getLanguage,
  isLanguageCode,
  LANGUAGE_STORAGE_KEY,
  type LanguageCode,
  type LanguageOption,
} from './languages';
import { translate, type TranslationKey } from './translations';

type LanguageContextValue = {
  language: LanguageCode;
  languageMeta: LanguageOption;
  setLanguage: (code: LanguageCode) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function detectBrowserLanguage(): LanguageCode {
  if (typeof navigator === 'undefined') return DEFAULT_LANGUAGE;
  const candidates = [navigator.language, ...(navigator.languages ?? [])];
  for (const raw of candidates) {
    const base = raw.toLowerCase().split('-')[0];
    if (isLanguageCode(base)) return base;
  }
  return DEFAULT_LANGUAGE;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(DEFAULT_LANGUAGE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved && isLanguageCode(saved)) {
        setLanguageState(saved);
      } else {
        setLanguageState(detectBrowserLanguage());
      }
    } catch {
      setLanguageState(detectBrowserLanguage());
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const meta = getLanguage(language);
    document.documentElement.lang = language;
    document.documentElement.dir = meta.dir;
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // ignore storage failures
    }
  }, [language, ready]);

  const setLanguage = useCallback((code: LanguageCode) => {
    setLanguageState(code);
  }, []);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) =>
      translate(language, key, vars),
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      languageMeta: getLanguage(language),
      setLanguage,
      t,
    }),
    [language, setLanguage, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return ctx;
}
