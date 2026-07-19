import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Asset Price Calculator',
  description:
    'Convert any amount into Bitcoin (BTC & sats), gold, and silver. Multi-currency calculator with live market prices on Satoshi Oracle.',
  alternates: {
    canonical: '/calculator',
  },
  openGraph: {
    title: 'Asset Price Calculator | Satoshi Oracle',
    description:
      'See what your money is worth in Bitcoin, sats, gold, and silver — with live prices and 26 currencies.',
    url: '/calculator',
  },
  twitter: {
    title: 'Asset Price Calculator | Satoshi Oracle',
    description:
      'See what your money is worth in Bitcoin, sats, gold, and silver — with live prices and 26 currencies.',
  },
};

export default function CalculatorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
