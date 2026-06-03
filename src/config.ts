import { LogLevel } from './logger'
import { Config, FirestoreWebScraperConfig } from './types/Config'

export const defaultConfig: Config = {
  location: 'us-central1',
  database: '(default)',
  scrapeCollection: 'scraping',
  logLevel: LogLevel.INFO,
  fetchTimeoutMs: 5000,
}

export function resolveConfig(config: FirestoreWebScraperConfig = {}): Config {
  const providedConfig = Object.fromEntries(
    Object.entries(config).filter(([, value]) => value !== undefined)
  )

  return { ...defaultConfig, ...providedConfig }
}
