import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://satsofbitcoin.com';
  const now = new Date();

  return [
    {
      url: base,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 1,
    },
    {
      url: `${base}/calculator`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];
}
