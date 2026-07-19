import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Providers from './components/Providers';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const siteUrl = 'https://satsofbitcoin.com';
const siteName = 'Satoshi Oracle';
const title = 'Satoshi Oracle | Bitcoin Q&A, live prices & calculator';
const description =
  'Ask the Satoshi Oracle about Bitcoin and its ecosystem. Oracle mode for clear modern answers, Satoshi’s 2011 perspective, live BTC prices, and a multi-currency BTC · gold · silver calculator. Inference by Venice.ai.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: '%s | Satoshi Oracle',
  },
  description,
  applicationName: siteName,
  authors: [{ name: 'Sats of Bitcoin', url: siteUrl }],
  creator: 'Sats of Bitcoin',
  publisher: 'Sats of Bitcoin',
  keywords: [
    'Bitcoin',
    'Satoshi Nakamoto',
    'Satoshi Oracle',
    'BTC price',
    'Bitcoin calculator',
    'sats',
    'gold silver bitcoin',
    'Venice AI',
    'crypto education',
  ],
  category: 'finance',
  referrer: 'origin-when-cross-origin',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName,
    title,
    description,
    // Static PNG works reliably on Cloudflare Workers (next/og is flaky there)
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Satoshi Oracle — Bitcoin Q&A, live prices, and calculator',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/og.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: [{ url: '/og.png', type: 'image/png', sizes: '1200x630' }, { url: '/icon-32.png', type: 'image/png', sizes: '32x32' }],
    apple: [{ url: '/apple-icon.png', type: 'image/png', sizes: '180x180' }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#030712' },
    { media: '(prefers-color-scheme: light)', color: '#111827' },
  ],
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl,
    description,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
