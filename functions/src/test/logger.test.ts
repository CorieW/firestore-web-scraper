import { describe, test, expect, beforeEach, vi } from 'vitest'
import { Logger, LogLevel } from '../logger'
import { logger as funcsLogger } from 'firebase-functions/v1'

// Mock firebase-functions logger functions
vi.mock('firebase-functions/v1', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

describe('Logger', () => {
  let log: Logger

  beforeEach(() => {
    // Create a new instance before each test
    log = new Logger(LogLevel.DEBUG)
    vi.clearAllMocks()
  })

  describe('log level methods', () => {
    test('debug should call funcsLogger.debug when level is DEBUG', () => {
      log.setLogLevel(LogLevel.DEBUG)
      log.debug('debug message')
      expect(funcsLogger.debug).toHaveBeenCalledWith('debug message')
    })

    test('debug should not call funcsLogger.debug when level is INFO', () => {
      log.setLogLevel(LogLevel.INFO)
      log.debug('debug message')
      expect(funcsLogger.debug).not.toHaveBeenCalled()
    })

    test('info should call funcsLogger.info when level is INFO or lower', () => {
      log.setLogLevel(LogLevel.INFO)
      log.info('info message')
      expect(funcsLogger.info).toHaveBeenCalledWith('info message')
    })

    test('warn should call funcsLogger.warn when level is WARN or lower', () => {
      log.setLogLevel(LogLevel.WARN)
      log.warn('warn message')
      expect(funcsLogger.warn).toHaveBeenCalledWith('warn message')
    })

    test('error should call funcsLogger.error when level is ERROR or lower', () => {
      log.setLogLevel(LogLevel.ERROR)
      log.error('error message')
      expect(funcsLogger.error).toHaveBeenCalledWith('error message')
    })

    test('no logging should occur when log level is SILENT', () => {
      log.setLogLevel(LogLevel.SILENT)
      log.debug('debug message')
      log.info('info message')
      log.warn('warn message')
      log.error('error message')
      expect(funcsLogger.debug).not.toHaveBeenCalled()
      expect(funcsLogger.info).not.toHaveBeenCalled()
      expect(funcsLogger.warn).not.toHaveBeenCalled()
      expect(funcsLogger.error).not.toHaveBeenCalled()
    })
  })

  describe('prefix', () => {
    test('should prefix logs with the provided prefix', () => {
      const prefix = 'MyPrefix'
      log = new Logger(LogLevel.DEBUG, prefix)
      log.info('info message')
      expect(funcsLogger.info).toHaveBeenCalledWith(`[${prefix}]:`, 'info message')
    })

    test('should not add a prefix if none is provided', () => {
      log = new Logger(LogLevel.DEBUG)
      log.info('info message')
      expect(funcsLogger.info).toHaveBeenCalledWith('info message')
    })
  })
})
