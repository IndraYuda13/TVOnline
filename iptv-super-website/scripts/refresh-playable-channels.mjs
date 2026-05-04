import fs from 'node:fs/promises';

const API_BASE_URL = 'https://iptv-org.github.io/api';
const OUTPUT_PATH = new URL('../src/data/playable-channel-cache.json', import.meta.url);
const CONCURRENCY = Number(process.env.PLAYABLE_CONCURRENCY || '50');
const TIMEOUT_MS = Number(process.env.PLAYABLE_TIMEOUT_MS || '2500');
const STREAMS_PER_CHANNEL = Number(process.env.PLAYABLE_STREAMS_PER_CHANNEL || '5');
const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36';

async function fetchJson(endpoint) {
  const response = await fetch(`${API_BASE_URL}/${endpoint}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint}: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function readSnippet(response) {
  const reader = response.body?.getReader();

  if (!reader) {
    return '';
  }

  try {
    const { value } = await reader.read();
    return new TextDecoder().decode(value ?? new Uint8Array()).toLowerCase();
  } finally {
    try {
      await reader.cancel();
    } catch {
      // ignore cancel failures on already-closed streams
    }
  }
}

async function probeStream(stream) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const headers = {
      Accept: '*/*',
      'User-Agent': stream.user_agent || DEFAULT_USER_AGENT,
    };

    if (stream.referrer) {
      headers.Referer = stream.referrer;
    }

    const response = await fetch(stream.url, {
      method: 'GET',
      redirect: 'follow',
      headers,
      signal: controller.signal,
    });

    if (!response.ok) {
      return false;
    }

    const contentType = (response.headers.get('content-type') || '').toLowerCase();

    if (contentType.includes('text/html') || contentType.includes('application/json')) {
      return false;
    }

    if (
      contentType.includes('mpegurl') ||
      contentType.includes('video/') ||
      contentType.includes('audio/') ||
      contentType.includes('application/octet-stream') ||
      contentType.includes('mp2t') ||
      /\.m3u8($|[?#])/i.test(response.url)
    ) {
      return true;
    }

    const snippet = await readSnippet(response);
    return snippet.includes('#extm3u') || snippet.length > 0;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

async function findPlayableStream(streams) {
  for (const stream of streams.slice(0, STREAMS_PER_CHANNEL)) {
    if (await probeStream(stream)) {
      return {
        url: stream.url,
        referrer: stream.referrer || undefined,
        userAgent: stream.user_agent || undefined,
      };
    }
  }

  return null;
}

async function main() {
  console.log('Fetching IPTV metadata...');

  const [channels, streams] = await Promise.all([
    fetchJson('channels.json'),
    fetchJson('streams.json'),
  ]);

  const streamsByChannel = new Map();
  for (const stream of streams) {
    if (!stream.channel || !stream.url || !/^https?:/i.test(stream.url)) {
      continue;
    }

    if (!streamsByChannel.has(stream.channel)) {
      streamsByChannel.set(stream.channel, []);
    }

    streamsByChannel.get(stream.channel).push(stream);
  }

  const channelsToCheck = channels.filter((channel) => streamsByChannel.has(channel.id));
  const playableIds = new Set();
  const preferredStreamTargetsByChannelId = {};
  let cursor = 0;
  let checked = 0;

  console.log(
    `Checking ${channelsToCheck.length} channels with concurrency=${CONCURRENCY}, timeout=${TIMEOUT_MS}ms, streams_per_channel=${STREAMS_PER_CHANNEL}...`,
  );

  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (true) {
      const currentIndex = cursor;
      cursor += 1;

      if (currentIndex >= channelsToCheck.length) {
        return;
      }

      const channel = channelsToCheck[currentIndex];
      const channelStreams = streamsByChannel.get(channel.id) || [];
      const playableStream = await findPlayableStream(channelStreams);

      checked += 1;
      if (playableStream) {
        playableIds.add(channel.id);
        preferredStreamTargetsByChannelId[channel.id] = playableStream;
      }

      if (checked % 100 === 0 || checked === channelsToCheck.length) {
        console.log(`Progress ${checked}/${channelsToCheck.length}, playable=${playableIds.size}`);
      }
    }
  });

  await Promise.all(workers);

  const playableChannelIds = channelsToCheck
    .filter((channel) => playableIds.has(channel.id))
    .map((channel) => channel.id);

  const output = {
    mode: 'proxy-playable',
    generatedAt: new Date().toISOString(),
    checkedChannelCount: channelsToCheck.length,
    playableChannelCount: playableChannelIds.length,
    playableChannelIds,
    preferredStreamTargetsByChannelId,
  };

  await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`, 'utf8');

  console.log(`Saved ${playableChannelIds.length} playable channels to ${OUTPUT_PATH.pathname}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
