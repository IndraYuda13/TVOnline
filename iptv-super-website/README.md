# IPTV Super Website

Next.js application for browsing and streaming IPTV channels in the browser.

## Features

- channel grid display
- country, category, and language filters
- search support
- browser-based streaming playback
- modern UI with React + TypeScript

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- HLS.js

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

## Source Layout

```text
src/
├── app/
├── components/
└── lib/
```

## Main Entry Points

- `src/app/page.tsx`
- `src/components/ChannelGrid.tsx`
- `src/components/StreamPlayer.tsx`
- `src/lib/data.ts`

## Notes

This folder is the main application inside the parent `TVOnline` repository.
