import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Template, TemplateData, URL_KEY, QUERIES_KEY } from '../types/Template'
import { validateTemplate } from '../validation/template-validation'
import { Task, TEMPLATE_KEY } from '../types/Task'
import { Query, QueryType, TargetType } from '../types/Query'

// Mock Firebase using vi.hoisted to avoid initialization order issues
const { mockGet, mockDoc, mockCollection } = vi.hoisted(() => {
  const mockGet = vi.fn()
  const mockDoc = vi.fn(() => ({ get: mockGet }))
  const mockCollection = vi.fn(() => ({ doc: mockDoc }))

  return { mockGet, mockDoc, mockCollection }
})

vi.mock('../firebase', () => ({
  db: {
    collection: mockCollection,
  },
}))

vi.mock('../config', () => ({
  default: {
    templatesCollection: 'templates',
  },
}))

describe('Template Class', () => {
  const mockTemplateId = 'test-template-id'
  const mockTemplateData: TemplateData = {
    [URL_KEY]: 'https://example.com',
    [QUERIES_KEY]: [
      {
        id: 'title',
        type: QueryType.TAG,
        value: 'h1',
        target: TargetType.TEXT,
      },
      {
        id: 'description',
        type: QueryType.CLASS,
        value: 'description',
        target: TargetType.TEXT,
      },
    ],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('constructor', () => {
    it('should create a template instance with correct initial state', () => {
      const template = new Template(mockTemplateId)
      expect(template).toBeInstanceOf(Template)
      expect(template['_templateId']).toBe(mockTemplateId)
      expect(template['_initialized']).toBe(false)
    })
  })

  describe('initialize', () => {
    it('should initialize template with data from Firestore', async () => {
      mockGet.mockResolvedValue({
        exists: true,
        data: () => mockTemplateData,
      })

      const template = new Template(mockTemplateId)
      await template.initialize()

      expect(mockCollection).toHaveBeenCalledWith('templates')
      expect(mockDoc).toHaveBeenCalledWith(mockTemplateId)
      expect(mockGet).toHaveBeenCalled()
      expect(template[URL_KEY]).toBe(mockTemplateData[URL_KEY])
      expect(template[QUERIES_KEY]).toEqual(mockTemplateData[QUERIES_KEY])
      expect(template['_initialized']).toBe(true)
    })

    it('should not reinitialize if already initialized', async () => {
      mockGet.mockResolvedValue({
        exists: true,
        data: () => mockTemplateData,
      })

      const template = new Template(mockTemplateId)
      await template.initialize()

      // Clear mock calls
      vi.clearAllMocks()

      // Try to initialize again
      await template.initialize()

      // Should not make any Firebase calls
      expect(mockCollection).not.toHaveBeenCalled()
      expect(mockDoc).not.toHaveBeenCalled()
      expect(mockGet).not.toHaveBeenCalled()
    })

    it('should throw error when template document does not exist', async () => {
      mockGet.mockResolvedValue({
        exists: false,
      })

      const template = new Template(mockTemplateId)

      await expect(template.initialize()).rejects.toThrow(`Template not found: ${mockTemplateId}`)
      expect(template['_initialized']).toBe(false)
    })

    it('should handle template with only URL', async () => {
      const urlOnlyTemplate: TemplateData = {
        [URL_KEY]: 'https://example.com',
      }

      mockGet.mockResolvedValue({
        exists: true,
        data: () => urlOnlyTemplate,
      })

      const template = new Template(mockTemplateId)
      await template.initialize()

      expect(template[URL_KEY]).toBe(urlOnlyTemplate[URL_KEY])
      expect(template[QUERIES_KEY]).toBeUndefined()
      expect(template['_initialized']).toBe(true)
    })

    it('should handle template with only queries', async () => {
      const queriesOnlyTemplate: TemplateData = {
        [QUERIES_KEY]: mockTemplateData[QUERIES_KEY],
      }

      mockGet.mockResolvedValue({
        exists: true,
        data: () => queriesOnlyTemplate,
      })

      const template = new Template(mockTemplateId)
      await template.initialize()

      expect(template[URL_KEY]).toBeUndefined()
      expect(template[QUERIES_KEY]).toEqual(queriesOnlyTemplate[QUERIES_KEY])
      expect(template['_initialized']).toBe(true)
    })
  })

  describe('mergeWithTask', () => {
    let template: Template

    beforeEach(async () => {
      mockGet.mockResolvedValue({
        exists: true,
        data: () => mockTemplateData,
      })

      template = new Template(mockTemplateId)
      await template.initialize()
    })

    it('should throw error if template is not initialized', () => {
      const uninitializedTemplate = new Template('uninit-template')
      const task: Task = {
        [URL_KEY]: 'https://task-url.com',
      }

      expect(() => uninitializedTemplate.mergeWithTask(task)).toThrow('Template not initialized')
    })

    it('should use task URL if provided, overriding template URL', () => {
      const task: Task = {
        [URL_KEY]: 'https://different-task-url.com', // Task URL should override template
      }

      const mergedTask = template.mergeWithTask(task)

      expect(mergedTask[URL_KEY]).toBe('https://different-task-url.com')
    })

    it('should use template URL if task does not provide one', () => {
      // This test checks the behaviour when no url is provided in task, but only in the template
      const task: Task = {
        [URL_KEY]: undefined,
        // No URL in task
      }

      const mergedTask = template.mergeWithTask(task)

      expect(mergedTask[URL_KEY]).toBe(mockTemplateData[URL_KEY])
    })

    it('should merge template queries with existing task queries', () => {
      const taskQueries: Query[] = [
        {
          id: 'task-query',
          type: QueryType.ID,
          value: 'content',
          target: TargetType.HTML,
        },
      ]

      const task: Task = {
        [URL_KEY]: 'https://task-url.com',
        [QUERIES_KEY]: taskQueries,
      }

      const mergedTask = template.mergeWithTask(task)

      expect(mergedTask[QUERIES_KEY]).toHaveLength(3) // 2 from template + 1 from task
      expect(mergedTask[QUERIES_KEY]).toEqual([...mockTemplateData[QUERIES_KEY]!, ...taskQueries])
    })

    it('should handle task with no queries (undefined)', () => {
      const task: Task = {
        [URL_KEY]: 'https://task-url.com',
      }

      const mergedTask = template.mergeWithTask(task)

      expect(mergedTask[QUERIES_KEY]).toEqual(mockTemplateData[QUERIES_KEY])
    })

    it('should handle task with empty queries array', () => {
      const task: Task = {
        [URL_KEY]: 'https://task-url.com',
        [QUERIES_KEY]: [],
      }

      const mergedTask = template.mergeWithTask(task)

      expect(mergedTask[QUERIES_KEY]).toEqual(mockTemplateData[QUERIES_KEY])
    })

    it('should preserve other task properties', () => {
      const task: Task = {
        [URL_KEY]: 'https://task-url.com',
        [TEMPLATE_KEY]: 'some-template',
      }

      const mergedTask = template.mergeWithTask(task)

      expect(mergedTask[TEMPLATE_KEY]).toBe(task[TEMPLATE_KEY])
      expect(mergedTask[URL_KEY]).toBe('https://task-url.com') // Task URL should override template
    })

    it('should handle template with no URL (preserving task URL)', async () => {
      const templateWithoutUrl: TemplateData = {
        [QUERIES_KEY]: mockTemplateData[QUERIES_KEY],
      }

      mockGet.mockResolvedValue({
        exists: true,
        data: () => templateWithoutUrl,
      })

      const templateNoUrl = new Template('no-url-template')
      await templateNoUrl.initialize()

      const task: Task = {
        [URL_KEY]: 'https://task-url.com',
      }

      const mergedTask = templateNoUrl.mergeWithTask(task)

      expect(mergedTask[URL_KEY]).toBe(task[URL_KEY]) // Task URL should be used
      expect(mergedTask[QUERIES_KEY]).toEqual(templateWithoutUrl[QUERIES_KEY])
    })

    it('should handle template with no URL and no task URL', async () => {
      const templateWithoutUrl: TemplateData = {
        [QUERIES_KEY]: mockTemplateData[QUERIES_KEY],
      }

      mockGet.mockResolvedValue({
        exists: true,
        data: () => templateWithoutUrl,
      })

      const templateNoUrl = new Template('no-url-template')
      await templateNoUrl.initialize()

      const task: Task = {
        [URL_KEY]: undefined,
        // No URL
      }

      const mergedTask = templateNoUrl.mergeWithTask(task)

      expect(mergedTask[URL_KEY]).toBeUndefined()
      expect(mergedTask[QUERIES_KEY]).toEqual(templateWithoutUrl[QUERIES_KEY])
    })

    it('should handle template with no queries (preserving task queries)', async () => {
      const templateWithoutQueries: TemplateData = {
        [URL_KEY]: 'https://template-url.com',
      }

      mockGet.mockResolvedValue({
        exists: true,
        data: () => templateWithoutQueries,
      })

      const templateNoQueries = new Template('no-queries-template')
      await templateNoQueries.initialize()

      const taskQueries: Query[] = [
        {
          id: 'task-query',
          type: QueryType.TAG,
          value: 'p',
          target: TargetType.TEXT,
        },
      ]

      const task: Task = {
        [URL_KEY]: 'https://task-url.com',
        [QUERIES_KEY]: taskQueries,
      }

      const mergedTask = templateNoQueries.mergeWithTask(task)

      expect(mergedTask[URL_KEY]).toBe('https://task-url.com') // Task URL should override template
      expect(mergedTask[QUERIES_KEY]).toEqual(taskQueries) // Should preserve task queries
    })

    it('should handle template with no queries and no task queries', async () => {
      const templateWithoutQueries: TemplateData = {
        [URL_KEY]: 'https://template-url.com',
      }

      mockGet.mockResolvedValue({
        exists: true,
        data: () => templateWithoutQueries,
      })

      const templateNoQueries = new Template('no-queries-template')
      await templateNoQueries.initialize()

      const task: Task = {
        [URL_KEY]: 'https://task-url.com',
        // No queries
      }

      const mergedTask = templateNoQueries.mergeWithTask(task)

      expect(mergedTask[URL_KEY]).toBe('https://task-url.com') // Task URL should override template
      expect(mergedTask[QUERIES_KEY]).toBeUndefined()
    })
  })
})

describe('Template Validation', () => {
  describe('validateTemplate', () => {
    it('should throw error for missing template', () => {
      expect(() => validateTemplate(null as any)).toThrow('Template is missing')
      expect(() => validateTemplate(undefined as any)).toThrow('Template is missing')
    })

    it('should validate template with valid URL', () => {
      const template: TemplateData = {
        [URL_KEY]: 'https://example.com',
        [QUERIES_KEY]: [
          {
            id: 'test',
            type: QueryType.TAG,
            value: 'h1',
            target: TargetType.TEXT,
          },
        ],
      }

      expect(() => validateTemplate(template)).not.toThrow()
    })

    it('should throw error for invalid URL type', () => {
      const template: any = {
        [URL_KEY]: 123, // Invalid type
        [QUERIES_KEY]: [
          {
            id: 'test',
            type: QueryType.TAG,
            value: 'h1',
            target: TargetType.TEXT,
          },
        ],
      }

      expect(() => validateTemplate(template)).toThrow(
        `Template URL ('${URL_KEY}') must be provided as a string`
      )
    })

    it('should throw error for malformed URL', () => {
      const template: TemplateData = {
        [URL_KEY]: 'not-a-valid-url',
        [QUERIES_KEY]: [
          {
            id: 'test',
            type: QueryType.TAG,
            value: 'h1',
            target: TargetType.TEXT,
          },
        ],
      }

      expect(() => validateTemplate(template)).toThrow(
        `Template URL ('${URL_KEY}') is not a valid URL`
      )
    })

    it('should validate template without URL', () => {
      const template: TemplateData = {
        [QUERIES_KEY]: [
          {
            id: 'test',
            type: QueryType.TAG,
            value: 'h1',
            target: TargetType.TEXT,
          },
        ],
      }

      expect(() => validateTemplate(template)).not.toThrow()
    })

    it('should throw error for invalid queries (not array)', () => {
      const template: any = {
        [URL_KEY]: 'https://example.com',
        [QUERIES_KEY]: 'not-an-array',
      }

      expect(() => validateTemplate(template)).toThrow(
        `Task queries ('${QUERIES_KEY}') must be provided as an array`
      )
    })

    it('should throw error for empty queries array', () => {
      const template: TemplateData = {
        [URL_KEY]: 'https://example.com',
        [QUERIES_KEY]: [],
      }

      expect(() => validateTemplate(template)).toThrow(`Task queries ('${QUERIES_KEY}') are empty`)
    })

    it('should validate template with only URL (no queries)', () => {
      const template: TemplateData = {
        [URL_KEY]: 'https://example.com',
      }

      // This should not throw because queries are optional in templates
      // The validation only checks if queries exist, are they valid
      expect(() => validateTemplate(template)).not.toThrow()
    })
  })
})
