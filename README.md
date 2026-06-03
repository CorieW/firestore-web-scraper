<p align="center">
  <img src="banner.png" alt="banner" height="275"/>
</p>

<hr/>

[![codecov](https://codecov.io/gh/CorieW/firestore-web-scraper/graph/badge.svg?token=6UIM5NKLR0)](https://codecov.io/gh/CorieW/firestore-web-scraper)

## 📝 About

This package allows you to automate web scraping tasks using Firestore. Simply add a document to a designated Firestore collection describing the website to scrape and the data to extract. The function will process the task, perform the scraping, and update the document with the results, all managed directly from Firestore.

## ✨ Features

- Scrape websites using Firestore documents.
- Use multiple selectors to extract data.
- Extract data from the HTML, innerHTML, text, or attribute of an element.
- Extract as much data as you like from a single Firestore document.

## 🚀 Usage

Install the package in your Firebase Functions project and export the provided function from your Functions entry point:

```bash
pnpm add firestore-web-scraper
```

```ts
import firestoreWebScraper from 'firestore-web-scraper'

const config = {
  location: 'us-central1',
  database: '(default)',
  scrapeCollection: 'scraping',
  logLevel: 'info',
  fetchTimeoutMs: 5000,
  runtimeOptions: {
    timeoutSeconds: 120,
    memory: '512MiB',
    maxInstances: 10,
  },
}

export const processQueue = firestoreWebScraper(config)
```

Create a document in the configured `SCRAPE_COLLECTION`:

```ts
{
  url: 'https://example.com',
  queries: [
    {
      id: 'heading',
      type: 'selector',
      value: 'h1',
      target: 'text'
    }
  ]
}
```

## 🛠️ Configuration

| Config property    | Default       | Description                                                                                                                   |
| ------------------ | ------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `location`         | `us-central1` | Cloud Functions trigger region.                                                                                               |
| `database`         | `(default)`   | Firestore database ID.                                                                                                        |
| `scrapeCollection` | `scraping`    | Collection path containing scraping task documents.                                                                           |
| `logLevel`         | `info`        | Logger level: `debug`, `info`, `warn`, `error`, or `silent`.                                                                  |
| `fetchTimeoutMs`   | `5000`        | Maximum time to wait for a scrape HTTP request before aborting.                                                               |
| `runtimeOptions`   | `{}`          | Firebase v2 runtime/event options such as `timeoutSeconds`, `memory`, `minInstances`, `maxInstances`, `secrets`, and `retry`. |

See the [docs](./docs) for deployment, permissions, configuration, and Firestore task details.

Deploy your functions as usual:

```bash
firebase deploy --only functions
```

## 📦 Releasing

This package uses Changesets. Add a changeset for user-facing changes:

```bash
pnpm changeset
```

The release workflow can be run manually from GitHub Actions. It opens or updates a version PR, and publishes to npm after that PR is merged.

## 🤝 Contributing

Contributions are always welcome! If you have an idea for a new feature or a bug fix, please open an issue first to discuss the changes.
