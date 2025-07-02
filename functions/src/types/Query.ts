export interface Query {
  id: string; // Unique identifier for the query.
  type: QueryType; // Type of query to run.
  value: string; // Value to use for the query.
  target?: TargetType; // Type of data to extract.
  attr?: string; // (Optional) Attribute to extract.
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
