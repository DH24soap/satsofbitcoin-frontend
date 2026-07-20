'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function DonationSection() {
  const { t } = useLanguage();
  const lightningAddress =
    'lnbc1p54q70app580en3ajuzhtcjl8hvtpknqqsh6kag2rth5g9clpgd2cm49rt5unqdqqcqzzsxqrrs0fppqcumkkpfeyufk2a4ygdvww3yddkd226zesp5uulr233alwt0nv0cx2grs5mhgkyxx3n5hdfud5z4guyvxy5qydhs9qxpqysgqacz2g5hmd5ht4a27wurdsj7x09ee4w3kp3n9g68r7jx5p4nwadlnnan6n6n9swqz9np8mu2ee7gmekzr3u0yxx2hy8p3vqvlrydq5kcp6jnuvn';

  const [isCopied, setIsCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(lightningAddress);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-700/80 p-6 rounded-2xl mt-8 shadow-xl">
      <h2 className="text-2xl font-semibold mb-3 text-center text-white">{t('supportTitle')}</h2>
      <p className="text-gray-400 text-center mb-5 max-w-md mx-auto leading-relaxed">
        {t('supportBody')}
      </p>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => setIsExpanded((open) => !open)}
          aria-expanded={isExpanded}
          className="inline-flex items-center gap-2 min-h-11 px-4 py-2.5 rounded-xl border border-gray-600 bg-gray-950/40 text-sm text-gray-200 hover:border-orange-500/50 hover:text-orange-300 transition-colors"
        >
          <span
            className={`text-orange-400 transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
            aria-hidden
          >
            ▾
          </span>
          {isExpanded ? t('hideDonationDetails') : t('showDonationDetails')}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-6 flex flex-col items-center gap-4 animate-in fade-in">
          <img
            src="/lightning-qr.png"
            alt={t('qrAlt')}
            className="w-48 h-48 bg-white p-2 rounded-xl shadow-md"
          />

          <div className="w-full max-w-md">
            <div className="flex items-center gap-2 bg-gray-950/50 border border-gray-700 rounded-xl p-2">
              <input
                type="text"
                value={lightningAddress}
                readOnly
                className="flex-grow min-w-0 bg-transparent text-sm text-gray-300 focus:outline-none px-2"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="shrink-0 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-4 rounded-lg transition duration-300 text-sm min-h-10"
              >
                {isCopied ? t('copied') : t('copy')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
