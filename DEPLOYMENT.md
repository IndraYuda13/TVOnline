# TVOnline deployment note

Date: 2026-04-18

## Objective
Deploy `IndraYuda13/TVOnline` on Rawon and expose it publicly for portfolio screenshots.

## Live result
- Public URL: `https://tvonline.indrayuda.my.id/`
- Local app URL: `http://127.0.0.1:3310/`
- App path: `/root/.openclaw/workspace/projects/TVOnline/iptv-super-website`

## What was done
1. Cloned the repo into `/root/.openclaw/workspace/projects/TVOnline`
2. Installed dependencies with `npm ci`
3. Built the Next.js app with `npm run build`
4. Started the app with `npm start` on port `3310`
5. Added Cloudflare tunnel ingress for `tvonline.indrayuda.my.id -> http://127.0.0.1:3310`
6. Routed DNS for `tvonline.indrayuda.my.id` to tunnel `b66c1298-4272-4138-99da-af993a3fa931`
7. Started a fresh connector using the updated tunnel config

## Important issue found
The hostname initially returned `404/522` because an older connector for the same tunnel was still running with an older ingress config that did not include `tvonline.indrayuda.my.id`.

Fix applied:
- started a fresh connector with the updated config
- stopped the older connector so requests no longer landed on stale ingress rules

## Success oracle
Verified both URLs returned HTTP 200 with the same HTML payload size:
- remote: `https://tvonline.indrayuda.my.id/`
- local: `http://127.0.0.1:3310/`

## Runtime state
- app pid file: `/root/.openclaw/workspace/projects/TVOnline/run/app.pid`
- tunnel pid file: `/root/.openclaw/workspace/projects/TVOnline/run/tvonline-cloudflared.pid`
- app log: `/root/.openclaw/workspace/projects/TVOnline/logs/app.log`
- tunnel log: `/root/.openclaw/workspace/projects/TVOnline/logs/tvonline-cloudflared.log`

## 2026-04-18 debug fix: stream page falsely showed `Channel not found.`
- Symptom:
  - valid channel detail URLs like `/stream/1001Noites.br` opened the detail page but showed `Channel not found.`
  - after fixing that route boundary, the same page then exposed a second failure, `500 Internal Server Error`, on channels whose upstream metadata omitted some array fields
- Evidence:
  - direct request to `http://127.0.0.1:3310/stream/1001Noites.br` reproduced the failure even though `1001Noites.br` is a valid upstream channel id with a stream
  - runtime log showed `TypeError: Cannot read properties of undefined (reading 'join')` inside `StreamPlayer`
  - upstream dataset check showed all streamed channels currently omit `languages` and `broadcast_area` fields in `channels.json`
- Root cause:
  - in Next.js 16 App Router, the page received `params` asynchronously, but `src/app/stream/[channelId]/page.tsx` still read it as a plain object
  - that made `channelId` unavailable at lookup time, so `getChannelById()` searched with the wrong value and returned nothing
  - after that was fixed, the external API boundary still passed through missing array fields unchanged, and the UI later assumed those arrays always existed
- Files touched:
  - `iptv-super-website/src/app/stream/[channelId]/page.tsx`
  - `iptv-super-website/src/lib/data.ts`
  - `CHANGELOG.md`
- Minimal fix:
  - await `params`, then read `channelId` from the resolved object before calling `getChannelById()`
  - normalize upstream fields in `getEnrichedChannels()` so `country`, `broadcast_area`, `languages`, and `categories` are always safe values for the UI
- Do not casually remove:
  - the awaited `params` handling in the stream route. It exists specifically for Next.js 16 App Router compatibility and is required for valid channel detail routing to work
  - the normalization at the API boundary. It exists because the public IPTV dataset is not currently shape-stable for every channel row

## 2026-04-18 feature add: proxy-backed playable mode
- Goal:
  - recover far more working channels than the strict browser-safe subset while still keeping the public HTTPS site clean and usable
- Design choice:
  - use a precomputed proxy-playable snapshot plus a same-origin HLS proxy route instead of sending raw third-party stream URLs directly to the browser
  - reason: many upstream channels fail in the browser not because the VPS cannot reach them, but because of mixed-content, CORS, or upstream header requirements
