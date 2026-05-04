import { NextRequest } from 'next/server';
import { getChannelById } from '@/lib/data';
import { getPlayableChannelCache } from '@/lib/playable-cache';
import {
  decodeProxyStreamTarget,
  DEFAULT_PROXY_USER_AGENT,
  ProxyStreamTarget,
  rewriteManifestLine,
} from '@/lib/stream-proxy';

export const dynamic = 'force-dynamic';

function isManifestResponse(response: Response): boolean {
  const contentType = (response.headers.get('content-type') || '').toLowerCase();

  return contentType.includes('mpegurl') || /\.m3u8($|[?#])/i.test(response.url);
}

function buildUpstreamHeaders(request: NextRequest, target: ProxyStreamTarget): Headers {
  const headers = new Headers({
    Accept: '*/*',
    'User-Agent': target.userAgent || DEFAULT_PROXY_USER_AGENT,
  });

  if (target.referrer) {
    headers.set('Referer', target.referrer);
  }

  const range = request.headers.get('range');
  if (range) {
    headers.set('Range', range);
  }

  return headers;
}

function buildPassthroughHeaders(upstreamResponse: Response, isManifest: boolean): Headers {
  const headers = new Headers();

  for (const name of ['content-type', 'content-length', 'content-range', 'accept-ranges', 'cache-control']) {
    const value = upstreamResponse.headers.get(name);
    if (value) {
      headers.set(name, value);
    }
  }

  if (isManifest && !headers.get('content-type')) {
    headers.set('content-type', 'application/vnd.apple.mpegurl; charset=utf-8');
  }

  if (!headers.get('cache-control')) {
    headers.set('cache-control', 'no-store');
  }

  return headers;
}

async function resolveRequestedTarget(request: NextRequest): Promise<ProxyStreamTarget | null> {
  const channelId = request.nextUrl.searchParams.get('channelId');
  if (channelId) {
    const [channel, playableCache] = await Promise.all([
      getChannelById(channelId),
      getPlayableChannelCache(),
    ]);

    if (!channel) {
      return null;
    }

    const fallbackStream = channel.streams.find((stream) => /^https?:/i.test(stream.url));

    return (
      playableCache.preferredStreamTargetsByChannelId[channelId] ||
      (fallbackStream
        ? {
            url: fallbackStream.url,
            referrer: fallbackStream.referrer,
            userAgent: fallbackStream.user_agent,
          }
        : null)
    );
  }

  const token = request.nextUrl.searchParams.get('token');
  return token ? decodeProxyStreamTarget(token) : null;
}

export async function GET(request: NextRequest) {
  const target = await resolveRequestedTarget(request);

  if (!target) {
    return new Response('Stream target not found.', { status: 404 });
  }

  let upstreamResponse: Response;

  try {
    upstreamResponse = await fetch(target.url, {
      method: 'GET',
      headers: buildUpstreamHeaders(request, target),
      redirect: 'follow',
      cache: 'no-store',
    });
  } catch {
    return new Response('Failed to reach upstream stream.', { status: 502 });
  }

  if (!upstreamResponse.ok) {
    return new Response(`Upstream stream returned ${upstreamResponse.status}.`, {
      status: upstreamResponse.status,
    });
  }

  if (isManifestResponse(upstreamResponse)) {
    const manifestText = await upstreamResponse.text();

    if (manifestText.toLowerCase().includes('#extm3u')) {
      const rewrittenManifest = manifestText
        .split(/\r?\n/)
        .map((line) => rewriteManifestLine(line, upstreamResponse.url, target))
        .join('\n');

      return new Response(rewrittenManifest, {
        status: 200,
        headers: buildPassthroughHeaders(upstreamResponse, true),
      });
    }

    return new Response(manifestText, {
      status: 200,
      headers: buildPassthroughHeaders(upstreamResponse, true),
    });
  }

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: buildPassthroughHeaders(upstreamResponse, false),
  });
}
