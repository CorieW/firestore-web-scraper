import { Query, QueryType, TargetType } from '../types/Query';
import { warn } from 'firebase-functions/logger';

export function validateQuery(query: Query): void {
  if (!query) {
    throw new Error('Query is missing');
  }

  if (Object.keys(query).length === 0) {
    throw new Error('Query is empty');
  }

  if (typeof query !== 'object') {
    throw new Error("Query must be an object (or of type 'map')");
  }

  if (!query.id) {
    throw new Error("Query ID ('id') is missing");
  }

  if (typeof query.id !== 'string') {
    throw new Error("Query ID ('id') must be a string");
  }

  validateQueryType(query);

  if (!query.value) {
    throw new Error("Query value ('value') is missing");
  }

  if (typeof query.value !== 'string') {
    throw new Error("Query value ('value') must be a string");
  }

  validateTargetType(query);
  validateAttributeExtraction(query);
}

function validateQueryType(query: Query): void {
  if (!query.type) {
    throw new Error("Query type ('type') is missing");
  }

  if (typeof query.type !== 'string') {
    throw new Error("Query type ('type') must be a string");
  }

  if (!Object.values(QueryType).includes(query.type)) {
    throw new Error(
      `Invalid query type ('type'): '${query.type}'. Valid types are: ${Object.values(QueryType).join(', ')}`
    );
  }

  if (query.type === QueryType.XPATH) {
    throw new Error("Query type ('type') cannot be 'xpath'. This is not supported currently.");
  }
}

function validateTargetType(query: Query): void {
  if (!query.target) {
    throw new Error("Target type ('target') is missing");
  }

  if (typeof query.target !== 'string') {
    throw new Error("Target type ('target') must be a string");
  }

  if (!Object.values(TargetType).includes(query.target)) {
    throw new Error(
      `Invalid target type ('target'): '${query.target}'. Valid types are: ${Object.values(TargetType).join(', ')}`
    );
  }
}

function validateAttributeExtraction(query: Query): void {
  if (!query.attr) {
    return;
  }

  // If the target is not attribute and an attr is defined, warn the user
  if (query.target !== TargetType.ATTRIBUTE) {
    warn(
      `${query.id} defines a '${query.target}' target, which does not support 'attr' extraction.`
    );
  }

  if (typeof query.attr !== 'string') {
    throw new Error("Attribute name ('attr') must be a string");
  }

  // If target is attribute but no attr is provided, throw an error
  if (query.target === TargetType.ATTRIBUTE && !query.attr) {
    throw new Error("Attribute name ('attr') is required when target type is 'attribute'");
  }
}
