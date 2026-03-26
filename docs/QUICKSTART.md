# QUICKSTART

Minimal local setup for `TVOnline`.

## 1. Clone the repository

```bash
git clone https://github.com/IndraLawliet13/TVOnline.git
cd TVOnline
```

## 2. Enter the app folder

```bash
cd iptv-super-website
```

## 3. Install dependencies

```bash
npm install
```

## 4. Start development mode

```bash
npm run dev
```

## 5. Open the app

```text
http://localhost:3000
```

## Optional validation

Run lint and production build checks:

```bash
npm run lint
npm run build
```

## Notes

- no `.env` file is required for the current version
- channel data is fetched from the public `iptv-org` API
- stream availability depends on upstream source health and region restrictions
