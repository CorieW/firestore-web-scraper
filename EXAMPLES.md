# Examples

## Task Document Structure

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

## Template Document Structure
Using the document id as the template id, the following is an example of a template document with the id `template-id`:

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
}
```

### Using a Template in a Task

To use a template in a task, add the template id to the task document in the **`template`** field.

```json
{
  "template": "template-id"
}
```

The template will be merged with the task document and the queries will be added to the task document. For example, by using the template above, the task document will now have the following queries:

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
}
```

### Template Merging

When a template is used in a task, the template's queries will be merged with the task's queries. Additionally, if a query in the template has the same id as a query in the task, the query in the task will take precedence.

**template document**
```json
{
  "url": "https://example.com",
  "queries": [
    {
      "id": "title",
      "type": "tag",
      "value": "h1",
      "target": "inner"
    },
    {
      "id": "description",
      "type": "class",
      "value": "description",
      "target": "html"
    }
  ]
}
```

**task document**
```json
{
  "url": "https://example.com",
  "queries": [
    {
      "id": "title",
      "type": "tag",
      "value": "h1",
      "target": "text"
    }
  ]
}
```

**merged task document**
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
    }
  ]
}
```