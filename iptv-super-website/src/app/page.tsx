// src/app/page.tsx
import { getEnrichedChannels, getCountries, getCategories, getLanguages } from '@/lib/data';
import ChannelGrid from '@/components/ChannelGrid';
import { Suspense } from 'react';

export default async function Home() {
  const [channels, countries, categories, languages] = await Promise.all([
    getEnrichedChannels(),
    getCountries(),
    getCategories(),
    getLanguages(),
  ]);

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-4xl font-bold text-center text-white">
        IPTV Super Website
      </h1>

      <Suspense fallback={<div>Loading channels...</div>}>
        <ChannelGrid
          channels={channels}
          countries={countries}
          categories={categories}
          languages={languages}
        />
      </Suspense>
    </main>
  );
}
