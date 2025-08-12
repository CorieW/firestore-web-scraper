import { describe, it, expect } from 'vitest'
import { validateTask } from '../validation/task-validation'
import { validateQuery } from '../validation/query-validation'
import { Task } from '../types/Task'
import { Query, QueryType, TargetType } from '../types/Query'

describe('Validation Tests - Complete Coverage', () => {
  describe('Task Validation - From Empty to Valid', () => {
    describe('Null/Undefined/Empty Tasks', () => {
      it('should reject null task', () => {
        expect(() => validateTask(null as any)).toThrow()
      })

      it('should reject undefined task', () => {
        expect(() => validateTask(undefined)).toThrow()
      })

      it('should reject empty object task', () => {
        expect(() => validateTask({} as any)).toThrow()
      })
    })

    describe('Tasks with Missing Required Fields', () => {
      it('should reject task missing URL field', () => {
        const task = {
          queries: [
            {
              id: 'test',
              type: QueryType.TAG,
              value: 'h1',
              target: TargetType.TEXT,
            },
          ],
        } as any

        expect(() => validateTask(task)).toThrow()
      })

      it('should reject task missing queries field', () => {
        const task = {
          url: 'https://example.com',
        } as any

        expect(() => validateTask(task)).toThrow()
      })

      it('should reject task missing both URL and queries', () => {
        const task = {
          someOtherField: 'value',
        } as any

        expect(() => validateTask(task)).toThrow()
      })
    })

    describe('Tasks with Invalid Field Types', () => {
      it('should reject task with non-string URL', () => {
        const task = {
          url: 123,
          queries: [],
        } as any

        expect(() => validateTask(task)).toThrow()
      })

      it('should reject task with boolean URL', () => {
        const task = {
          url: true,
          queries: [],
        } as any

        expect(() => validateTask(task)).toThrow()
      })

      it('should reject task with object URL', () => {
        const task = {
          url: { href: 'https://example.com' },
          queries: [],
        } as any

        expect(() => validateTask(task)).toThrow()
      })

      it('should reject task with non-array queries', () => {
        const task = {
          url: 'https://example.com',
          queries: 'not an array',
        } as any

        expect(() => validateTask(task)).toThrow()
      })

      it('should reject task with object queries', () => {
        const task = {
          url: 'https://example.com',
          queries: { id: 'test' },
        } as any

        expect(() => validateTask(task)).toThrow()
      })

      it('should reject task with null queries', () => {
        const task = {
          url: 'https://example.com',
          queries: null,
        } as any

        expect(() => validateTask(task)).toThrow()
      })
    })

    describe('Tasks with Invalid URLs', () => {
      it('should reject task with empty string URL', () => {
        const task: Task = {
          url: '',
          queries: [
            {
              id: 'test',
              type: QueryType.TAG,
              value: 'h1',
              target: TargetType.TEXT,
            },
          ],
        }

        expect(() => validateTask(task)).toThrow()
      })

      it('should reject task with whitespace-only URL', () => {
        const task: Task = {
          url: '   ',
          queries: [
            {
              id: 'test',
              type: QueryType.TAG,
              value: 'h1',
              target: TargetType.TEXT,
            },
          ],
        }

        expect(() => validateTask(task)).toThrow()
      })

      it('should reject task with invalid URL format', () => {
        const task: Task = {
          url: 'not-a-url',
          queries: [
            {
              id: 'test',
              type: QueryType.TAG,
              value: 'h1',
              target: TargetType.TEXT,
            },
          ],
        }

        expect(() => validateTask(task)).toThrow()
      })

      it('should reject task with malformed URL', () => {
        const task: Task = {
          url: 'http://',
          queries: [
            {
              id: 'test',
              type: QueryType.TAG,
              value: 'h1',
              target: TargetType.TEXT,
            },
          ],
        }

        expect(() => validateTask(task)).toThrow()
      })

      it('should reject task with URL containing only protocol', () => {
        const task: Task = {
          url: 'https://',
          queries: [
            {
              id: 'test',
              type: QueryType.TAG,
              value: 'h1',
              target: TargetType.TEXT,
            },
          ],
        }

        expect(() => validateTask(task)).toThrow()
      })
    })

    describe('Tasks with Empty Queries Array', () => {
      it('should reject task with empty queries array', () => {
        const task: Task = {
          url: 'https://example.com',
          queries: [],
        }

        expect(() => validateTask(task)).toThrow()
      })
    })

    describe('Tasks with Valid URLs but Edge Cases', () => {
      it('should accept task with HTTP URL', () => {
        const task: Task = {
          url: 'http://example.com',
          queries: [
            {
              id: 'test',
              type: QueryType.TAG,
              value: 'h1',
              target: TargetType.TEXT,
            },
          ],
        }

        expect(() => validateTask(task)).not.toThrow()
      })

      it('should accept task with HTTPS URL', () => {
        const task: Task = {
          url: 'https://example.com',
          queries: [
            {
              id: 'test',
              type: QueryType.TAG,
              value: 'h1',
              target: TargetType.TEXT,
            },
          ],
        }

        expect(() => validateTask(task)).not.toThrow()
      })

      it('should accept task with URL containing port', () => {
        const task: Task = {
          url: 'https://example.com:8080',
          queries: [
            {
              id: 'test',
              type: QueryType.TAG,
              value: 'h1',
              target: TargetType.TEXT,
            },
          ],
        }

        expect(() => validateTask(task)).not.toThrow()
      })

      it('should accept task with URL containing path', () => {
        const task: Task = {
          url: 'https://example.com/path/to/page',
          queries: [
            {
              id: 'test',
              type: QueryType.TAG,
              value: 'h1',
              target: TargetType.TEXT,
            },
          ],
        }

        expect(() => validateTask(task)).not.toThrow()
      })

      it('should accept task with URL containing query parameters', () => {
        const task: Task = {
          url: 'https://example.com?param=value&other=123',
          queries: [
            {
              id: 'test',
              type: QueryType.TAG,
              value: 'h1',
              target: TargetType.TEXT,
            },
          ],
        }

        expect(() => validateTask(task)).not.toThrow()
      })

      it('should accept task with URL containing fragment', () => {
        const task: Task = {
          url: 'https://example.com#section',
          queries: [
            {
              id: 'test',
              type: QueryType.TAG,
              value: 'h1',
              target: TargetType.TEXT,
            },
          ],
        }

        expect(() => validateTask(task)).not.toThrow()
      })

      it('should accept task with localhost URL', () => {
        const task: Task = {
          url: 'http://localhost:3000',
          queries: [
            {
              id: 'test',
              type: QueryType.TAG,
              value: 'h1',
              target: TargetType.TEXT,
            },
          ],
        }

        expect(() => validateTask(task)).not.toThrow()
      })
    })

    describe('Fully Valid Tasks', () => {
      it('should accept minimal valid task', () => {
        const task: Task = {
          url: 'https://example.com',
          queries: [
            {
              id: 'test',
              type: QueryType.TAG,
              value: 'h1',
              target: TargetType.TEXT,
            },
          ],
        }

        expect(() => validateTask(task)).not.toThrow()
      })

      it('should accept task with multiple queries', () => {
        const task: Task = {
          url: 'https://example.com',
          queries: [
            {
              id: 'title',
              type: QueryType.TAG,
              value: 'h1',
              target: TargetType.TEXT,
            },
            {
              id: 'content',
              type: QueryType.CLASS,
              value: 'content',
              target: TargetType.TEXT,
            },
            {
              id: 'links',
              type: QueryType.SELECTOR,
              value: 'a[href]',
              target: TargetType.ATTRIBUTE,
              attr: 'href',
            },
          ],
        }

        expect(() => validateTask(task)).not.toThrow()
      })

      it('should accept task with complex queries', () => {
        const task: Task = {
          url: 'https://example.com/products',
          queries: [
            {
              id: 'page-title',
              type: QueryType.TAG,
              value: 'title',
              target: TargetType.TEXT,
            },
            {
              id: 'product-names',
              type: QueryType.CLASS,
              value: 'product-name',
              target: TargetType.TEXT,
            },
            {
              id: 'product-prices',
              type: QueryType.SELECTOR,
              value: '.product .price',
              target: TargetType.TEXT,
            },
            {
              id: 'product-images',
              type: QueryType.SELECTOR,
              value: '.product img',
              target: TargetType.ATTRIBUTE,
              attr: 'src',
            },
            {
              id: 'meta-description',
              type: QueryType.SELECTOR,
              value: 'meta[name="description"]',
              target: TargetType.ATTRIBUTE,
              attr: 'content',
            },
          ],
        }

        expect(() => validateTask(task)).not.toThrow()
      })
    })
  })

  describe('Query Validation - From Invalid to Valid', () => {
    describe('Null/Undefined/Empty Queries', () => {
      it('should reject null query', () => {
        expect(() => validateQuery(null as any)).toThrow()
      })

      it('should reject undefined query', () => {
        expect(() => validateQuery(undefined as any)).toThrow()
      })

      it('should reject empty object query', () => {
        expect(() => validateQuery({} as any)).toThrow()
      })

      it('should reject non-object query', () => {
        expect(() => validateQuery('string' as any)).toThrow()
      })

      it('should reject number query', () => {
        expect(() => validateQuery(123 as any)).toThrow()
      })

      it('should reject boolean query', () => {
        expect(() => validateQuery(true as any)).toThrow()
      })
    })

    describe('Queries with Missing Required Fields', () => {
      it('should reject query missing id', () => {
        const query = {
          type: QueryType.TAG,
          value: 'h1',
          target: TargetType.TEXT,
        } as any

        expect(() => validateQuery(query)).toThrow()
      })

      it('should reject query missing type', () => {
        const query = {
          id: 'test',
          value: 'h1',
          target: TargetType.TEXT,
        } as any

        expect(() => validateQuery(query)).toThrow()
      })

      it('should reject query missing value', () => {
        const query = {
          id: 'test',
          type: QueryType.TAG,
          target: TargetType.TEXT,
        } as any

        expect(() => validateQuery(query)).toThrow()
      })

      it('should reject query missing target', () => {
        const query = {
          id: 'test',
          type: QueryType.TAG,
          value: 'h1',
        } as any

        expect(() => validateQuery(query)).toThrow()
      })
    })

    describe('Queries with Invalid Field Types', () => {
      it('should reject query with non-string id', () => {
        const query = {
          id: 123,
          type: QueryType.TAG,
          value: 'h1',
          target: TargetType.TEXT,
        } as any

        expect(() => validateQuery(query)).toThrow()
      })

      it('should reject query with null id', () => {
        const query = {
          id: null,
          type: QueryType.TAG,
          value: 'h1',
          target: TargetType.TEXT,
        } as any

        expect(() => validateQuery(query)).toThrow()
      })

      it('should reject query with empty string id', () => {
        const query = {
          id: '',
          type: QueryType.TAG,
          value: 'h1',
          target: TargetType.TEXT,
        } as any

        expect(() => validateQuery(query)).toThrow()
      })

      it('should reject query with whitespace-only id', () => {
        const query = {
          id: '   ',
          type: QueryType.TAG,
          value: 'h1',
          target: TargetType.TEXT,
        } as any

        expect(() => validateQuery(query)).toThrow()
      })

      it('should reject query with invalid type', () => {
        const query = {
          id: 'test',
          type: 'invalid-type',
          value: 'h1',
          target: TargetType.TEXT,
        } as any

        expect(() => validateQuery(query)).toThrow()
      })

      it('should reject query with non-string type', () => {
        const query = {
          id: 'test',
          type: 123,
          value: 'h1',
          target: TargetType.TEXT,
        } as any

        expect(() => validateQuery(query)).toThrow()
      })

      it('should reject query with non-string value', () => {
        const query = {
          id: 'test',
          type: QueryType.TAG,
          value: 123,
          target: TargetType.TEXT,
        } as any

        expect(() => validateQuery(query)).toThrow()
      })

      it('should reject query with null value', () => {
        const query = {
          id: 'test',
          type: QueryType.TAG,
          value: null,
          target: TargetType.TEXT,
        } as any

        expect(() => validateQuery(query)).toThrow()
      })

      it('should reject query with empty string value', () => {
        const query = {
          id: 'test',
          type: QueryType.TAG,
          value: '',
          target: TargetType.TEXT,
        } as any

        expect(() => validateQuery(query)).toThrow()
      })

      it('should reject query with invalid target', () => {
        const query = {
          id: 'test',
          type: QueryType.TAG,
          value: 'h1',
          target: 'invalid-target',
        } as any

        expect(() => validateQuery(query)).toThrow()
      })

      it('should reject query with non-string target', () => {
        const query = {
          id: 'test',
          type: QueryType.TAG,
          value: 'h1',
          target: 123,
        } as any

        expect(() => validateQuery(query)).toThrow()
      })
    })

    describe('Queries with Missing Required Attribute Field', () => {
      it('should reject ATTRIBUTE target query without attr field', () => {
        const query = {
          id: 'test',
          type: QueryType.SELECTOR,
          value: 'img',
          target: TargetType.ATTRIBUTE,
        } as any

        expect(() => validateQuery(query)).toThrow()
      })

      it('should reject ATTRIBUTE target query with empty attr field', () => {
        const query = {
          id: 'test',
          type: QueryType.SELECTOR,
          value: 'img',
          target: TargetType.ATTRIBUTE,
          attr: '',
        } as any

        expect(() => validateQuery(query)).toThrow()
      })

      it('should reject ATTRIBUTE target query with null attr field', () => {
        const query = {
          id: 'test',
          type: QueryType.SELECTOR,
          value: 'img',
          target: TargetType.ATTRIBUTE,
          attr: null,
        } as any

        expect(() => validateQuery(query)).toThrow()
      })

      it('should reject ATTRIBUTE target query with non-string attr field', () => {
        const query = {
          id: 'test',
          type: QueryType.SELECTOR,
          value: 'img',
          target: TargetType.ATTRIBUTE,
          attr: 123,
        } as any

        expect(() => validateQuery(query)).toThrow()
      })
    })

    describe('Special Query Type Validation', () => {
      it('should reject XPATH query type (not supported)', () => {
        const query = {
          id: 'test',
          type: QueryType.XPATH,
          value: '//h1',
          target: TargetType.TEXT,
        } as any

        expect(() => validateQuery(query)).toThrow()
      })
    })

    describe('Edge Cases for Each Query Type', () => {
      it('should accept ID query with valid data', () => {
        const query: Query = {
          id: 'test-id',
          type: QueryType.ID,
          value: 'main-content',
          target: TargetType.TEXT,
        }

        expect(() => validateQuery(query)).not.toThrow()
      })

      it('should accept CLASS query with valid data', () => {
        const query: Query = {
          id: 'test-class',
          type: QueryType.CLASS,
          value: 'content-wrapper',
          target: TargetType.TEXT,
        }

        expect(() => validateQuery(query)).not.toThrow()
      })

      it('should accept TAG query with valid data', () => {
        const query: Query = {
          id: 'test-tag',
          type: QueryType.TAG,
          value: 'h1',
          target: TargetType.TEXT,
        }

        expect(() => validateQuery(query)).not.toThrow()
      })

      it('should accept ATTRIBUTE query with valid data', () => {
        const query: Query = {
          id: 'test-attr',
          type: QueryType.ATTRIBUTE,
          value: 'data-id',
          target: TargetType.TEXT,
        }

        expect(() => validateQuery(query)).not.toThrow()
      })

      it('should accept SELECTOR query with valid data', () => {
        const query: Query = {
          id: 'test-selector',
          type: QueryType.SELECTOR,
          value: '.content > p:first-child',
          target: TargetType.TEXT,
        }

        expect(() => validateQuery(query)).not.toThrow()
      })
    })

    describe('Edge Cases for Each Target Type', () => {
      it('should accept TEXT target', () => {
        const query: Query = {
          id: 'test-text',
          type: QueryType.TAG,
          value: 'p',
          target: TargetType.TEXT,
        }

        expect(() => validateQuery(query)).not.toThrow()
      })

      it('should accept HTML target', () => {
        const query: Query = {
          id: 'test-html',
          type: QueryType.TAG,
          value: 'div',
          target: TargetType.HTML,
        }

        expect(() => validateQuery(query)).not.toThrow()
      })

      it('should accept INNER_HTML target', () => {
        const query: Query = {
          id: 'test-inner',
          type: QueryType.TAG,
          value: 'span',
          target: TargetType.INNER_HTML,
        }

        expect(() => validateQuery(query)).not.toThrow()
      })

      it('should accept ATTRIBUTE target with attr field', () => {
        const query: Query = {
          id: 'test-attr-target',
          type: QueryType.SELECTOR,
          value: 'img',
          target: TargetType.ATTRIBUTE,
          attr: 'src',
        }

        expect(() => validateQuery(query)).not.toThrow()
      })
    })

    describe('Complex Valid Queries', () => {
      it('should accept query with complex CSS selector', () => {
        const query: Query = {
          id: 'complex-selector',
          type: QueryType.SELECTOR,
          value: 'div.container > .content-section:nth-child(2) p.highlight',
          target: TargetType.TEXT,
        }

        expect(() => validateQuery(query)).not.toThrow()
      })

      it('should accept query with attribute extraction', () => {
        const query: Query = {
          id: 'image-sources',
          type: QueryType.SELECTOR,
          value: '.gallery img[data-src]',
          target: TargetType.ATTRIBUTE,
          attr: 'data-src',
        }

        expect(() => validateQuery(query)).not.toThrow()
      })

      it('should accept query with pseudo-selectors', () => {
        const query: Query = {
          id: 'first-paragraph',
          type: QueryType.SELECTOR,
          value: 'article p:first-of-type',
          target: TargetType.TEXT,
        }

        expect(() => validateQuery(query)).not.toThrow()
      })

      it('should accept query with attribute selectors', () => {
        const query: Query = {
          id: 'external-links',
          type: QueryType.SELECTOR,
          value: 'a[href^="http"]:not([href*="mysite.com"])',
          target: TargetType.ATTRIBUTE,
          attr: 'href',
        }

        expect(() => validateQuery(query)).not.toThrow()
      })

      it('should accept query with special characters in CSS selector', () => {
        const query: Query = {
          id: 'special-chars',
          type: QueryType.SELECTOR,
          value: '[data-test-id="product-item"]:nth-of-type(2n+1)',
          target: TargetType.TEXT,
        }

        expect(() => validateQuery(query)).not.toThrow()
      })
    })

    describe('Warnings for Non-Attribute Targets with Attr Field', () => {
      it('should accept but warn when non-ATTRIBUTE target has attr field', () => {
        const query: Query = {
          id: 'test-warning',
          type: QueryType.TAG,
          value: 'div',
          target: TargetType.TEXT,
          attr: 'class',
        }

        expect(() => validateQuery(query)).not.toThrow()
      })
    })
  })

  describe('Integration - Task with Invalid Queries', () => {
    it('should accept task with valid queries array', () => {
      const task: Task = {
        url: 'https://example.com',
        queries: [
          {
            id: 'valid-query-1',
            type: QueryType.TAG,
            value: 'h1',
            target: TargetType.TEXT,
          },
          {
            id: 'valid-query-2',
            type: QueryType.CLASS,
            value: 'content',
            target: TargetType.TEXT,
          },
        ],
      }

      expect(() => validateTask(task)).not.toThrow()
    })

    it('should accept task with single query', () => {
      const task: Task = {
        url: 'https://example.com',
        queries: [
          {
            id: 'single-query',
            type: QueryType.SELECTOR,
            value: '.main-content',
            target: TargetType.TEXT,
          },
        ],
      }

      expect(() => validateTask(task)).not.toThrow()
    })

    it('should accept task with attribute extraction query', () => {
      const task: Task = {
        url: 'https://example.com',
        queries: [
          {
            id: 'image-src',
            type: QueryType.SELECTOR,
            value: 'img.hero',
            target: TargetType.ATTRIBUTE,
            attr: 'src',
          },
        ],
      }

      expect(() => validateTask(task)).not.toThrow()
    })

    it('should accept task with mixed query types', () => {
      const task: Task = {
        url: 'https://example.com',
        queries: [
          {
            id: 'title-by-tag',
            type: QueryType.TAG,
            value: 'h1',
            target: TargetType.TEXT,
          },
          {
            id: 'content-by-class',
            type: QueryType.CLASS,
            value: 'article-content',
            target: TargetType.TEXT,
          },
          {
            id: 'main-by-id',
            type: QueryType.ID,
            value: 'main-content',
            target: TargetType.TEXT,
          },
          {
            id: 'links-by-selector',
            type: QueryType.SELECTOR,
            value: 'nav a',
            target: TargetType.ATTRIBUTE,
            attr: 'href',
          },
          {
            id: 'data-attrs',
            type: QueryType.ATTRIBUTE,
            value: 'data-product-id',
            target: TargetType.ATTRIBUTE,
            attr: 'data-product-id',
          },
        ],
      }

      expect(() => validateTask(task)).not.toThrow()
    })

    it('should accept task with all supported target types', () => {
      const task: Task = {
        url: 'https://example.com',
        queries: [
          {
            id: 'text-content',
            type: QueryType.TAG,
            value: 'p',
            target: TargetType.TEXT,
          },
          {
            id: 'html-content',
            type: QueryType.TAG,
            value: 'div',
            target: TargetType.HTML,
          },
          {
            id: 'inner-html-content',
            type: QueryType.TAG,
            value: 'span',
            target: TargetType.INNER_HTML,
          },
          {
            id: 'attribute-content',
            type: QueryType.SELECTOR,
            value: 'img',
            target: TargetType.ATTRIBUTE,
            attr: 'alt',
          },
        ],
      }

      expect(() => validateTask(task)).not.toThrow()
    })
  })
})
