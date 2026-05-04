import { promises as fs } from 'node:fs';
import path from 'node:path';
import { normalizeProxyStreamTarget, ProxyStreamTarget } from '@/lib/stream-proxy';

export interface PlayableChannelCache {
  mode: string | null;
  generatedAt: string | null;
  checkedChannelCount: number;
  playableChannelCount: number;
  playableChannelIds: string[];
  preferredStreamTargetsByChannelId: Record<string, ProxyStreamTarget>;
}

const DEFAULT_CACHE: PlayableChannelCache = {
  mode: null,
  generatedAt: null,
  checkedChannelCount: 0,
  playableChannelCount: 0,
  playableChannelIds: [],
  preferredStreamTargetsByChannelId: {},
};

export async function getPlayableChannelCache(): Promise<PlayableChannelCache> {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'playable-channel-cache.json');
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw) as Partial<PlayableChannelCache> & {
      preferredStreamUrlsByChannelId?: Record<string, string>;
    };

    return {
      mode: typeof parsed.mode === 'string' ? parsed.mode : null,
      generatedAt: typeof parsed.generatedAt === 'string' ? parsed.generatedAt : null,
      checkedChannelCount: typeof parsed.checkedChannelCount === 'number' ? parsed.checkedChannelCount : 0,
      playableChannelCount: typeof parsed.playableChannelCount === 'number' ? parsed.playableChannelCount : 0,
      playableChannelIds: Array.isArray(parsed.playableChannelIds)
        ? parsed.playableChannelIds.filter((value): value is string => typeof value === 'string')
        : [],
      preferredStreamTargetsByChannelId: Object.fromEntries(
        [
          ...(parsed.preferredStreamTargetsByChannelId && typeof parsed.preferredStreamTargetsByChannelId === 'object'
            ? Object.entries(parsed.preferredStreamTargetsByChannelId)
            : []),
          ...(parsed.preferredStreamUrlsByChannelId && typeof parsed.preferredStreamUrlsByChannelId === 'object'
            ? Object.entries(parsed.preferredStreamUrlsByChannelId).map(([key, value]) => [key, { url: value }])
            : []),
        ].flatMap(([key, value]) => {
          const normalized = normalizeProxyStreamTarget(value);
          return normalized ? [[key, normalized]] : [];
        }),
      ),
    };
  } catch {
    return DEFAULT_CACHE;
  }
}
