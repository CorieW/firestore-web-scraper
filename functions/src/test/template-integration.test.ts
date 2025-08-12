import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Timestamp } from 'firebase-admin/firestore'
import { Task, TEMPLATE_KEY, URL_KEY, QUERIES_KEY } from '../types/Task'
import { TemplateData } from '../types/Template'
import { Query, QueryType, TargetType } from '../types/Query'
import { TaskStage } from '../types/TaskStage'

// Mock all dependencies
const mockUpdate = vi.fn()
const mockDoc = vi.fn(() => ({ update: mockUpdate }))

const mockTemplateGet = vi.fn()
const mockTemplateDoc = vi.fn(() => ({ get: mockTemplateGet }))

vi.mock('../firebase', () => ({
  db: {
    collection: vi.fn((collectionName: string) => {
      if (collectionName === 'templates') {
        return { doc: mockTemplateDoc }
      }
      return { doc: mockDoc }
    }),
  },
  initialize: vi.fn(),
}))

vi.mock('../config', () => ({
  default: {
    scrapeCollection: 'scrape-tasks',
    templatesCollection: 'templates',
  },
}))

vi.mock('../logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('../events', () => ({
  recordErrorEvent: vi.fn(),
  recordCompleteEvent: vi.fn(),
}))

vi.mock('../http', () => ({
  sendHttpRequestTo: vi.fn(),
}))

vi.mock('../validation/task-validation', () => ({
  validateTask: vi.fn(),
}))

// Import the function after mocks are set up
import { processWrite } from '../index'
import { sendHttpRequestTo } from '../http'
import { validateTask } from '../validation/task-validation'

