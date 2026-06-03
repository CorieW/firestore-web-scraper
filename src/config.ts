import { LogLevel } from './logger'
import { Config, FirestoreWebScraperConfig } from './types/Config'
import { validateConfig } from './validation/config-validation'

export const defaultConfig: Config = {
  location: 'us-central1',
  database: '(default)',
  scrapeCollection: 'scraping',
  logLevel: LogLevel.INFO,
  fetchTimeoutMs: 5000,
}

export function resolveConfig(config: FirestoreWebScraperConfig = {}): Config {
  if (config === null || typeof config !== 'object' || Array.isArray(config)) {
    throw new Error('Config must be provided as an object')
  }

  const providedConfig = Object.fromEntries(
    Object.entries(config).filter(([, value]) => value !== undefined)
  )

  const resolvedConfig = { ...defaultConfig, ...providedConfig }
  validateConfig(resolvedConfig)

  return resolvedConfig
}
