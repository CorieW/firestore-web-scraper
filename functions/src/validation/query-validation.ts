import { ATTRIBUTE_KEY, ID_KEY, Query, QueryType, TARGET_KEY, TargetType, TYPE_KEY, VALUE_KEY } from "../types/Query";
import { warn } from 'firebase-functions/logger';

export function validateQuery(query: Query): void {
  if (typeof query !== 'object') {
    throw new Error("Query must be provided as an object (or of type 'map')");
  }

  if (Object.keys(query).length === 0) {
    throw new Error("Query is empty");
  }

  if (typeof query[ID_KEY] !== 'string') {
    throw new Error(`Query ID ('${ID_KEY}') must be provided as a string`);
  }

  validateQueryType(query);

  if (typeof query[VALUE_KEY] !== 'string') {
    throw new Error(`Query value ('${VALUE_KEY}') must be provided as a string`);
  }

  validateTargetType(query);
  validateAttributeExtraction(query);
}

function validateQueryType(query: Query): void {
  if (typeof query[TYPE_KEY] !== 'string') {
    throw new Error(`Query type ('${TYPE_KEY}') must be provided as a string`);
  }

  if (!Object.values(QueryType).includes(query[TYPE_KEY])) {
    throw new Error(`Invalid query type ('${TYPE_KEY}'): '${query[TYPE_KEY]}'. Valid types are: ${Object.values(QueryType).join(', ')}`);
  }

  // TODO: Remove when supported
  if (query[TYPE_KEY] === QueryType.XPATH) {
    throw new Error(`Query type ('${TYPE_KEY}') cannot be 'xpath'. This is not supported currently.`);
  }
}

function validateTargetType(query: Query): void {
  if (typeof query[TARGET_KEY] !== 'string') {
    throw new Error(`Target type ('${TARGET_KEY}') must be provided as a string`);
  }

  if (!Object.values(TargetType).includes(query[TARGET_KEY])) {
    throw new Error(`Invalid target type ('${TARGET_KEY}'): '${query[TARGET_KEY]}'. Valid types are: ${Object.values(TargetType).join(', ')}`);
  }
}

function validateAttributeExtraction(query: Query): void {
  // No attribute name provided, but that's fine, as target not specified as targetting attribute
  if (!query[ATTRIBUTE_KEY] && query[TARGET_KEY] !== TargetType.ATTRIBUTE) {
    return;
  }

  // If the target is not attribute and an attr is defined, warn the user
  if (query[TARGET_KEY] !== TargetType.ATTRIBUTE) {
    warn(`${query[ID_KEY]} defines a '${TARGET_KEY}' target, which does not support '${ATTRIBUTE_KEY}' extraction.`);
  }

  if (typeof query[ATTRIBUTE_KEY] !== 'string') {
    throw new Error(`Attribute name ('${ATTRIBUTE_KEY}') must be provided as a string`);
  }

  // If target is attribute but no attr is provided, throw an error
  if (query.target === TargetType.ATTRIBUTE && !query[ATTRIBUTE_KEY]) {
    throw new Error(`Attribute name ('${ATTRIBUTE_KEY}') is required when target type is 'attribute'`);
  }
}
