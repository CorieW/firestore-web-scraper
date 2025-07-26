import { Query } from './Query'

// These are used for dynamic logging where the key of a property is output
export const URL_KEY = 'url'
export const QUERIES_KEY = 'queries'

export interface Template {
  [URL_KEY]?: string // The target URL for the task.
  [QUERIES_KEY]?: Query[] // Element queries to run on the page html to extract data.
}
