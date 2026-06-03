import { LogLevel } from '../logger'
import { Config } from '../types/Config'

const FUNCTIONS_REGION_PATTERN = /^[a-z]+(?:-[a-z]+)*-[a-z]+[0-9]+$/
const DATABASE_ID_PATTERN = /^(?:\(default\)|[a-z](?:[a-z0-9-]{2,61}[a-z0-9])?)$/
const DATABASE_UUID_PATTERN = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/
const WILDCARD_SEGMENT_PATTERN = /^\{([A-Za-z_][A-Za-z0-9_]*)(=\*)?\}$/
const RESERVED_RUNTIME_OPTIONS = [
  'document',
  'database',
  'namespace',
  'region',
  'eventType',
  'eventFilters',
  'eventFilterPathPatterns',
]

export function validateConfig(config: Config): void {
  validateLocation(config.location)
  validateDatabase(config.database)
  validateScrapeCollection(config.scrapeCollection)
  validateLogLevel(config.logLevel)
  validateFetchTimeoutMs(config.fetchTimeoutMs)
  validateRuntimeOptions(config.runtimeOptions)
  validateOptionalString(config.eventarcChannel, 'eventarcChannel')
  validateOptionalString(config.selectedEvents, 'selectedEvents')
}

function validateLocation(location: Config['location']): void {
  if (typeof location !== 'string') {
    throw new Error("Config location ('location') must be provided as a string")
  }

  if (!FUNCTIONS_REGION_PATTERN.test(location)) {
    throw new Error(
      `Config location ('location') must be a valid Firebase Functions region, such as 'us-central1'`
    )
  }
}

function validateDatabase(database: Config['database']): void {
  if (typeof database !== 'string') {
    throw new Error("Config database ('database') must be provided as a string")
  }

  if (!DATABASE_ID_PATTERN.test(database) || DATABASE_UUID_PATTERN.test(database)) {
    throw new Error(
      `Config database ('database') must be '(default)' or a valid named Firestore database ID`
    )
  }
}

function validateScrapeCollection(scrapeCollection: Config['scrapeCollection']): void {
  if (typeof scrapeCollection !== 'string') {
    throw new Error("Config scrape collection ('scrapeCollection') must be provided as a string")
  }

  if (!scrapeCollection || scrapeCollection.trim() === '') {
    throw new Error("Config scrape collection ('scrapeCollection') cannot be empty")
  }

  if (scrapeCollection.startsWith('/') || scrapeCollection.endsWith('/')) {
    throw new Error("Config scrape collection ('scrapeCollection') cannot start or end with '/'")
  }

  const segments = scrapeCollection.split('/')

  if (segments.length % 2 === 0) {
    throw new Error("Config scrape collection ('scrapeCollection') must point to a collection path")
  }

  validatePathSegments(segments, 'scrapeCollection')
}

function validatePathSegments(segments: string[], fieldName: string): void {
  const wildcardNames = new Set(['documentId'])

  segments.forEach((segment) => {
    const wildcardMatch = segment.match(WILDCARD_SEGMENT_PATTERN)

    if (wildcardMatch) {
      const wildcardName = wildcardMatch[1]

      if (wildcardNames.has(wildcardName)) {
        throw new Error(
          `Config path ('${fieldName}') contains duplicate wildcard '${wildcardName}'`
        )
      }

      wildcardNames.add(wildcardName)
      return
    }

    validateFirestoreIdSegment(segment, fieldName)
  })
}

function validateFirestoreIdSegment(segment: string, fieldName: string): void {
  if (segment === '') {
    throw new Error(`Config path ('${fieldName}') cannot contain empty path segments`)
  }

  if (segment === '.' || segment === '..') {
    throw new Error(`Config path ('${fieldName}') cannot contain '.' or '..' segments`)
  }

  if (/^__.*__$/.test(segment)) {
    throw new Error(`Config path ('${fieldName}') cannot contain reserved '__.*__' segments`)
  }

  if (/[{}]/.test(segment)) {
    throw new Error(
      `Config path ('${fieldName}') contains an invalid wildcard segment '${segment}'`
    )
  }

  if (new TextEncoder().encode(segment).length > 1500) {
    throw new Error(`Config path ('${fieldName}') cannot contain segments longer than 1,500 bytes`)
  }
}

function validateLogLevel(logLevel: Config['logLevel']): void {
  if (typeof logLevel !== 'string') {
    throw new Error("Config log level ('logLevel') must be provided as a string")
  }

  if (!Object.values(LogLevel).includes(logLevel as LogLevel)) {
    throw new Error(
      `Invalid config log level ('logLevel'): '${logLevel}'. Valid levels are: ${Object.values(LogLevel).join(', ')}`
    )
  }
}

function validateFetchTimeoutMs(fetchTimeoutMs: Config['fetchTimeoutMs']): void {
  if (!Number.isInteger(fetchTimeoutMs) || fetchTimeoutMs <= 0) {
    throw new Error(
      "Config fetch timeout ('fetchTimeoutMs') must be provided as a positive integer"
    )
  }
}

function validateRuntimeOptions(runtimeOptions: Config['runtimeOptions']): void {
  if (runtimeOptions === undefined) {
    return
  }

  if (
    runtimeOptions === null ||
    typeof runtimeOptions !== 'object' ||
    Array.isArray(runtimeOptions)
  ) {
    throw new Error("Config runtime options ('runtimeOptions') must be provided as an object")
  }

  const reservedOptions = RESERVED_RUNTIME_OPTIONS.filter((option) =>
    Object.prototype.hasOwnProperty.call(runtimeOptions, option)
  )

  if (reservedOptions.length > 0) {
    throw new Error(
      `Config runtime options ('runtimeOptions') cannot include reserved Firestore trigger options: ${reservedOptions.join(', ')}`
    )
  }
}

function validateOptionalString(value: string | undefined, fieldName: string): void {
  if (value === undefined) {
    return
  }

  if (typeof value !== 'string') {
    throw new Error(`Config ${fieldName} ('${fieldName}') must be provided as a string`)
  }

  if (value.trim() === '') {
    throw new Error(`Config ${fieldName} ('${fieldName}') cannot be empty`)
  }
}
