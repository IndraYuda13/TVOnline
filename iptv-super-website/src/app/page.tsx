// src/app/page.tsx
import { getEnrichedChannels, getCountries, getCategories, getLanguages } from '@/lib/data';
import { getPlayableChannelCache } from '@/lib/playable-cache';
import ChannelGrid from '@/components/ChannelGrid';
import { Suspense } from 'react';

export const revalidate = 3600;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ playable?: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const playableParam = Array.isArray(resolvedSearchParams.playable)
    ? resolvedSearchParams.playable[0]
    : resolvedSearchParams.playable;
  const playableOnly = playableParam !== '0';

  const [channels, countries, categories, languages, playableCache] = await Promise.all([
    getEnrichedChannels(),
    getCountries(),
    getCategories(),
    getLanguages(),
    getPlayableChannelCache(),
  ]);

  const playableSet = new Set(playableCache.playableChannelIds);
  const visibleChannels = playableOnly
    ? channels.filter((channel) => playableSet.has(channel.id))
    : channels;

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-4xl font-bold text-center text-white">
        IPTV Super Website
      </h1>

      <Suspense fallback={<div>Loading channels...</div>}>
        <ChannelGrid
          channels={visibleChannels}
          countries={countries}
          categories={categories}
          languages={languages}
          playableOnly={playableOnly}
          playableChannelCount={playableCache.playableChannelCount}
        />
      </Suspense>
    </main>
  );
}
