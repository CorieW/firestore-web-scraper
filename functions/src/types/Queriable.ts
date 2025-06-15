import { JSDOM, DOMWindow } from 'jsdom';
// import * as xpath from 'xpath';

import { Query, QueryType, TargetType } from "./Query";
import * as logs from '../logs';

export class Queriable {
  private _html: string;

  private _window: DOMWindow;
  private _doc: Document;

  constructor(html: string) {
    this._html = html;

    // Parse the HTML using JSDOM
    const dom = new JSDOM(this._html);

    this._window = dom.window;
    this._doc = window.document;
  }

  /**
   * Parses the HTML for data (based on queries) and outputs it.
   * @returns Data from the queries.
   */
  query(queries: Query[]): { [key: string]: string[] | string } {
    // Run all queries
    return this.multiQuery(queries);
  }

  private querySingle(query: Query): string[] | string {
    let nodes = null;

    switch (query.type) {
      case QueryType.ID:
        // Searches for an element with a matching id attribute.
        nodes = this._doc.getElementById(query.value);
        break;
      case QueryType.CLASS:
        // Searches for an element with a matching class attribute.
        nodes = this.convertToArray(this._doc.getElementsByClassName(query.value));
        break;
      case QueryType.TAG:
        // Searches for elements by tag name.
        nodes = this.convertToArray(this._doc.getElementsByTagName(query.value));
        break;
      case QueryType.ATTRIBUTE:
        // Searches for elements that have a specified attribute.
        nodes = this.convertToArray(this._doc.querySelectorAll(`[${query.value}]`));
        break;
      case QueryType.SELECTOR:
        // Searches for elements using a CSS selector.
        nodes = this.convertToArray(this._doc.querySelectorAll(query.value));
        break;
    }

    // Handle non-array results (convert to array for consistency)
    const nodeArray = Array.isArray(nodes) ? nodes as Node[] : [nodes as Node];

    logs.debug(`Query: ${query.id} - ${nodeArray.length} nodes found.`);
    logs.debug(`Nodes: ${JSON.stringify(nodes)}`);

    // Serialize the nodes to strings
    const serializer = new this._window.XMLSerializer();
    // Retrieve the data using the specified target type
    let result: string[] = [];
    nodeArray.forEach((node) => {
      if (node === undefined) return; // Skip undefined nodes

      switch (query.target) {
        case TargetType.HTML:
          // Retrieve the HTML content of the node
          result.push(serializer.serializeToString(node));
          break;
        case TargetType.INNER_HTML:
          // Retrieve the inner HTML content of the node
          result.push((node as Element).innerHTML);
          break;
        case TargetType.TEXT:
          // Retrieve the text content of the node
          result.push((node as Element).textContent);
          break;
        case TargetType.ATTRIBUTE:
          // Retrieve the attribute value
          const attrValue = (node as Element).getAttribute(query.attr!);
          result.push(attrValue || "");
          break;
      }
    });

    // Return the result as a single value (if possible) or an array
    return result.length === 1 ? result[0] : result;
  }

  private multiQuery(queries: Query[]): { [key: string]: string[] | string } {
    let results: { [key: string]: string[] | string } = {};

    queries.forEach((query) => {
      results[query.id] = this.querySingle(query);
    });

    return results;
  }

  private convertToArray(collection: NodeListOf<Element> | HTMLCollection): Element[] {
    let array: Element[] = [];
    for (let i = 0; i < collection.length; i++) {
      array.push(collection.item(i));
    }
    return array;
  }
}