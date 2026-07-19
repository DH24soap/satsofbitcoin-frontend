'use client';

import AssetCalculator from '@/app/components/AssetCalculator';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function CalculatorPage() {
  const { t, languageMeta } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 pt-8">
      <main className="w-full max-w-2xl" dir={languageMeta.dir}>
        <nav className="flex justify-center space-x-4 mb-6">
          <Link
            href="/"
            className="px-4 py-2 bg-gray-700 text-gray-300 font-semibold rounded-md hover:bg-gray-600 hover:text-white transition-colors"
          >
            {t('backToOracle')}
          </Link>
          <Link
            href="/calculator"
            className="px-4 py-2 bg-orange-500 text-white font-semibold rounded-md cursor-default"
          >
            {t('navCalculator')}
          </Link>
        </nav>

        <AssetCalculator />
      </main>
    </div>
  );
}
