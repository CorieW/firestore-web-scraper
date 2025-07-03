# Post-Installation Guide

After installing the extension, follow this guide to configure scraping tasks and manage extracted data. Below you'll find detailed instructions, document structures, and examples.

## Setting Up a Task
Create a document in your tasks collection **`${param:SCRAPE_COLLECTION}`** to define a scraping task.

---

### Task Document Structure

#### Required Fields:
- **url** (string): Target URL to scrape (e.g., `"https://example.com"`)
- **queries** (array of objects): List of queries to extract data from the HTML content

---

### Query Configuration
Each query in the `queries` array narrows down specific elements from the HTML. Multiple queries can be used to extract different types of data from the same HTML.

#### Query Object Fields:
- **id** (string, required): Unique identifier for the query. Will be used as the key in the output `data` object.
- **type** (string, required): Selector type. Supported values:
  - `id`: Select by element ID
  - `class`: Select by CSS class
  - `tag`: Select by HTML tag
  - `attribute`: Select by attribute
  - `text`: Select by text content
  - `selector`: Select using CSS selector
- **value** (string, required): Value for the selector
- **target** (string, optional): What to extract from selected elements
  - `html`: Extract HTML content (default)
  - `text`: Extract text content
  - `attribute`: Extract attribute value
- **attr** (string, optional): Attribute name to extract when `target` is set to `attribute`. Only allowed when `type` is `attribute`.

---

### Query Type Examples

#### ID Selector
```json
{
  "id": "header",
  "type": "id",
  "value": "header",
  "target": "html"
}
```
Selects element with ID `#header`

#### Class Selector
```json
{
  "id": "menu",
  "type": "class",
  "value": "menu-item",
  "target": "html"
}
```
Selects elements with class `.menu-item`

#### Tag Selector
```json
{
  "id": "links",
  "type": "tag",
  "value": "a",
  "target": "html"
}
```
Selects all `<a>` tags

#### Attribute Selector
```json
{
  "id": "buttons",
  "type": "attribute",
  "value": "data-role",
  "target": "attribute",
  "attr": "data-role"
}
```
Selects elements with matching attribute

#### CSS Selector
```json
{
  "id": "content",
  "type": "selector",
  "value": "div.content",
  "target": "html"
}
```
Selects elements using CSS selector

---

### Target Type Examples

#### HTML Target
```json
{
  "id": "content",
  "type": "class",
  "value": "content",
  "target": "html"
}
```
Extracts the HTML content of selected elements

#### Text Target
```json
{
  "id": "title",
  "type": "tag",
  "value": "h1",
  "target": "text"
}
```
Extracts the text content of selected elements

#### Attribute Target
```json
{
  "id": "links",
  "type": "tag",
  "value": "a",
  "target": "attribute",
  "attr": "href"
}
```
Extracts the value of specified attribute from selected elements

---

### Complete Example

#### Task Document (Before Processing)
```json
{
  "url": "https://example.com",
  "queries": [
    {
      "id": "title",
      "type": "tag",
      "value": "h1",
      "target": "text"
    },
    {
      "id": "description",
      "type": "class",
      "value": "description",
      "target": "html"
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

Extracts the text content of the `<h1>` tag, the text content of the element with class `description`, and the value of the `href` attribute from all `<a>` tags.

#### Result Document (After Processing)
```json
{
  "url": "https://example.com",
  "queries": [
    {
      "id": "title",
      "type": "tag",
      "value": "h1",
      "target": "text"
    },
    {
      "id": "description",
      "type": "class",
      "value": "description",
      "target": "html"
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
    "title": ["Example Domain"],
    "description": ["<p>This domain is for use in illustrative examples...</p>"],
    "links": ["https://www.iana.org/domains/example", "https://www.iana.org/domains/reserved"]
  },
  "startedAt": "2023-01-01T00:00:00Z",
  "concludedAt": "2023-01-01T00:00:00Z",
  "stage": "Success"
}
```