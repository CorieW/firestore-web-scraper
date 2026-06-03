import { vi, beforeEach, afterEach } from 'vitest'

// Global console suppression
let originalConsole: {
  log: typeof console.log
  error: typeof console.error
  warn: typeof console.warn
  info: typeof console.info
  debug: typeof console.debug
}

beforeEach(() => {
  // Store original console methods
  originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info,
    debug: console.debug,
  }

  // Suppress all console output during tests
  console.log = () => {}
  console.error = () => {}
  console.warn = () => {}
  console.info = () => {}
  console.debug = () => {}
})

afterEach(() => {
  // Restore original console methods
  console.log = originalConsole.log
  console.error = originalConsole.error
  console.warn = originalConsole.warn
  console.info = originalConsole.info
  console.debug = originalConsole.debug
})

// Global Firebase logger mock
vi.mock('firebase-functions/logger', () => ({
  warn: vi.fn(),
  info: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
}))

// Global Firebase Functions v1 logger mock (for compatibility)
vi.mock('firebase-functions/v1', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))
