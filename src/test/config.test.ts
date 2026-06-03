import { describe, expect, it } from 'vitest'
import { resolveConfig } from '../config'
import { LogLevel } from '../logger'
import { validateConfig } from '../validation/config-validation'

describe('Config Validation', () => {
  it('should resolve the default config', () => {
    expect(resolveConfig()).toMatchObject({
      location: 'us-central1',
      database: '(default)',
      scrapeCollection: 'scraping',
      logLevel: LogLevel.INFO,
      fetchTimeoutMs: 5000,
    })
  })

  it('should accept a nested collection path with parent wildcards', () => {
    expect(() =>
      resolveConfig({
        scrapeCollection: 'users/{userId}/scraping',
      })
    ).not.toThrow()
  })

  it('should accept named Firestore database IDs', () => {
    expect(() =>
      resolveConfig({
        database: 'app-database1',
      })
    ).not.toThrow()
  })

  it('should reject non-object config input', () => {
    expect(() => resolveConfig(null as any)).toThrow('Config must be provided as an object')
  })

  it('should reject document paths for scrapeCollection', () => {
    expect(() =>
      resolveConfig({
        scrapeCollection: 'users/{userId}',
      })
    ).toThrow("Config scrape collection ('scrapeCollection') must point to a collection path")
  })

  it('should reject paths with leading slashes', () => {
    expect(() =>
      resolveConfig({
        scrapeCollection: '/scraping',
      })
    ).toThrow("Config scrape collection ('scrapeCollection') cannot start or end with '/'")
  })

  it('should reject paths with empty segments', () => {
    expect(() =>
      resolveConfig({
        scrapeCollection: 'users//scraping',
      })
    ).toThrow("Config path ('scrapeCollection') cannot contain empty path segments")
  })

  it('should reject invalid wildcard syntax', () => {
    expect(() =>
      resolveConfig({
        scrapeCollection: 'users/{bad-wildcard}/scraping',
      })
    ).toThrow(
      "Config path ('scrapeCollection') contains an invalid wildcard segment '{bad-wildcard}'"
    )
  })

  it('should reject duplicate wildcard names', () => {
    expect(() =>
      resolveConfig({
        scrapeCollection: 'accounts/{id}/users/{id}/scraping',
      })
    ).toThrow("Config path ('scrapeCollection') contains duplicate wildcard 'id'")
  })

  it('should reject reserved Firestore ID segments', () => {
    expect(() =>
      resolveConfig({
        scrapeCollection: '__bad__/scraping/tasks',
      })
    ).toThrow("Config path ('scrapeCollection') cannot contain reserved '__.*__' segments")
  })

  it('should reject invalid log levels', () => {
    expect(() =>
      resolveConfig({
        logLevel: 'verbose',
      })
    ).toThrow("Invalid config log level ('logLevel'): 'verbose'")
  })

  it('should reject invalid fetch timeouts', () => {
    expect(() =>
      resolveConfig({
        fetchTimeoutMs: 0,
      })
    ).toThrow("Config fetch timeout ('fetchTimeoutMs') must be provided as a positive integer")
  })

  it('should reject invalid locations', () => {
    expect(() =>
      resolveConfig({
        location: 'central',
      })
    ).toThrow("Config location ('location') must be a valid Firebase Functions region")
  })

  it('should reject invalid database IDs', () => {
    expect(() =>
      resolveConfig({
        database: '-database',
      })
    ).toThrow("Config database ('database') must be '(default)'")
  })

  it('should reject uppercase database IDs', () => {
    expect(() =>
      resolveConfig({
        database: 'AppDatabase',
      })
    ).toThrow("Config database ('database') must be '(default)'")
  })

  it('should reject UUID-like database IDs', () => {
    expect(() =>
      resolveConfig({
        database: 'f47ac10b-58cc-0372-8567-0e02b2c3d479',
      })
    ).toThrow("Config database ('database') must be '(default)'")
  })

  it('should reject reserved runtime option overrides', () => {
    expect(() =>
      resolveConfig({
        runtimeOptions: {
          document: 'other/{docId}',
        } as any,
      })
    ).toThrow(
      "Config runtime options ('runtimeOptions') cannot include reserved Firestore trigger options: document"
    )
  })

  it('should reject non-object runtime options', () => {
    expect(() =>
      validateConfig({
        ...resolveConfig(),
        runtimeOptions: [] as any,
      })
    ).toThrow("Config runtime options ('runtimeOptions') must be provided as an object")
  })
})
