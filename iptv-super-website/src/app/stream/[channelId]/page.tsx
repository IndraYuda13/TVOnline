// src/app/stream/[channelId]/page.tsx
import { getChannelById } from '@/lib/data';
import StreamPlayer from '@/components/StreamPlayer';

export default async function StreamPage({ params }: { params: { channelId: string } }) {
  const channel = await getChannelById(params.channelId);

  if (!channel) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Channel not found.</p>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <StreamPlayer channel={channel} />
    </main>
  );
}
