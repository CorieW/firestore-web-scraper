# Post-Installation Guide

After installing the extension, follow this guide to configure scraping tasks and manage extracted data. Below you'll find detailed instructions, document structures, and examples.

---

## **Setting Up a Task**
Create a document in your tasks collection **`${param:SCRAPE_COLLECTION}`** to define a scraping task. 

### **Task Document Structure**
| Field       | Type             | Description                                                                 |
|-------------|------------------|-----------------------------------------------------------------------------|
| `url`       | string           | **Required.** Target URL to scrape (e.g., `"https://example.com"`).        |
| `queries`   | array of objects | **Required.** List of queries to extract data from the HTML content.       |

### **1. `queries` Configuration**
Each query in the `queries` array narrows down elements from the HTML. Queries execute **in sequence**, with each subsequent query applied to the results of the previous one.

#### **1.1. Query Object**
| Field    | Type   | Description                                                                                   |
|----------|--------|-----------------------------------------------------------------------------------------------|
| `id`     | string | **Required.** Unique identifier for the query.                                                              |
| `type`   | string | **Required.** Selector type. Supported values: `id`, `class`, `tag`, `attribute`, `text`, `xpath`.          |
| `value`  | string | **Required.** Value for the selector (see examples below).                                                  |
| `target` | string (optional) | What to extract from the selected elements. Supported values: `html`, `text`, `attribute`. `html` is set by default |
| `attr`   | string (optional) | Attribute name to extract when `target` is set to `attribute`.                     |

#### **1.2. Examples by Query Type**
| Type         | `value` Example               | Description                                      |
|--------------|-------------------------------|--------------------------------------------------|
| **`id`**     | `"header"`                    | Select element with ID `#header`.                |
| **`class`**  | `"menu-item"`                 | Select elements with class `.menu-item`.         |
| **`tag`**    | `"a"`                         | Select all `<a>` tags.                           |
| **`attribute`** | `"href"` or `"[data-role='button']"` | Select elements with the `href` attribute or matching `data-role="button"`. |
| **`xpath`**  | `"//div[@class='content']"`   | Select elements using an XPath expression.       |
| **`selector`** | `"#header > h1"`              | Select elements using a CSS selector.            |

#### **1.3. Examples By Target Type**
| Target          | Description                                                                                   |
|-----------------|-----------------------------------------------------------------------------------------------|
| **`html`**      | Extracts the HTML content of the selected elements.                                           |
| **`inner`**     | Extracts the inner HTML content of the selected elements.                                      |
| **`text`**      | Extracts the text content of the selected elements.                                           |
| **`attribute`** | Extracts the value of the specified attribute from the selected elements.                     |


### **Example Task Document (Before Processing)**
```json
{
  "url": "https://example.com",
  "queries": [
    {
      "id": "title",
      "type": "xpath",
      "value": "//title",
      "target": "text"
    },
    {
      "id": "description",
      "type": "class",
      "value": "description"
    },
    {
      "id": "links",
      "type": "tag",
      "value": "a",
      "target": "attribute",
      "attr": "href"
    }
  ]
}
```

### **Example Data Document (After Processing)**
```json
{
  "url": "https://example.com",
  "queries": [
    {
      "id": "title",
      "type": "xpath",
      "value": "//title",
      "target": "text"
    },
    {
      "id": "description",
      "type": "class",
      "value": "description"
    },
    {
      "id": "links",
      "type": "tag",
      "value": "a",
      "target": "attribute",
      "attr": "href"
    }
  ],
  "data": {
    "title": "Example Domain",
    "description": "<p>This domain is for use in illustrative examples...</p>",
    "links": ["https://www.iana.org/domains/example", "https://www.iana.org/domains/reserved"]
  },
  "timestamp": "2023-01-01T00:00:00Z"
}
```