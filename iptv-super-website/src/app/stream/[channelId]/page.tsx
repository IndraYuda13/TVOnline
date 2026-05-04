// src/app/stream/[channelId]/page.tsx
import { getChannelById } from '@/lib/data';
import { buildProxyStreamUrl } from '@/lib/stream-proxy';
import StreamPlayer from '@/components/StreamPlayer';

export default async function StreamPage({ params }: { params: Promise<{ channelId: string }> }) {
  const { channelId } = await params;
  const channel = await getChannelById(channelId);

  if (!channel) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Channel not found.</p>
      </div>
    );
  }

  const preferredStreamUrl = channel.streams.length > 0 ? buildProxyStreamUrl({ channelId }) : undefined;

  return (
    <main className="container mx-auto px-4 py-8">
      <StreamPlayer channel={channel} streamUrl={preferredStreamUrl} />
    </main>
  );
}
