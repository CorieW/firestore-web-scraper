import { DocumentOptions } from 'firebase-functions/v2/firestore'

import { LogLevel } from '../logger'

export type RuntimeOptions = Omit<
  DocumentOptions,
  | 'document'
  | 'database'
  | 'namespace'
  | 'region'
  | 'eventType'
  | 'eventFilters'
  | 'eventFilterPathPatterns'
>

export interface Config {
  location: string
  database: string
  scrapeCollection: string
  logLevel: LogLevel | string
  fetchTimeoutMs: number
  runtimeOptions?: RuntimeOptions
  eventarcChannel?: string
  selectedEvents?: string
}

export type FirestoreWebScraperConfig = Partial<Config>
