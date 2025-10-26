// src/components/StreamPlayer.tsx
'use client';

import { EnrichedChannel } from '@/lib/data';
import VideoPlayer from '@/components/ui/VideoPlayer';

interface StreamPlayerProps {
  channel: EnrichedChannel;
}

export default function StreamPlayer({ channel }: StreamPlayerProps) {
  const streamUrl = channel.streams[0]?.url;

  return (
    <div>
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
    </div>
  );
}
