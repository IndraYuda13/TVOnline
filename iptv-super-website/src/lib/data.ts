// src/lib/data.ts
const API_BASE_URL = 'https://iptv-org.github.io/api';

export interface Channel {
  id: string;
  name: string;
  alt_names?: string[];
  network?: string;
  owners?: string[];
  country: string;
  subdivision?: string;
  city?: string;
  broadcast_area: string[];
  languages: string[];
  categories: string[];
  is_nsfw: boolean;
  launched?: string;
  closed?: string;
  replaced_by?: string;
  website?: string;
  logo?: string;
}

export interface Stream {
  channel: string;
  url: string;
  user_agent?: string;
  quality?: string;
  referrer?: string;
  title?: string;
}

export interface Country {
  name: string;
  code: string;
  languages: string[];
  flag: string;
}

export interface Language {
  name: string;
  code: string;
}

export interface Category {
  id: string;
  name: string;
}

async function fetchFromApi<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/${endpoint}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export const getChannels = () => fetchFromApi<Channel[]>('channels.json');
export const getStreams = () => fetchFromApi<Stream[]>('streams.json');
export const getCountries = () => fetchFromApi<Country[]>('countries.json');
export const getLanguages = () => fetchFromApi<Language[]>('languages.json');
export const getCategories = () => fetchFromApi<Category[]>('categories.json');

export interface EnrichedChannel extends Channel {
  streams: Stream[];
}

export async function getEnrichedChannels(): Promise<EnrichedChannel[]> {
  const [channels, streams] = await Promise.all([
    getChannels(),
    getStreams(),
  ]);

  const streamsByChannel = new Map<string, Stream[]>();
  for (const stream of streams) {
    if (stream.channel) {
      if (!streamsByChannel.has(stream.channel)) {
        streamsByChannel.set(stream.channel, []);
      }
      streamsByChannel.get(stream.channel)!.push(stream);
    }
  }

  return channels
    .map((channel) => ({
      ...channel,
      streams: streamsByChannel.get(channel.id) || [],
    }))
    .filter((channel) => channel.streams.length > 0);
}
