import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'
import { createServer, Server } from 'http'
import { sendHttpRequestTo } from '../http'
import { Query, QueryType, TargetType } from '../types/Query'

describe('HTTP Functionality with Test HTML Page', () => {
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
      } else if (req.url === '/404') {
        res.writeHead(404, { 'Content-Type': 'text/plain' })
        res.end('Not Found')
      } else if (req.url === '/timeout') {
        // Don't respond to simulate timeout
        setTimeout(() => {
          res.writeHead(200, { 'Content-Type': 'text/html' })
          res.end(testHtml)
        }, 15000) // 15 seconds - longer than test timeout
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

  describe('sendHttpRequestTo Function', () => {
    it('should successfully fetch and parse HTML', async () => {
      const queriable = await sendHttpRequestTo(baseUrl)

      expect(queriable).toBeDefined()
      expect(queriable.html).toBeDefined()
      expect(queriable.html).toContain('Test Page for Web Scraper')
      expect(queriable.html).toContain('Listings')
      expect(queriable.html).toContain('General Information')
      expect(queriable.html).toContain('Data Table')
      expect(queriable.html).toContain('Articles')
    })

    it('should return a Queriable object that can be queried', async () => {
      const queriable = await sendHttpRequestTo(baseUrl)

      const query: Query = {
        id: 'test-title',
        type: QueryType.TAG,
        value: 'h1',
        target: TargetType.TEXT,
      }

      const result = queriable.query(query)
      expect(Array.isArray(result)).toBe(true)
      expect(result[0]).toBe('Test Page for Web Scraper')
    })

    it('should handle HTTP errors gracefully', async () => {
      await expect(sendHttpRequestTo(`${baseUrl}/404`)).rejects.toThrow('Network error: 404')
    })

    it('should handle invalid URLs', async () => {
      await expect(sendHttpRequestTo('invalid-url')).rejects.toThrow()
    })

    it('should handle non-existent domains', async () => {
      await expect(sendHttpRequestTo('http://this-domain-does-not-exist.com')).rejects.toThrow()
    })
  })

  describe('Integration with Queriable', () => {
    it('should extract listings from fetched HTML', async () => {
      const queriable = await sendHttpRequestTo(baseUrl)

      const query: Query = {
        id: 'extract-listings',
        type: QueryType.SELECTOR,
        value: '#listings ul li',
        target: TargetType.TEXT,
      }

      const result = queriable.query(query)
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(5)
      expect(result[0]).toContain('Listing Item 1')
      expect(result[4]).toContain('Listing Item 5')
    })

    it('should extract table data from fetched HTML', async () => {
      const queriable = await sendHttpRequestTo(baseUrl)

      const queries: Query[] = [
        {
          id: 'table-ids',
          type: QueryType.SELECTOR,
          value: 'table tbody tr td:nth-child(1)',
          target: TargetType.TEXT,
        },
        {
          id: 'table-names',
          type: QueryType.SELECTOR,
          value: 'table tbody tr td:nth-child(2)',
          target: TargetType.TEXT,
        },
        {
          id: 'table-values',
          type: QueryType.SELECTOR,
          value: 'table tbody tr td:nth-child(3)',
          target: TargetType.TEXT,
        },
      ]

      const results = queriable.multiQuery(queries)

      expect(results['table-ids']).toBeDefined()
      expect(results['table-names']).toBeDefined()
      expect(results['table-values']).toBeDefined()

      expect(Array.isArray(results['table-ids'])).toBe(true)
      expect((results['table-ids'] as string[]).length).toBe(4)
      expect(results['table-ids']).toContain('1')
      expect(results['table-ids']).toContain('2')
      expect(results['table-ids']).toContain('3')
      expect(results['table-ids']).toContain('4')

      expect(Array.isArray(results['table-names'])).toBe(true)
      expect(results['table-names']).toContain('Alpha')
      expect(results['table-names']).toContain('Beta')
      expect(results['table-names']).toContain('Gamma')
      expect(results['table-names']).toContain('Delta')

      expect(Array.isArray(results['table-values'])).toBe(true)
      expect(results['table-values']).toContain('100')
      expect(results['table-values']).toContain('200')
      expect(results['table-values']).toContain('300')
      expect(results['table-values']).toContain('400')
    })

    it('should extract article information from fetched HTML', async () => {
      const queriable = await sendHttpRequestTo(baseUrl)

      const queries: Query[] = [
        {
          id: 'article-titles',
          type: QueryType.SELECTOR,
          value: 'article h3',
          target: TargetType.TEXT,
        },
        {
          id: 'article-content',
          type: QueryType.SELECTOR,
          value: 'article p',
          target: TargetType.TEXT,
        },
      ]

      const results = queriable.multiQuery(queries)

      expect(results['article-titles']).toBeDefined()
      expect(results['article-content']).toBeDefined()

      expect(Array.isArray(results['article-titles'])).toBe(true)
      expect((results['article-titles'] as string[]).length).toBe(3)
      expect(results['article-titles']).toContain('Article 1: Introduction to Web Scraping')
      expect(results['article-titles']).toContain('Article 2: Tips for Effective Scraping')
      expect(results['article-titles']).toContain('Article 3: Challenges in Web Scraping')

      expect(Array.isArray(results['article-content'])).toBe(true)
      expect((results['article-content'] as string[]).length).toBe(3)
      expect((results['article-content'] as string[])[0]).toContain('Web scraping is the process')
      expect((results['article-content'] as string[])[1]).toContain('robots.txt file')
      expect((results['article-content'] as string[])[2]).toContain('dynamic content')
    })

    it('should extract navigation links from fetched HTML', async () => {
      const queriable = await sendHttpRequestTo(baseUrl)

      const queries: Query[] = [
        {
          id: 'nav-text',
          type: QueryType.SELECTOR,
          value: 'nav ul li a',
          target: TargetType.TEXT,
        },
        {
          id: 'nav-links',
          type: QueryType.SELECTOR,
          value: 'nav ul li a',
          target: TargetType.ATTRIBUTE,
          attr: 'href',
        },
      ]

      const results = queriable.multiQuery(queries)

      expect(results['nav-text']).toBeDefined()
      expect(results['nav-links']).toBeDefined()

      expect(Array.isArray(results['nav-text'])).toBe(true)
      expect((results['nav-text'] as string[]).length).toBe(4)
      expect(results['nav-text']).toContain('Listings')
      expect(results['nav-text']).toContain('Info')
      expect(results['nav-text']).toContain('Data')
      expect(results['nav-text']).toContain('Articles')

      expect(Array.isArray(results['nav-links'])).toBe(true)
      expect((results['nav-links'] as string[]).length).toBe(4)
      expect(results['nav-links']).toContain('#listings')
      expect(results['nav-links']).toContain('#info')
      expect(results['nav-links']).toContain('#data')
      expect(results['nav-links']).toContain('#articles')
    })
  })

  describe('Real-world Scenarios', () => {
    it('should handle comprehensive data extraction scenario', async () => {
      const queriable = await sendHttpRequestTo(baseUrl)

      // Simulate a real-world scraping scenario with multiple data points
      const queries: Query[] = [
        {
          id: 'page-title',
          type: QueryType.TAG,
          value: 'title',
          target: TargetType.TEXT,
        },
        {
          id: 'main-heading',
          type: QueryType.TAG,
          value: 'h1',
          target: TargetType.TEXT,
        },
        {
          id: 'section-count',
          type: QueryType.TAG,
          value: 'section',
          target: TargetType.TEXT,
        },
        {
          id: 'all-headings',
          type: QueryType.SELECTOR,
          value: 'h1, h2, h3',
          target: TargetType.TEXT,
        },
        {
          id: 'meta-description',
          type: QueryType.SELECTOR,
          value: 'meta[name="description"]',
          target: TargetType.ATTRIBUTE,
          attr: 'content',
        },
        {
          id: 'external-links',
          type: QueryType.SELECTOR,
          value: 'a[href^="http"]',
          target: TargetType.ATTRIBUTE,
          attr: 'href',
        },
      ]

      const results = queriable.multiQuery(queries)

      expect(results['page-title']).toBeDefined()
      expect(
        Array.isArray(results['page-title']) ? results['page-title'][0] : results['page-title']
      ).toBe('Test Page for Web Scraper')

      expect(results['main-heading']).toBeDefined()
      expect(
        Array.isArray(results['main-heading'])
          ? results['main-heading'][0]
          : results['main-heading']
      ).toBe('Test Page for Web Scraper')

      expect(results['section-count']).toBeDefined()
      expect(Array.isArray(results['section-count'])).toBe(true)
      expect((results['section-count'] as string[]).length).toBe(4)

      expect(results['all-headings']).toBeDefined()
      expect(Array.isArray(results['all-headings'])).toBe(true)
      expect((results['all-headings'] as string[]).length).toBe(8) // 1 h1 + 4 h2 + 3 h3

      expect(results['meta-description']).toBeDefined()
      expect(Array.isArray(results['meta-description'])).toBe(true)
      expect((results['meta-description'] as string[])[0]).toContain('Test page for web scraper')

      expect(results['external-links']).toBeDefined()
      expect(Array.isArray(results['external-links'])).toBe(true)
      expect((results['external-links'] as string[]).length).toBeGreaterThan(0)
      expect((results['external-links'] as string[])[0]).toContain('example.com')
    })
  })
})
