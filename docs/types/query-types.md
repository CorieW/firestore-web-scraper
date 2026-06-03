# Query Types

Query `type` controls how the scraper finds matching elements in the fetched document.

| Type        | Description                          | Example `value`   |
| ----------- | ------------------------------------ | ----------------- |
| `id`        | Select an element by ID.             | `main-heading`    |
| `class`     | Select elements by class name.       | `product-card`    |
| `tag`       | Select elements by tag name.         | `a`               |
| `attribute` | Select elements with an attribute.   | `data-id`         |
| `selector`  | Select elements with a CSS selector. | `main article h2` |

Use the selected query type with the `value` field in each query object:

```json
{
  "id": "title",
  "type": "selector",
  "value": "main article h1",
  "target": "text"
}
```
