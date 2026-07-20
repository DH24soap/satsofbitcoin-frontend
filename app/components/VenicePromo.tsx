'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';

const VENICE_REF_URL = 'https://venice.ai/chat?ref=pkIvLm';

export default function VenicePromo() {
  const { t } = useLanguage();

  return (
    <section className="mt-8 mb-2 flex flex-col items-center text-center">
      <div className="w-full max-w-sm mb-2 border-t border-gray-700/80" aria-hidden />

      <p className="mt-6 text-lg text-gray-300 font-medium tracking-wide">
        {t('veniceReady')}
      </p>

      <a
        href={VENICE_REF_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 group inline-flex flex-col items-center gap-3 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        aria-label={t('veniceVisit')}
      >
        <span className="inline-flex rounded-lg border border-white p-0.5 transition-transform group-hover:scale-[1.02]">
          {/*
            Official logo: save as public/venice-logo.png
            Fallback placeholder: public/venice-logo.svg
          */}
          <img
            src="/venice-logo.png"
            alt="Venice AI"
            width={220}
            height={120}
            className="h-auto w-[200px] max-w-full object-contain rounded-md"
            onError={(e) => {
              const img = e.currentTarget;
              if (!img.src.includes('venice-logo.svg')) {
                img.src = '/venice-logo.svg';
              }
            }}
          />
        </span>
        <span className="text-sm text-gray-500 group-hover:text-orange-400 transition-colors">
          {t('veniceVisit')}
        </span>
      </a>
    </section>
  );
}
