import { logger } from './logger'
import { Queriable } from './types/Queriable'

const DEFAULT_FETCH_TIMEOUT_MS = 5000

function resolveFetchTimeoutMs(fetchTimeoutMs: number): number {
  return Number.isFinite(fetchTimeoutMs) && fetchTimeoutMs > 0
    ? fetchTimeoutMs
    : DEFAULT_FETCH_TIMEOUT_MS
}

async function fetchHtml(url: string, fetchTimeoutMs: number): Promise<string> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), resolveFetchTimeoutMs(fetchTimeoutMs))

  try {
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) {
      throw new Error(`Network error: ${response.status} ${response.statusText}`)
    }
    const html = await response.text()
    return html
  } catch (error) {
    logger.error('Error fetching HTML:', error)
    throw error
  } finally {
    clearTimeout(timeout)
  }
}

export async function sendHttpRequestTo(
  url: string,
  fetchTimeoutMs = DEFAULT_FETCH_TIMEOUT_MS
): Promise<Queriable> {
  // Send the HTTP request
  const response = await fetchHtml(url, fetchTimeoutMs)

  // Return the Queriable object
  return new Queriable(response)
}
