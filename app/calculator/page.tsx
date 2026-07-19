'use client';

import AssetCalculator from '@/app/components/AssetCalculator';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function CalculatorPage() {
  const { t, languageMeta } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white flex flex-col items-center p-4 pt-8 pb-12">
      <main className="w-full max-w-2xl" dir={languageMeta.dir}>
        <nav className="flex justify-center gap-3 mb-8">
          <Link
            href="/"
            className="px-4 py-2 bg-gray-800/80 border border-gray-700 text-gray-300 font-semibold rounded-xl hover:bg-gray-700 hover:text-white transition-colors"
          >
            {t('backToOracle')}
          </Link>
          <Link
            href="/calculator"
            className="px-4 py-2 bg-orange-500 text-white font-semibold rounded-xl cursor-default shadow-lg shadow-orange-500/20"
          >
            {t('navCalculator')}
          </Link>
        </nav>

        <AssetCalculator />
      </main>
    </div>
  );
}
