# IPTV Super Website

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js)](./package.json)
[![React](https://img.shields.io/badge/React-19-149eca?logo=react)](./package.json)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](./package.json)
[![Lint](https://img.shields.io/badge/lint-ESLint-4b32c3?logo=eslint)](./eslint.config.mjs)

Frontend application for the `TVOnline` repository. This Next.js app fetches public IPTV metadata, presents a searchable/filterable channel catalog, and plays compatible streams inside the browser.

## Features

- channel grid browsing
- country, category, and language filters
- search across available channels
- browser-based stream playback
- React + TypeScript UI with Next.js App Router

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- ESLint 9
- HLS.js

## Requirements

- Node.js 20+ recommended
- npm 10+ recommended

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Available Scripts

```bash
npm run dev     # start local dev server
npm run build   # production build check
npm run start   # serve production build
npm run lint    # lint the codebase
```

## Source Layout

```text
src/
├── app/                 # app router entry points
├── components/          # UI, filter, and player components
└── lib/                 # data fetching and enrichment helpers
```

## Main Entry Points

- `src/app/page.tsx`
- `src/components/ChannelGrid.tsx`
- `src/components/StreamPlayer.tsx`
- `src/lib/data.ts`

## Data Dependency

This app consumes public data from `https://iptv-org.github.io/api`.

If the upstream API is unavailable, rate-limited, changed, or a stream goes offline, parts of the UI may degrade or playback may fail.

## Notes

- this folder contains the main application inside the parent `TVOnline` repository
- no local `.env` file is required for the current implementation
- no screenshot assets are committed in this repo yet
- repository-level release notes live in `../CHANGELOG.md`
- repository reuse terms are intentionally restricted in `../LICENSE.md`
