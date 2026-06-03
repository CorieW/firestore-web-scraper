# Extraction Targets

Query `target` controls what data the scraper extracts from each matched element.

| Target      | Description                                                |
| ----------- | ---------------------------------------------------------- |
| `html`      | Serialized HTML for each matched element.                  |
| `inner`     | Inner HTML for each matched element.                       |
| `text`      | Text content for each matched element.                     |
| `attribute` | Attribute value for each matched element. Requires `attr`. |

When `target` is `attribute`, provide the attribute name with `attr`:

```json
{
  "id": "links",
  "type": "tag",
  "value": "a",
  "target": "attribute",
  "attr": "href"
}
```
