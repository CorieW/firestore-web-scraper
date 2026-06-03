# Firestore Web Scraper Example

This is a minimal Firebase Functions project that uses `firestore-web-scraper` from npm.

This repo-local example uses `file:../..` so it can run against the package source in this repository. In your own Firebase project, install the published package in your `functions` directory with:

```bash
cd functions
pnpm add firestore-web-scraper
```

## Setup

```bash
cd functions
pnpm install
cp .env.example .env
```

Update `.env` if you want a different Firestore database, collection, region, or log level.

## Deploy

```bash
cd functions
pnpm deploy
```

## Try It

Create a document in the configured `SCRAPE_COLLECTION` collection:

```json
{
  "url": "https://example.com",
  "queries": [
    {
      "id": "heading",
      "type": "selector",
      "value": "h1",
      "target": "text"
    }
  ]
}
```

The function updates the same document with the extracted `data`, timestamps, and final `stage`.
