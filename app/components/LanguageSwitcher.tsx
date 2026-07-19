'use client';

import { LANGUAGES } from '@/lib/i18n/languages';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function LanguageSwitcher() {
  const { language, setLanguage, t, languageMeta } = useLanguage();

  return (
    <div className="w-full border-b border-gray-800 bg-gray-950/90 backdrop-blur sticky top-0 z-50">
      <div className="mx-auto max-w-2xl px-4 py-2 flex items-center justify-between gap-3">
        <label htmlFor="site-language" className="text-sm text-gray-400 whitespace-nowrap">
          <span className="mr-2" aria-hidden>
            🌐
          </span>
          {t('language')}
        </label>
        <select
          id="site-language"
          value={language}
          onChange={(e) => setLanguage(e.target.value as typeof language)}
          aria-label={t('selectLanguage')}
          className="min-w-[12rem] max-w-full bg-gray-800 border border-gray-600 text-white text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          dir={languageMeta.dir}
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.nativeName}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
