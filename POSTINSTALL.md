# Post-Installation Guide

Welcome! After installing the extension, use this guide to set up scraping tasks and manage your extracted data. This document covers configuration steps, document structures, and helpful examples.

## Tasks

A **task** defines what to scrape and how. Each task is stored in the **`${param:SCRAPE_COLLECTION}`** collection.

### Task Document Structure

A task document must include:

- **url** (`string`): The target URL to scrape (e.g., `"https://example.com"`).
- **queries** (`array` of objects): An array of queries specifying what data to extract from the HTML.

### Query Configuration

Each query in the `queries` array describes how to select elements and what to extract from them. You can include multiple queries to extract different data from the same page.

#### Query Object Fields

- **id** (`string`, required): Unique identifier for the query. This becomes the key in the output `data` object.
- **type** (`string`, required): Selector type. Supported values:
  - `id`: Select by element ID
  - `class`: Select by CSS class
  - `tag`: Select by HTML tag
  - `attribute`: Select by attribute
  - `selector`: Select using a CSS selector
- **value** (`string`, required): The selector value (e.g., class name, tag name, attribute name, or CSS selector).
- **target** (`string`, optional): What to extract from the selected elements. Supported values:
  - `html`: Extract the HTML content (default)
  - `text`: Extract the text content
  - `inner`: Extract the inner HTML content
  - `attribute`: Extract the value of a specific attribute
- **attr** (`string`, only required if `target` is `attribute`): The attribute name to extract (e.g., `"href"`).

## Templates

Templates let you reuse query configurations across multiple tasks. To create a template, add a document to your templates collection (**`${param:TEMPLATES_COLLECTION}`**) with the same structure as a task document.

You can then reference a template in your task documents to avoid repeating query definitions.

## Examples

See the [Examples](https://github.com/CorieW/firestore-web-scraper/blob/master/EXAMPLES.md) file for examples of the document structures for tasks and templates.