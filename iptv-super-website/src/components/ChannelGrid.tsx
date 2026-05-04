// src/components/ChannelGrid.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { EnrichedChannel, Country, Category, Language } from '@/lib/data';
import ChannelCard from '@/components/ui/ChannelCard';
import SearchBar from '@/components/filters/SearchBar';
import FilterDropdown from '@/components/filters/FilterDropdown';
import PlayableToggle from '@/components/filters/PlayableToggle';

interface ChannelGridProps {
  channels: EnrichedChannel[];
  countries: Country[];
  categories: Category[];
  languages: Language[];
  playableOnly: boolean;
  playableChannelCount: number;
}

export default function ChannelGrid({
  channels,
  countries,
  categories,
  languages,
  playableOnly,
  playableChannelCount,
}: ChannelGridProps) {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';
  const selectedCountry = searchParams.get('country') || '';
  const selectedCategory = searchParams.get('category') || '';
  const selectedLanguage = searchParams.get('language') || '';

  const filteredChannels = channels.filter((channel) => {
    const nameMatch = channel.name.toLowerCase().includes(query.toLowerCase());
    const countryMatch = selectedCountry ? channel.country === selectedCountry : true;
    const categoryMatch = selectedCategory ? channel.categories.includes(selectedCategory) : true;
    const languageMatch = selectedLanguage ? channel.languages.includes(selectedLanguage) : true;
    return nameMatch && countryMatch && categoryMatch && languageMatch;
  });

  const countryOptions = countries.map((c) => ({ value: c.code, label: `${c.flag} ${c.name}` }));
  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }));
  const languageOptions = languages.map((l) => ({ value: l.code, label: l.name }));

  return (
    <div>
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        <SearchBar />
        <FilterDropdown options={countryOptions} placeholder="All Countries" paramName="country" />
        <FilterDropdown options={categoryOptions} placeholder="All Categories" paramName="category" />
        <FilterDropdown options={languageOptions} placeholder="All Languages" paramName="language" />
        <PlayableToggle playableCount={playableChannelCount} />
      </div>

      <p className="mb-4 text-sm text-gray-400">
        Showing {filteredChannels.length} channel{filteredChannels.length === 1 ? '' : 's'}
        {playableOnly ? ' with verified playable streams' : ' from the full catalog'}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {filteredChannels.map((channel) => (
          <ChannelCard key={channel.id} channel={channel} />
        ))}
      </div>
    </div>
  );
}
