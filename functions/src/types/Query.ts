// These are used for dynamic logging where the key of a property is output
export const ID_KEY = "id";
export const TYPE_KEY = "type";
export const VALUE_KEY = "value";
export const TARGET_KEY = "target";
export const ATTRIBUTE_KEY = "attr";

export interface Query {
  [ID_KEY]: string;         // Unique identifier for the query.
  [TYPE_KEY]: QueryType;    // Type of query to run.
  [VALUE_KEY]: string;      // Value to use for the query.
  [TARGET_KEY]?: TargetType; // Type of data to extract.
  [ATTRIBUTE_KEY]?: string;       // (Optional) Attribute to extract.
}

export enum QueryType {
  ID = 'id',
  CLASS = 'class',
  TAG = 'tag',
  ATTRIBUTE = 'attribute',
  XPATH = 'xpath',
  SELECTOR = 'selector',
}

export enum TargetType {
  HTML = 'html',
  INNER_HTML = 'inner',
  TEXT = 'text',
  ATTRIBUTE = 'attribute',
}
