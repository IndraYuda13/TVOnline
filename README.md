# TVOnline

[![Repository](https://img.shields.io/badge/repo-TVOnline-181717?logo=github)](https://github.com/IndraLawliet13/TVOnline)
[![App](https://img.shields.io/badge/app-Next.js%2016-000000?logo=next.js)](./iptv-super-website)
[![React](https://img.shields.io/badge/react-19-149eca?logo=react)](./iptv-super-website/package.json)
[![TypeScript](https://img.shields.io/badge/language-TypeScript-3178c6?logo=typescript&logoColor=white)](./iptv-super-website)
[![CI](https://img.shields.io/github/actions/workflow/status/IndraLawliet13/TVOnline/nextjs-ci.yml?branch=feature-iptv-super-website&label=ci)](https://github.com/IndraLawliet13/TVOnline/actions/workflows/nextjs-ci.yml)
[![Status](https://img.shields.io/badge/status-portfolio%20showcase-7c3aed)](https://github.com/IndraLawliet13/TVOnline)

TVOnline is a portfolio-ready IPTV web application built with Next.js. It focuses on browsing public channel metadata, filtering large channel lists, and playing compatible streams directly in the browser with a clean modern UI.

## Overview

This repository currently ships one main app:

- `iptv-super-website/` - the Next.js frontend

The project consumes public IPTV metadata from the `iptv-org` dataset and turns it into a browser experience with filtering, search, and in-page playback.

## Highlights

- modern web UI for browsing IPTV channels
- filtering by country, category, and language
- quick search across channel names
- in-browser playback flow for available streams
- server-side data preparation with TypeScript
- portfolio-friendly structure with dedicated app and docs

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- ESLint 9
- HLS.js

## Repository Structure

```text
TVOnline/
├── .github/workflows/         # GitHub Actions CI
├── docs/
│   └── QUICKSTART.md          # copy-pasteable local setup
├── iptv-super-website/        # main Next.js application
│   ├── src/app/
│   ├── src/components/
│   ├── src/lib/
│   └── package.json
└── README.md
```

## Quick Start

```bash
git clone https://github.com/IndraLawliet13/TVOnline.git
cd TVOnline/iptv-super-website
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

For a slightly more guided setup flow, see [`docs/QUICKSTART.md`](./docs/QUICKSTART.md).

## Key Files

- `iptv-super-website/src/app/page.tsx` - homepage and main app composition
- `iptv-super-website/src/components/ChannelGrid.tsx` - channel browsing and filtering UI
- `iptv-super-website/src/components/StreamPlayer.tsx` - stream playback wrapper
- `iptv-super-website/src/lib/data.ts` - IPTV data fetching and enrichment layer
- `.github/workflows/nextjs-ci.yml` - build and lint validation on GitHub Actions

## Data Source and Scope

The app currently fetches public channel, stream, logo, country, language, and category data from:

- `https://iptv-org.github.io/api`

This repository is focused on the frontend application layer. Runtime data quality, stream availability, and channel legality vary by upstream source and region.

## Public-safe Packaging Note

This public repository is intentionally scoped to source code and project documentation only.

It does **not** include:

- private deployment configs
- production logs
- browser/session state
- secrets or environment-specific credentials

## Limitations

- stream availability depends on external upstream sources
- some channels may be geo-restricted or unavailable at playback time
- no screenshot/demo asset is included yet in this repo
- no deployment config is documented yet

## License Status

A formal open-source license file is **not** included yet.

That means reuse terms are currently not explicitly granted. If this repo is intended to be broadly reusable, adding a deliberate LICENSE file should be the next cleanup step rather than guessing one blindly.

## Branch / Default Branch Note

The current default branch is `feature-iptv-super-website`. The codebase is usable as-is, but a future branch presentation cleanup to a standard default branch name such as `main` would make the repo look more polished.
