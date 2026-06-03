import firestoreWebScraper from 'firestore-web-scraper'

const fetchTimeoutMs = process.env.FETCH_TIMEOUT_MS
  ? Number(process.env.FETCH_TIMEOUT_MS)
  : undefined

export const processQueue = firestoreWebScraper({
  location: process.env.LOCATION,
  database: process.env.DATABASE,
  scrapeCollection: process.env.SCRAPE_COLLECTION,
  logLevel: process.env.LOG_LEVEL,
  fetchTimeoutMs,
  runtimeOptions: {
    timeoutSeconds: 120,
    memory: '512MiB',
    maxInstances: 10,
  },
})
