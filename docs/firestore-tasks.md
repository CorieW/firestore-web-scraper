# Firestore Tasks

Create a document in the configured `scrapeCollection` to start a scraping task. The function processes newly-created documents only.

## Task Document

Required fields:

| Field     | Type   | Description                                           |
| --------- | ------ | ----------------------------------------------------- |
| `url`     | string | Absolute URL to scrape.                               |
| `queries` | array  | One or more query objects describing data to extract. |

```json
{
  "url": "https://example.com",
  "queries": [
    {
      "id": "heading",
      "type": "selector",
      "value": "h1",
      "target": "text"
    }
  ]
}
```

## Query Object

| Field    | Type   | Description                                                                    |
| -------- | ------ | ------------------------------------------------------------------------------ |
| `id`     | string | Unique key used in the output `data` object.                                   |
| `type`   | string | Selector strategy. See [Query Types](./types/query-types.md).                  |
| `value`  | string | Selector value.                                                                |
| `target` | string | Data to extract from matching elements. See [Extraction Targets](./types/targets.md). |
| `attr`   | string | Attribute name when `target` is `attribute`.                                   |

## Document Examples

Extract text from a heading on the `https://example.com` page:

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

Extract links from the `https://example.com` page:

```json
{
  "url": "https://example.com",
  "queries": [
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

Extract repeated product cards and store the HTML, name, and price of each product on the `https://example.com` page:

```json
{
  "url": "https://example.com",
  "queries": [
    {
      "id": "products",
      "type": "selector",
      "value": ".product-card",
      "target": "html"
    },
    {
      "id": "product-names",
      "type": "selector",
      "value": ".product-card h2",
      "target": "text"
    },
    {
      "id": "product-prices",
      "type": "selector",
      "value": ".product-card p",
      "target": "text"
    }
  ]
}
```

## Result Document

The function updates the same document with processing metadata and extracted data.

```json
{
  "url": "https://example.com",
  "queries": [
    {
      "id": "heading",
      "type": "selector",
      "value": "h1",
      "target": "text"
    }
  ],
  "data": {
    "heading": ["Example Domain"]
  },
  "startedAt": "Firestore Timestamp",
  "concludedAt": "Firestore Timestamp",
  "stage": "Success"
}
```

If validation or scraping fails, the document is updated with `stage: "Error"` and an `error` message.
