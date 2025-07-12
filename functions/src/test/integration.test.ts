import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'
import { createServer, Server } from 'http'
import { sendHttpRequestTo } from '../http'
import { Query, QueryType, TargetType } from '../types/Query'
import { Task } from '../types/Task'
import { validateTask } from '../validation/task-validation'
import { Queriable } from '../types/Queriable'

describe('Integration Tests - Complete Workflow with Test HTML Page', () => {
  let server: Server
  let testHtml: string
  let baseUrl: string

  beforeAll(async () => {
    // Load the test HTML file
    const testHtmlPath = join(__dirname, 'web', 'index.html')
    testHtml = readFileSync(testHtmlPath, 'utf-8')

    // Create a simple HTTP server to serve the test HTML
    server = createServer((req, res) => {
      if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end(testHtml)
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' })
        res.end('Not Found')
      }
    })

    // Start the server on a random port
    await new Promise<void>((resolve) => {
      server.listen(0, () => {
        const address = server.address()
        const port = typeof address === 'object' && address ? address.port : 3000
        baseUrl = `http://localhost:${port}`
        resolve()
      })
    })
  })

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve())
    })
  })

  describe('Task Validation', () => {
    it('should validate a valid task', () => {
      const task: Task = {
        url: baseUrl,
        queries: [
          {
            id: 'title',
            type: QueryType.TAG,
            value: 'h1',
            target: TargetType.TEXT
          }
        ]
      }

      const validationResult = validateTask(task)
      expect(validationResult).toBeNull()
    })

    it('should reject task with invalid URL', () => {
      const task: Task = {
        url: 'invalid-url',
        queries: [
          {
            id: 'title',
            type: QueryType.TAG,
            value: 'h1',
            target: TargetType.TEXT
          }
        ]
      }

      const validationResult = validateTask(task)
      expect(validationResult).toBe("Task URL ('url') is not a valid URL")
    })

    it('should reject task with missing URL', () => {
      const task: Task = {
        url: '',
        queries: [
          {
            id: 'title',
            type: QueryType.TAG,
            value: 'h1',
            target: TargetType.TEXT
          }
        ]
      }

      const validationResult = validateTask(task)
      expect(validationResult).toBe("Task URL ('url') is not a valid URL")
    })

    it('should reject task with no queries', () => {
      const task: Task = {
        url: baseUrl,
        queries: []
      }

      const validationResult = validateTask(task)
      expect(validationResult).toBe("Task queries ('queries') are empty")
    })

    it('should reject task with non-array queries', () => {
      const task: any = {
        url: baseUrl,
        queries: 'not-an-array'
      }

      const validationResult = validateTask(task)
      expect(validationResult).toBe("Task queries ('queries') must be provided as an array")
    })

    it('should reject undefined task', () => {
      const validationResult = validateTask(undefined)
      expect(validationResult).toBe("Task is missing")
    })
  })

  describe('Complete Workflow - Simple Scenarios', () => {
    it('should extract page title successfully', async () => {
      const task: Task = {
        url: baseUrl,
        queries: [
          {
            id: 'page-title',
            type: QueryType.TAG,
            value: 'h1',
            target: TargetType.TEXT
          }
        ]
      }

      // Validate the task
      const validationResult = validateTask(task)
      expect(validationResult).toBeNull()

      // Execute the task
      const queriable = await sendHttpRequestTo(task.url)
      const results = queriable.multiQuery(task.queries)

      expect(results['page-title']).toBeDefined()
      expect(Array.isArray(results['page-title']) ? results['page-title'][0] : results['page-title']).toBe('Test Page for Web Scraper')
    })

    it('should extract listings successfully', async () => {
      const task: Task = {
        url: baseUrl,
        queries: [
          {
            id: 'listings',
            type: QueryType.SELECTOR,
            value: '#listings ul li',
            target: TargetType.TEXT
          }
        ]
      }

      // Validate the task
      const validationResult = validateTask(task)
      expect(validationResult).toBeNull()

      // Execute the task
      const queriable = await sendHttpRequestTo(task.url)
      const results = queriable.multiQuery(task.queries)

      expect(results['listings']).toBeDefined()
      expect(Array.isArray(results['listings'])).toBe(true)
      expect((results['listings'] as string[]).length).toBe(5)
      expect(results['listings']).toContain('Listing Item 1 - Description for item 1.')
      expect(results['listings']).toContain('Listing Item 5 - Description for item 5.')
    })

    it('should extract table data successfully', async () => {
      const task: Task = {
        url: baseUrl,
        queries: [
          {
            id: 'table-names',
            type: QueryType.SELECTOR,
            value: 'table tbody tr td:nth-child(2)',
            target: TargetType.TEXT
          }
        ]
      }

      // Validate the task
      const validationResult = validateTask(task)
      expect(validationResult).toBeNull()

      // Execute the task
      const queriable = await sendHttpRequestTo(task.url)
      const results = queriable.multiQuery(task.queries)

      expect(results['table-names']).toBeDefined()
      expect(Array.isArray(results['table-names'])).toBe(true)
      expect((results['table-names'] as string[]).length).toBe(4)
      expect(results['table-names']).toContain('Alpha')
      expect(results['table-names']).toContain('Beta')
      expect(results['table-names']).toContain('Gamma')
      expect(results['table-names']).toContain('Delta')
    })
  })

  describe('Complete Workflow - Complex Scenarios', () => {
    it('should handle multiple queries in a single task', async () => {
      const task: Task = {
        url: baseUrl,
        queries: [
          {
            id: 'page-title',
            type: QueryType.TAG,
            value: 'title',
            target: TargetType.TEXT
          },
          {
            id: 'main-heading',
            type: QueryType.TAG,
            value: 'h1',
            target: TargetType.TEXT
          },
          {
            id: 'section-headings',
            type: QueryType.TAG,
            value: 'h2',
            target: TargetType.TEXT
          },
          {
            id: 'listings',
            type: QueryType.SELECTOR,
            value: '#listings ul li',
            target: TargetType.TEXT
          },
          {
            id: 'table-data',
            type: QueryType.SELECTOR,
            value: 'table tbody tr td:nth-child(2)',
            target: TargetType.TEXT
          },
          {
            id: 'article-titles',
            type: QueryType.SELECTOR,
            value: 'article h3',
            target: TargetType.TEXT
          },
          {
            id: 'nav-links',
            type: QueryType.SELECTOR,
            value: 'nav ul li a',
            target: TargetType.ATTRIBUTE,
            attr: 'href'
          }
        ]
      }

      // Validate the task
      const validationResult = validateTask(task)
      expect(validationResult).toBeNull()

      // Execute the task
      const queriable = await sendHttpRequestTo(task.url)
      const results = queriable.multiQuery(task.queries)

      // Verify all results
      expect(results['page-title']).toBeDefined()
      expect(Array.isArray(results['page-title']) ? results['page-title'][0] : results['page-title']).toBe('Test Page for Web Scraper')

      expect(results['main-heading']).toBeDefined()
      expect(Array.isArray(results['main-heading']) ? results['main-heading'][0] : results['main-heading']).toBe('Test Page for Web Scraper')

      expect(results['section-headings']).toBeDefined()
      expect(Array.isArray(results['section-headings'])).toBe(true)
      expect((results['section-headings'] as string[]).length).toBe(4)
      expect(results['section-headings']).toContain('Listings')
      expect(results['section-headings']).toContain('General Information')
      expect(results['section-headings']).toContain('Data Table')
      expect(results['section-headings']).toContain('Articles')

      expect(results['listings']).toBeDefined()
      expect(Array.isArray(results['listings'])).toBe(true)
      expect((results['listings'] as string[]).length).toBe(5)

      expect(results['table-data']).toBeDefined()
      expect(Array.isArray(results['table-data'])).toBe(true)
      expect((results['table-data'] as string[]).length).toBe(4)
      expect(results['table-data']).toContain('Alpha')
      expect(results['table-data']).toContain('Beta')
      expect(results['table-data']).toContain('Gamma')
      expect(results['table-data']).toContain('Delta')

      expect(results['article-titles']).toBeDefined()
      expect(Array.isArray(results['article-titles'])).toBe(true)
      expect((results['article-titles'] as string[]).length).toBe(3)
      expect(results['article-titles']).toContain('Article 1: Introduction to Web Scraping')
      expect(results['article-titles']).toContain('Article 2: Tips for Effective Scraping')
      expect(results['article-titles']).toContain('Article 3: Challenges in Web Scraping')

      expect(results['nav-links']).toBeDefined()
      expect(Array.isArray(results['nav-links'])).toBe(true)
      expect((results['nav-links'] as string[]).length).toBe(4)
      expect(results['nav-links']).toContain('#listings')
      expect(results['nav-links']).toContain('#info')
      expect(results['nav-links']).toContain('#data')
      expect(results['nav-links']).toContain('#articles')
    })

    it('should handle different target types in a single task', async () => {
      const task: Task = {
        url: baseUrl,
        queries: [
          {
            id: 'title-text',
            type: QueryType.TAG,
            value: 'h1',
            target: TargetType.TEXT
          },
          {
            id: 'title-html',
            type: QueryType.TAG,
            value: 'h1',
            target: TargetType.HTML
          },
          {
            id: 'title-inner-html',
            type: QueryType.TAG,
            value: 'h1',
            target: TargetType.INNER_HTML
          },
          {
            id: 'link-href',
            type: QueryType.SELECTOR,
            value: 'nav ul li a',
            target: TargetType.ATTRIBUTE,
            attr: 'href'
          }
        ]
      }

      // Validate the task
      const validationResult = validateTask(task)
      expect(validationResult).toBeNull()

      // Execute the task
      const queriable = await sendHttpRequestTo(task.url)
      const results = queriable.multiQuery(task.queries)

      expect(results['title-text']).toBeDefined()
      expect(Array.isArray(results['title-text']) ? results['title-text'][0] : results['title-text']).toBe('Test Page for Web Scraper')

      expect(results['title-html']).toBeDefined()
      expect(Array.isArray(results['title-html']) ? results['title-html'][0] : results['title-html']).toContain('h1')
      expect(Array.isArray(results['title-html']) ? results['title-html'][0] : results['title-html']).toContain('Test Page for Web Scraper')

      expect(results['title-inner-html']).toBeDefined()
      expect(Array.isArray(results['title-inner-html']) ? results['title-inner-html'][0] : results['title-inner-html']).toBe('Test Page for Web Scraper')

      expect(results['link-href']).toBeDefined()
      expect(Array.isArray(results['link-href'])).toBe(true)
      expect((results['link-href'] as string[]).length).toBe(4)
      expect(results['link-href']).toContain('#listings')
    })

    it('should handle queries that return no results', async () => {
      const task: Task = {
        url: baseUrl,
        queries: [
          {
            id: 'existing-element',
            type: QueryType.TAG,
            value: 'h1',
            target: TargetType.TEXT
          },
          {
            id: 'non-existent-element',
            type: QueryType.ID,
            value: 'non-existent-id',
            target: TargetType.TEXT
          },
          {
            id: 'non-existent-class',
            type: QueryType.CLASS,
            value: 'non-existent-class',
            target: TargetType.TEXT
          }
        ]
      }

      // Validate the task
      const validationResult = validateTask(task)
      expect(validationResult).toBeNull()

      // Execute the task
      const queriable = await sendHttpRequestTo(task.url)
      const results = queriable.multiQuery(task.queries)

      expect(results['existing-element']).toBeDefined()
      expect(Array.isArray(results['existing-element']) ? results['existing-element'][0] : results['existing-element']).toBe('Test Page for Web Scraper')

      expect(results['non-existent-element']).toBeDefined()
      expect(Array.isArray(results['non-existent-element'])).toBe(true)
      expect((results['non-existent-element'] as string[]).length).toBe(0)

      expect(results['non-existent-class']).toBeDefined()
      expect(Array.isArray(results['non-existent-class'])).toBe(true)
      expect((results['non-existent-class'] as string[]).length).toBe(0)
    })
  })

  describe('Real-world Use Cases', () => {
    it('should simulate e-commerce product listing extraction', async () => {
      const task: Task = {
        url: baseUrl,
        queries: [
          {
            id: 'product-names',
            type: QueryType.SELECTOR,
            value: '#listings ul li',
            target: TargetType.TEXT
          },
          {
            id: 'product-count',
            type: QueryType.SELECTOR,
            value: '#listings ul li',
            target: TargetType.TEXT
          },
          {
            id: 'page-title',
            type: QueryType.TAG,
            value: 'h1',
            target: TargetType.TEXT
          }
        ]
      }

      const validationResult = validateTask(task)
      expect(validationResult).toBeNull()

      const queriable = await sendHttpRequestTo(task.url)
      const results = queriable.multiQuery(task.queries)

      expect(results['product-names']).toBeDefined()
      expect(Array.isArray(results['product-names'])).toBe(true)
      expect((results['product-names'] as string[]).length).toBe(5)
      
      expect(results['product-count']).toBeDefined()
      expect(Array.isArray(results['product-count'])).toBe(true)
      expect((results['product-count'] as string[]).length).toBe(5)
      
      expect(results['page-title']).toBeDefined()
      expect(Array.isArray(results['page-title']) ? results['page-title'][0] : results['page-title']).toBe('Test Page for Web Scraper')
    })

    it('should simulate data table extraction for analytics', async () => {
      const task: Task = {
        url: baseUrl,
        queries: [
          {
            id: 'data-ids',
            type: QueryType.SELECTOR,
            value: 'table tbody tr td:nth-child(1)',
            target: TargetType.TEXT
          },
          {
            id: 'data-names',
            type: QueryType.SELECTOR,
            value: 'table tbody tr td:nth-child(2)',
            target: TargetType.TEXT
          },
          {
            id: 'data-values',
            type: QueryType.SELECTOR,
            value: 'table tbody tr td:nth-child(3)',
            target: TargetType.TEXT
          },
          {
            id: 'table-headers',
            type: QueryType.SELECTOR,
            value: 'table thead tr th',
            target: TargetType.TEXT
          }
        ]
      }

      const validationResult = validateTask(task)
      expect(validationResult).toBeNull()

      const queriable = await sendHttpRequestTo(task.url)
      const results = queriable.multiQuery(task.queries)

      expect(results['data-ids']).toBeDefined()
      expect(Array.isArray(results['data-ids'])).toBe(true)
      expect((results['data-ids'] as string[]).length).toBe(4)
      expect(results['data-ids']).toContain('1')
      expect(results['data-ids']).toContain('2')
      expect(results['data-ids']).toContain('3')
      expect(results['data-ids']).toContain('4')

      expect(results['data-names']).toBeDefined()
      expect(Array.isArray(results['data-names'])).toBe(true)
      expect((results['data-names'] as string[]).length).toBe(4)
      expect(results['data-names']).toContain('Alpha')
      expect(results['data-names']).toContain('Beta')
      expect(results['data-names']).toContain('Gamma')
      expect(results['data-names']).toContain('Delta')

      expect(results['data-values']).toBeDefined()
      expect(Array.isArray(results['data-values'])).toBe(true)
      expect((results['data-values'] as string[]).length).toBe(4)
      expect(results['data-values']).toContain('100')
      expect(results['data-values']).toContain('200')
      expect(results['data-values']).toContain('300')
      expect(results['data-values']).toContain('400')

      expect(results['table-headers']).toBeDefined()
      expect(Array.isArray(results['table-headers'])).toBe(true)
      expect((results['table-headers'] as string[]).length).toBe(3)
      expect(results['table-headers']).toContain('ID')
      expect(results['table-headers']).toContain('Name')
      expect(results['table-headers']).toContain('Value')
    })

    it('should simulate content aggregation for news/articles', async () => {
      const task: Task = {
        url: baseUrl,
        queries: [
          {
            id: 'article-titles',
            type: QueryType.SELECTOR,
            value: 'article h3',
            target: TargetType.TEXT
          },
          {
            id: 'article-content',
            type: QueryType.SELECTOR,
            value: 'article p',
            target: TargetType.TEXT
          },
          {
            id: 'article-count',
            type: QueryType.TAG,
            value: 'article',
            target: TargetType.TEXT
          }
        ]
      }

      const validationResult = validateTask(task)
      expect(validationResult).toBeNull()

      const queriable = await sendHttpRequestTo(task.url)
      const results = queriable.multiQuery(task.queries)

      expect(results['article-titles']).toBeDefined()
      expect(Array.isArray(results['article-titles'])).toBe(true)
      expect((results['article-titles'] as string[]).length).toBe(3)
      expect(results['article-titles']).toContain('Article 1: Introduction to Web Scraping')
      expect(results['article-titles']).toContain('Article 2: Tips for Effective Scraping')
      expect(results['article-titles']).toContain('Article 3: Challenges in Web Scraping')

      expect(results['article-content']).toBeDefined()
      expect(Array.isArray(results['article-content'])).toBe(true)
      expect((results['article-content'] as string[]).length).toBe(3)
      expect((results['article-content'] as string[])[0]).toContain('Web scraping is the process')
      expect((results['article-content'] as string[])[1]).toContain('robots.txt file')
      expect((results['article-content'] as string[])[2]).toContain('dynamic content')

      expect(results['article-count']).toBeDefined()
      expect(Array.isArray(results['article-count'])).toBe(true)
      expect((results['article-count'] as string[]).length).toBe(3)
    })
  })
})
