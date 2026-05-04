# Changelog

All notable repository-level changes are documented in this file.

## [Unreleased]

### Added
- homepage now includes a default `Playable only` mode that filters the grid to a proxy-backed snapshot of channels the VPS can actively fetch
- `?playable=0` still exposes the full catalog when needed for debugging or exploration
- added `npm run refresh:playable` plus `scripts/refresh-playable-channels.mjs` to regenerate the proxy-playable snapshot from the public IPTV dataset with bounded concurrency and timeout checks
- added a background hourly refresh lane via `scripts/run-playable-refresh.sh` and `tvonline-playable-refresh.timer`, so playable cache updates can run periodically without restarting the site
- added a same-origin HLS proxy route at `src/app/api/proxy/route.ts` so the player can serve HTTP streams, header-sensitive streams, and no-CORS streams through the site origin

### Changed
- homepage filtering now happens on the server for the default playable view, so non-playable channels are not shipped in the first HTML for `/`
- stream detail pages now load through the proxy route and prefer the cached playable target instead of blindly using the first upstream stream entry
- playable cache now stores preferred stream request metadata per channel, so proxy playback can preserve upstream `referrer` and `user-agent` requirements when needed

### Fixed
- Next.js 16 stream detail route now awaits App Router `params` before reading `channelId`, fixing channel detail pages that incorrectly fell back to `Channel not found.` for valid channel IDs
- channel enrichment now normalizes missing upstream arrays like `languages` and `broadcast_area`, preventing stream detail pages from crashing when the public IPTV dataset omits those fields

## [0.1.0] - 2026-03-27

### Added
- explicit no-license notice via `LICENSE.md` to remove reuse ambiguity
- release-ready changelog baseline for the first repository tag

### Changed
- repository docs updated to reflect the `main` default branch target
- README now links the release baseline and points to the explicit license notice

[0.1.0]: https://github.com/IndraLawliet13/TVOnline/releases/tag/v0.1.0
