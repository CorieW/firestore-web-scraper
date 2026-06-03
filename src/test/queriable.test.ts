import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'
import { Queriable } from '../types/Queriable'
import { Query, QueryType, TargetType } from '../types/Query'

describe('Queriable with Test HTML Page', () => {
  let testHtml: string
  let queriable: Queriable

  beforeAll(() => {
    // Load the test HTML file
    const testHtmlPath = join(__dirname, 'web', 'index.html')
    testHtml = readFileSync(testHtmlPath, 'utf-8')
    queriable = new Queriable(testHtml)
  })

  describe('Query by ID', () => {
    it('should find elements by ID', () => {
      const query: Query = {
        id: 'test-listings',
        type: QueryType.ID,
        value: 'listings',
        target: TargetType.TEXT,
      }

      const result = queriable.query(query)
      expect(result).toBeDefined()
      expect(Array.isArray(result) ? result[0] : result).toContain('Listings')
    })

    it('should find info section by ID', () => {
      const query: Query = {
        id: 'test-info',
        type: QueryType.ID,
        value: 'info',
        target: TargetType.TEXT,
      }

      const result = queriable.query(query)
      expect(result).toBeDefined()
      expect(Array.isArray(result) ? result[0] : result).toContain('General Information')
    })

    it('should find data section by ID', () => {
      const query: Query = {
        id: 'test-data',
        type: QueryType.ID,
        value: 'data',
        target: TargetType.TEXT,
      }

      const result = queriable.query(query)
      expect(result).toBeDefined()
      expect(Array.isArray(result) ? result[0] : result).toContain('Data Table')
    })

    it('should find articles section by ID', () => {
      const query: Query = {
        id: 'test-articles',
        type: QueryType.ID,
        value: 'articles',
        target: TargetType.TEXT,
      }

      const result = queriable.query(query)
      expect(result).toBeDefined()
      expect(Array.isArray(result) ? result[0] : result).toContain('Articles')
    })
  })

  describe('Query by Class', () => {
    it('should find elements by class name', () => {
      const query: Query = {
        id: 'test-listing-class',
        type: QueryType.CLASS,
        value: 'listing',
        target: TargetType.TEXT,
      }

      const result = queriable.query(query)
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
      expect(result[0]).toContain('Listing Item')
    })
  })

  describe('Query by Tag', () => {
    it('should find all h2 elements', () => {
      const query: Query = {
        id: 'test-h2-tags',
        type: QueryType.TAG,
        value: 'h2',
        target: TargetType.TEXT,
      }

      const result = queriable.query(query)
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(4) // Listings, General Information, Data Table, Articles
      expect(result).toContain('Listings')
      expect(result).toContain('General Information')
      expect(result).toContain('Data Table')
      expect(result).toContain('Articles')
    })

    it('should find all h3 elements (articles)', () => {
      const query: Query = {
        id: 'test-h3-tags',
        type: QueryType.TAG,
        value: 'h3',
        target: TargetType.TEXT,
      }

      const result = queriable.query(query)
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(3) // 3 articles
      expect(result).toContain('Article 1: Introduction to Web Scraping')
      expect(result).toContain('Article 2: Tips for Effective Scraping')
      expect(result).toContain('Article 3: Challenges in Web Scraping')
    })

    it('should find all list items', () => {
      const query: Query = {
        id: 'test-li-tags',
        type: QueryType.TAG,
        value: 'li',
        target: TargetType.TEXT,
      }

      const result = queriable.query(query)
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(8) // nav items + listing items
    })
  })

  describe('Query by CSS Selector', () => {
    it('should find table data using CSS selector', () => {
      const query: Query = {
        id: 'test-table-data',
        type: QueryType.SELECTOR,
        value: 'table tbody tr',
        target: TargetType.TEXT,
      }

      const result = queriable.query(query)
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(4) // 4 data rows
      expect(result[0]).toContain('Alpha')
      expect(result[1]).toContain('Beta')
      expect(result[2]).toContain('Gamma')
      expect(result[3]).toContain('Delta')
    })

    it('should find specific table cells', () => {
      const query: Query = {
        id: 'test-table-names',
        type: QueryType.SELECTOR,
        value: 'table tbody tr td:nth-child(2)',
        target: TargetType.TEXT,
      }

      const result = queriable.query(query)
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(4)
      expect(result).toContain('Alpha')
      expect(result).toContain('Beta')
      expect(result).toContain('Gamma')
      expect(result).toContain('Delta')
    })

    it('should find navigation links', () => {
      const query: Query = {
        id: 'test-nav-links',
        type: QueryType.SELECTOR,
        value: 'nav ul li a',
        target: TargetType.TEXT,
      }

      const result = queriable.query(query)
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(4)
      expect(result).toContain('Listings')
      expect(result).toContain('Info')
      expect(result).toContain('Data')
      expect(result).toContain('Articles')
    })
  })

  describe('Query by Attribute', () => {
    it('should find elements with specific attributes', () => {
      const query: Query = {
        id: 'test-id-attribute',
        type: QueryType.ATTRIBUTE,
        value: 'id',
        target: TargetType.TEXT,
      }

      const result = queriable.query(query)
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(4) // 4 sections with IDs
    })

    it('should find links with href attribute', () => {
      const query: Query = {
        id: 'test-href-attribute',
        type: QueryType.ATTRIBUTE,
        value: 'href',
        target: TargetType.ATTRIBUTE,
        attr: 'href',
      }

      const result = queriable.query(query)
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
      expect(result).toContain('#listings')
      expect(result).toContain('#info')
      expect(result).toContain('#data')
      expect(result).toContain('#articles')
    })

    it('should find images with src attribute', () => {
      const query: Query = {
        id: 'test-img-src',
        type: QueryType.SELECTOR,
        value: 'img',
        target: TargetType.ATTRIBUTE,
        attr: 'src',
      }

      const result = queriable.query(query)
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(1)
      expect(result[0]).toContain('placeholder.com')
    })
  })

  describe('Different Target Types', () => {
    it('should extract HTML content', () => {
      const query: Query = {
        id: 'test-html-target',
        type: QueryType.TAG,
        value: 'h1',
        target: TargetType.HTML,
      }

      const result = queriable.query(query)
      expect(Array.isArray(result)).toBe(true)
      expect(result[0]).toContain('h1')
      expect(result[0]).toContain('Test Page for Web Scraper')
    })

    it('should extract inner HTML content', () => {
      const query: Query = {
        id: 'test-inner-html-target',
        type: QueryType.TAG,
        value: 'h1',
        target: TargetType.INNER_HTML,
      }

      const result = queriable.query(query)
      expect(Array.isArray(result)).toBe(true)
      expect(result[0]).toBe('Test Page for Web Scraper')
    })

    it('should extract text content', () => {
      const query: Query = {
        id: 'test-text-target',
        type: QueryType.TAG,
        value: 'h1',
        target: TargetType.TEXT,
      }

      const result = queriable.query(query)
      expect(Array.isArray(result)).toBe(true)
      expect(result[0]).toBe('Test Page for Web Scraper')
    })
  })

  describe('Multi-Query Functionality', () => {
    it('should handle multiple queries at once', () => {
      const queries: Query[] = [
        {
          id: 'page-title',
          type: QueryType.TAG,
          value: 'h1',
          target: TargetType.TEXT,
        },
        {
          id: 'section-headings',
          type: QueryType.TAG,
          value: 'h2',
          target: TargetType.TEXT,
        },
        {
          id: 'article-titles',
          type: QueryType.TAG,
          value: 'h3',
          target: TargetType.TEXT,
        },
        {
          id: 'table-data',
          type: QueryType.SELECTOR,
          value: 'table tbody tr td:nth-child(2)',
          target: TargetType.TEXT,
        },
      ]

      const results = queriable.multiQuery(queries)

      expect(results['page-title']).toBeDefined()
      expect(results['section-headings']).toBeDefined()
      expect(results['article-titles']).toBeDefined()
      expect(results['table-data']).toBeDefined()

      expect(
        Array.isArray(results['page-title']) ? results['page-title'][0] : results['page-title']
      ).toBe('Test Page for Web Scraper')
      expect(Array.isArray(results['section-headings'])).toBe(true)
      expect((results['section-headings'] as string[]).length).toBe(4)
      expect(Array.isArray(results['article-titles'])).toBe(true)
      expect((results['article-titles'] as string[]).length).toBe(3)
      expect(Array.isArray(results['table-data'])).toBe(true)
      expect((results['table-data'] as string[]).length).toBe(4)
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle queries for non-existent elements', () => {
      const query: Query = {
        id: 'non-existent',
        type: QueryType.ID,
        value: 'non-existent-id',
        target: TargetType.TEXT,
      }

      const result = queriable.query(query)
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(0)
    })

    it('should handle queries for non-existent classes', () => {
      const query: Query = {
        id: 'non-existent-class',
        type: QueryType.CLASS,
        value: 'non-existent-class',
        target: TargetType.TEXT,
      }

      const result = queriable.query(query)
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(0)
    })

    it('should handle complex CSS selectors', () => {
      const query: Query = {
        id: 'complex-selector',
        type: QueryType.SELECTOR,
        value: 'section#listings ul li',
        target: TargetType.TEXT,
      }

      const result = queriable.query(query)
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(5) // 5 listing items
      expect(result[0]).toContain('Listing Item 1')
    })
  })
})
