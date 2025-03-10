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

export function validateTask(task?: Task): boolean {
  if (!task) {
    return false;
  }

  if (!task.url) {
    return false;
  }

  if (!task.queries || !task.queries.length) {
    return false;
  }

  return true;
}

export function getTaskValidationErrorMessage(task?: Task): string {
  if (!task) {
    return "Task is missing";
  }

  if (!task.url) {
    return "Task URL is missing";
  }

  if (!task.queries || !task.queries.length) {
    return "Task queries are missing";
  }

  return "";
}