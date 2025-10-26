// src/components/ui/ChannelCard.tsx
import { EnrichedChannel } from '@/lib/data';
import Link from 'next/link';

interface ChannelCardProps {
  channel: EnrichedChannel;
}

export default function ChannelCard({ channel }: ChannelCardProps) {
  return (
    <Link href={`/stream/${channel.id}`}>
      <div className="group relative block overflow-hidden rounded-lg bg-gray-800 shadow-lg transition-transform duration-300 ease-in-out hover:scale-105">
        <div className="aspect-w-16 aspect-h-9">
          <img
            src={channel.logo}
            alt={channel.name}
            className="h-full w-full object-contain p-4 transition-opacity duration-300 ease-in-out group-hover:opacity-75"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150';
            }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100"></div>
        <div className="absolute bottom-0 left-0 p-4">
          <h3 className="text-lg font-bold text-white opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100">
            {channel.name}
          </h3>
        </div>
      </div>
    </Link>
  );
}