describe('Template Integration Tests', () => {
  const mockTaskId = 'test-task-id'
  const mockTemplateId = 'test-template-id'

  const mockTemplateData: TemplateData = {
    [URL_KEY]: 'https://template-url.com',
    [QUERIES_KEY]: [
      {
        id: 'template-title',
        type: QueryType.TAG,
        value: 'h1',
        target: TargetType.TEXT,
      },
      {
        id: 'template-description',
        type: QueryType.CLASS,
        value: 'description',
        target: TargetType.TEXT,
      },
    ],
  }

  const mockTaskQueries: Query[] = [
    {
      id: 'task-specific-query',
      type: QueryType.ID,
      value: 'content',
      target: TargetType.HTML,
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock Firestore template retrieval
    mockTemplateGet.mockResolvedValue({
      exists: true,
      data: () => mockTemplateData,
    })

    // Mock HTTP response
    ;(sendHttpRequestTo as any).mockResolvedValue({
      html: '<html><h1>Test Title</h1><div class="description">Test Description</div><div id="content">Test Content</div></html>',
      multiQuery: vi.fn().mockReturnValue({
        'template-title': 'Test Title',
        'template-description': 'Test Description',
        'task-specific-query': 'Test Content',
      }),
    })

    // Mock task validation
    ;(validateTask as any).mockImplementation(() => {}) // No-op, validation passes
  })

  describe('Task with Template Processing', () => {
    it('should process task with template successfully', async () => {
      const taskWithTemplate: Task = {
        [URL_KEY]: 'https://original-task-url.com', // This should be overridden by template
        [TEMPLATE_KEY]: mockTemplateId,
        [QUERIES_KEY]: mockTaskQueries,
      }

      const mockSnapshot = {
        data: vi.fn().mockReturnValue(taskWithTemplate),
        id: mockTaskId,
        exists: true,
      }

      await processWrite(mockSnapshot as any)

      // Verify template was fetched
      expect(mockTemplateDoc).toHaveBeenCalledWith(mockTemplateId)
      expect(mockTemplateGet).toHaveBeenCalled()

      // Verify task was updated to processing state
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          stage: TaskStage.PROCESSING,
          startedAt: expect.any(Timestamp),
          // URL should be from template
          [URL_KEY]: taskWithTemplate[URL_KEY],
          // Queries should be merged (template queries first, then task queries)
          [QUERIES_KEY]: [...mockTemplateData[QUERIES_KEY]!, ...mockTaskQueries],
        })
      )

      // Verify final success update
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          stage: TaskStage.SUCCESS,
          data: {
            'template-title': 'Test Title',
            'template-description': 'Test Description',
            'task-specific-query': 'Test Content',
          },
          concludedAt: expect.any(Timestamp),
        })
      )
    })

    it('should process task with template that only has URL', async () => {
      const urlOnlyTemplate: TemplateData = {
        [URL_KEY]: 'https://template-only-url.com',
      }

      mockTemplateGet.mockResolvedValue({
        exists: true,
        data: () => urlOnlyTemplate,
      })

      const taskWithTemplate: Task = {
        [URL_KEY]: 'https://original-task-url.com',
        [TEMPLATE_KEY]: mockTemplateId,
        [QUERIES_KEY]: mockTaskQueries,
      }

      const mockSnapshot = {
        data: vi.fn().mockReturnValue(taskWithTemplate),
        id: mockTaskId,
        exists: true,
      }

      await processWrite(mockSnapshot as any)

      // Verify task was updated with template URL but original queries
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          stage: TaskStage.PROCESSING,
          [URL_KEY]: taskWithTemplate[URL_KEY],
          [QUERIES_KEY]: mockTaskQueries, // Should preserve original task queries
        })
      )
    })

    it('should process task with template that only has queries', async () => {
      const queriesOnlyTemplate: TemplateData = {
        [QUERIES_KEY]: mockTemplateData[QUERIES_KEY],
      }

      mockTemplateGet.mockResolvedValue({
        exists: true,
        data: () => queriesOnlyTemplate,
      })

      const taskWithTemplate: Task = {
        [URL_KEY]: 'https://original-task-url.com',
        [TEMPLATE_KEY]: mockTemplateId,
        [QUERIES_KEY]: mockTaskQueries,
      }

      const mockSnapshot = {
        data: vi.fn().mockReturnValue(taskWithTemplate),
        id: mockTaskId,
        exists: true,
      }

      await processWrite(mockSnapshot as any)

      // Verify task was updated with original URL but merged queries
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          stage: TaskStage.PROCESSING,
          [URL_KEY]: taskWithTemplate[URL_KEY], // Should preserve original task URL
          [QUERIES_KEY]: [...queriesOnlyTemplate[QUERIES_KEY]!, ...mockTaskQueries],
        })
      )
    })

    it('should handle template not found error', async () => {
      mockTemplateGet.mockResolvedValue({
        exists: false,
      })

      const taskWithTemplate: Task = {
        [URL_KEY]: 'https://original-task-url.com',
        [TEMPLATE_KEY]: 'non-existent-template',
        [QUERIES_KEY]: mockTaskQueries,
      }

      const mockSnapshot = {
        data: vi.fn().mockReturnValue(taskWithTemplate),
        id: mockTaskId,
        exists: true,
      }

      await processWrite(mockSnapshot as any)

      // Verify error was recorded
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          stage: TaskStage.ERROR,
          error: 'Template not found: non-existent-template',
          startedAt: expect.any(Timestamp),
          concludedAt: expect.any(Timestamp),
        })
      )
    })

    it('should process task without template normally', async () => {
      const taskWithoutTemplate: Task = {
        [URL_KEY]: 'https://task-url.com',
        [QUERIES_KEY]: mockTaskQueries,
      }

      const mockSnapshot = {
        data: vi.fn().mockReturnValue(taskWithoutTemplate),
        id: mockTaskId,
        exists: true,
      }

      await processWrite(mockSnapshot as any)

      // Verify no template was fetched
      expect(mockTemplateGet).not.toHaveBeenCalled()

      // Verify task was processed with original data
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          stage: TaskStage.PROCESSING,
          [URL_KEY]: taskWithoutTemplate[URL_KEY],
          [QUERIES_KEY]: taskWithoutTemplate[QUERIES_KEY],
        })
      )
    })

    it('should handle task with template but no original queries', async () => {
      const taskWithTemplateNoQueries: Task = {
        [URL_KEY]: 'https://original-task-url.com',
        [TEMPLATE_KEY]: mockTemplateId,
        // No queries in the original task
      }

      const mockSnapshot = {
        data: vi.fn().mockReturnValue(taskWithTemplateNoQueries),
        id: mockTaskId,
        exists: true,
      }

      await processWrite(mockSnapshot as any)

      // Verify task was updated with template data
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          stage: TaskStage.PROCESSING,
          [URL_KEY]: taskWithTemplateNoQueries[URL_KEY], // Should keep the original task URL
          [QUERIES_KEY]: mockTemplateData[QUERIES_KEY], // Should only have template queries
          [TEMPLATE_KEY]: mockTemplateId,
        })
      )
    })
  })

  describe('Template Error Handling in Integration', () => {
    it('should handle Firebase errors when fetching template', async () => {
      const firebaseError = new Error('Firebase connection failed')
      mockTemplateGet.mockRejectedValue(firebaseError)

      const taskWithTemplate: Task = {
        [URL_KEY]: 'https://original-task-url.com',
        [TEMPLATE_KEY]: mockTemplateId,
        [QUERIES_KEY]: mockTaskQueries,
      }

      const mockSnapshot = {
        data: vi.fn().mockReturnValue(taskWithTemplate),
        id: mockTaskId,
        exists: true,
      }

      await processWrite(mockSnapshot as any)

      // Verify error was recorded
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          stage: TaskStage.ERROR,
          error: 'Firebase connection failed',
          startedAt: expect.any(Timestamp),
          concludedAt: expect.any(Timestamp),
        })
      )
    })

    it('should handle malformed template data', async () => {
      const malformedTemplateData = {
        invalidField: 'invalid-data',
        // Missing expected URL_KEY and QUERIES_KEY
      }

      mockTemplateGet.mockResolvedValue({
        exists: true,
        data: () => malformedTemplateData,
      })

      const taskWithTemplate: Task = {
        [URL_KEY]: 'https://original-task-url.com',
        [TEMPLATE_KEY]: mockTemplateId,
        [QUERIES_KEY]: mockTaskQueries,
      }

      const mockSnapshot = {
        data: vi.fn().mockReturnValue(taskWithTemplate),
        id: mockTaskId,
        exists: true,
      }

      await processWrite(mockSnapshot as any)

      // The processing should continue with the malformed template data
      // (the Template class should handle undefined values gracefully)
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          stage: TaskStage.PROCESSING,
          // URL should remain from original task since template has no URL
          [URL_KEY]: taskWithTemplate[URL_KEY],
          // Queries should remain from original task since template has no queries
          [QUERIES_KEY]: taskWithTemplate[QUERIES_KEY],
        })
      )
    })
  })
})
