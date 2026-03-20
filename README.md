# TVOnline

Website untuk menonton channel TV dari berbagai negara dengan antarmuka modern berbasis web.

## Overview

`TVOnline` adalah proyek front-end berbasis Next.js yang menampilkan daftar channel IPTV dan memungkinkan pengguna memfilter channel berdasarkan negara, kategori, dan bahasa sebelum memutar stream langsung di browser.

Repository ini saat ini berpusat pada aplikasi utama yang berada di folder:

- `iptv-super-website/`

## Highlights

- katalog channel IPTV dalam tampilan grid
- filter berdasarkan negara, kategori, dan bahasa
- pencarian channel
- video playback langsung di browser
- UI modern berbasis Next.js + React + TypeScript

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- HLS.js

## Project Structure

```text
TVOnline/
├── iptv-super-website/
│   ├── src/app/
│   ├── src/components/
│   ├── src/lib/
│   └── package.json
└── README.md
```

## Local Development

Masuk ke folder aplikasi utama:

```bash
cd iptv-super-website
npm install
npm run dev
```

Buka:

```text
http://localhost:3000
```

## Key Files

- `iptv-super-website/src/app/page.tsx` - halaman utama aplikasi
- `iptv-super-website/src/components/ChannelGrid.tsx` - tampilan grid channel
- `iptv-super-website/src/components/StreamPlayer.tsx` - logic pemutaran stream
- `iptv-super-website/src/lib/data.ts` - data enrichment / pengolahan data channel

## Notes

- README root ini difokuskan untuk menjelaskan gambaran besar repo.
- Dokumentasi teknis aplikasi Next.js ada juga di `iptv-super-website/README.md`.

## Status

Project ini cocok dijadikan dasar untuk eksplorasi IPTV web app, filtering channel, dan browser-based streaming UI.
