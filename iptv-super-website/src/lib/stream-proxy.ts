export interface ProxyStreamTarget {
  url: string;
  referrer?: string;
  userAgent?: string;
}

export const DEFAULT_PROXY_USER_AGENT =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36';

export function normalizeProxyStreamTarget(input: unknown): ProxyStreamTarget | null {
  if (!input || typeof input !== 'object') {
    return null;
  }

  const candidate = input as Record<string, unknown>;

  if (typeof candidate.url !== 'string' || !/^https?:/i.test(candidate.url)) {
    return null;
  }

  return {
    url: candidate.url,
    referrer: typeof candidate.referrer === 'string' ? candidate.referrer : undefined,
    userAgent:
      typeof candidate.userAgent === 'string'
        ? candidate.userAgent
        : typeof candidate.user_agent === 'string'
          ? candidate.user_agent
          : undefined,
  };
}

export function encodeProxyStreamTarget(target: ProxyStreamTarget): string {
  return Buffer.from(JSON.stringify(target)).toString('base64url');
}

export function decodeProxyStreamTarget(token: string): ProxyStreamTarget | null {
  try {
    const parsed = JSON.parse(Buffer.from(token, 'base64url').toString('utf8')) as unknown;
    return normalizeProxyStreamTarget(parsed);
  } catch {
    return null;
  }
}

export function buildProxyStreamUrl(params: { channelId?: string; token?: string }): string {
  const searchParams = new URLSearchParams();

  if (params.channelId) {
    searchParams.set('channelId', params.channelId);
  }

  if (params.token) {
    searchParams.set('token', params.token);
  }

  return `/api/proxy?${searchParams.toString()}`;
}

export function rewriteManifestLine(line: string, baseUrl: string, target: ProxyStreamTarget): string {
  const trimmedLine = line.trim();

  if (!trimmedLine) {
    return line;
  }

  if (trimmedLine.startsWith('#')) {
    return line.replace(/URI="([^"]+)"/g, (_match, uri) => {
      const nextTarget: ProxyStreamTarget = {
        url: new URL(uri, baseUrl).toString(),
        referrer: target.referrer,
        userAgent: target.userAgent,
      };

      return `URI="${buildProxyStreamUrl({ token: encodeProxyStreamTarget(nextTarget) })}"`;
    });
  }

  const nextTarget: ProxyStreamTarget = {
    url: new URL(trimmedLine, baseUrl).toString(),
    referrer: target.referrer,
    userAgent: target.userAgent,
  };

  return buildProxyStreamUrl({ token: encodeProxyStreamTarget(nextTarget) });
}

