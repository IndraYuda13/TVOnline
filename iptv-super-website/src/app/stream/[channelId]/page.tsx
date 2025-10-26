// src/app/stream/[channelId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getEnrichedChannels, EnrichedChannel } from '@/lib/data';
import VideoPlayer from '@/components/ui/VideoPlayer';

export default function StreamPage({ params }: { params: { channelId: string } }) {
  const [channel, setChannel] = useState<EnrichedChannel | null>(null);
  const [loading, setLoading] = useState(true);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchChannel() {
      const channels = await getEnrichedChannels();
      const foundChannel = channels.find((c) => c.id === params.channelId);
      setChannel(foundChannel || null);
      if (foundChannel && foundChannel.streams.length > 0) {
        setStreamUrl(foundChannel.streams[0].url);
      }
      setLoading(false);
    }
    fetchChannel();
  }, [params.channelId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading channel...</p>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Channel not found.</p>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">{channel.name}</h1>
      <div className="aspect-w-16 aspect-h-9 mb-8">
        {streamUrl ? (
          <VideoPlayer src={streamUrl} />
        ) : (
          <div className="flex justify-center items-center bg-black">
            <p>No stream available for this channel.</p>
          </div>
        )}
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-2">Details</h2>
        <p>
          <strong>Country:</strong> {channel.country}
        </p>
        <p>
          <strong>Categories:</strong> {channel.categories.join(', ')}
        </p>
        <p>
          <strong>Languages:</strong> {channel.languages.join(', ')}
        </p>
        {channel.website && (
          <p>
            <strong>Website:</strong>{' '}
            <a href={channel.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
              {channel.website}
            </a>
          </p>
        )}
      </div>
    </main>
  );
}
