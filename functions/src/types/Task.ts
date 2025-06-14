import { Query, QueryType, TargetType } from "./Query";

export interface Task {
  url: string;            // The target URL for the task.
  queries: Query[];       // Element queries to run on the page html to extract data.
}

export function applyTaskDefaults(task: Task): Task {
  const queries = task.queries.map((query: Query) => {
    return {
      ...query,
      target: query.target || TargetType.HTML
    };
  })

  return {
    ...task,
    queries
  };
}

/**
 * Validates a task and returns an error message if the task is invalid.
 * @param task - The task to validate.
 * @returns An error message if the task is invalid, or null if the task is valid.
 */
export function isNotValidTask(task?: Task): string | null {
  if (!task) {
    return "Task is missing";
  }

  if (!task.url) {
    return "Task URL is missing";
  }

  if (!task.queries) {
    return "Task queries are missing";
  }

  if (!Array.isArray(task.queries)) {
    return "Task queries must be an array";
  }

  if (task.queries.length === 0) {
    return "Task queries are empty";
  }

  return null;
}