- Files touched:
  - `iptv-super-website/src/app/page.tsx`
  - `iptv-super-website/src/app/api/proxy/route.ts`
  - `iptv-super-website/src/app/stream/[channelId]/page.tsx`
  - `iptv-super-website/src/components/ChannelGrid.tsx`
  - `iptv-super-website/src/components/filters/PlayableToggle.tsx`
  - `iptv-super-website/src/components/ui/VideoPlayer.tsx`
  - `iptv-super-website/src/lib/playable-cache.ts`
  - `iptv-super-website/src/lib/stream-proxy.ts`
  - `iptv-super-website/src/data/playable-channel-cache.json`
  - `iptv-super-website/scripts/refresh-playable-channels.mjs`
  - `iptv-super-website/scripts/run-playable-refresh.sh`
  - `CHANGELOG.md`
- Proxy-playable rules used by the snapshot:
  - VPS only needs to prove it can fetch the upstream stream with its required headers
  - mixed-content and browser CORS are handled by the local proxy route instead of being used as a filter blocker
  - the first playable stream found within the bounded candidate window is stored as the preferred target for that channel
- Runtime evidence from the latest run:
  - latest snapshot checked `8335` channels and marked `712` as proxy-playable
  - `100NEWS.ua`, which was previously excluded by browser-safe mode, is now back in the filtered homepage list
  - `GET /api/proxy?channelId=100NEWS.ua` returned `200` with an HLS manifest, and the first rewritten segment request also returned `200` with bytes
- Meaning:
  - default homepage now opens in curated playable mode using the proxy-backed snapshot
  - server-rendered HTML for `/` respects that playable subset, so non-playable channels are not shipped first and then hidden later
  - adding `?playable=0` switches back to the full catalog when needed for debugging or exploration
  - stream detail pages now load through `/api/proxy`, so HTTP-only streams and header-sensitive streams can still be served over the site origin
- Do not casually remove:
  - the proxy route, playable snapshot generator, cache loader, or preferred-stream metadata. They now work together as the transport layer that makes the larger playable set viable on the public site

## 2026-04-18 background automation add: hourly playable refresh
- Goal:
  - keep the proxy-playable snapshot reasonably fresh without blocking the current app process or requiring manual rebuilds each time
- Design choice:
  - use a `systemd` timer plus a one-shot wrapper script instead of a permanent busy loop inside the app
  - reason: lower overhead, cleaner recovery after reboot, and easier to inspect with normal service commands
- Files touched:
  - `iptv-super-website/scripts/run-playable-refresh.sh`
  - `iptv-super-website/package.json`
  - `/etc/systemd/system/tvonline-playable-refresh.service`
  - `/etc/systemd/system/tvonline-playable-refresh.timer`
  - `CHANGELOG.md`
- Behavior:
  - timer runs one refresh around every hour in the background
  - refresh uses bounded parallel probing with the existing default concurrency `50`
  - wrapper script uses a lock file so duplicate manual or timer starts do not overlap
  - refresh rewrites the proxy-playable cache file and preferred stream targets without needing to stop the site
- Runtime artifacts:
  - refresh log: `/root/.openclaw/workspace/projects/TVOnline/logs/playable-refresh.log`
  - lock file: `/root/.openclaw/workspace/projects/TVOnline/run/playable-refresh.lock`
  - last success marker: `/root/.openclaw/workspace/projects/TVOnline/run/playable-refresh.last-success`
  - last status marker: `/root/.openclaw/workspace/projects/TVOnline/run/playable-refresh.last-status`

## Related config touched
- `/etc/cloudflared/config-vps-baru.yml`

## Quick restart commands
```bash
cd /root/.openclaw/workspace/projects/TVOnline/iptv-super-website
PORT=3310 HOSTNAME=127.0.0.1 nohup npm start > ../logs/app.log 2>&1 &

nohup cloudflared --no-autoupdate --config /etc/cloudflared/config-vps-baru.yml --metrics 127.0.0.1:20243 tunnel run > /root/.openclaw/workspace/projects/TVOnline/logs/tvonline-cloudflared.log 2>&1 &
```

## Refresh playable snapshot
```bash
cd /root/.openclaw/workspace/projects/TVOnline/iptv-super-website
npm run refresh:playable
npm run build
PORT=3310 HOSTNAME=127.0.0.1 nohup npm start > ../logs/app.log 2>&1 &
```
