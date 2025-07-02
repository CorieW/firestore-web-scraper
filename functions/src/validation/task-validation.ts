import { QUERIES_KEY, Task, URL_KEY } from "../types/Task";

/**
 * Validates a task and returns an error message if the task is invalid.
 * @param task - The task to validate.
 * @returns An error message if the task is invalid, or null if the task is valid.
 */
export function validateTask(task?: Task): string | null {
  if (!task) {
    return "Task is missing";
  }

  if (typeof task[URL_KEY] !== 'string') {
    return `Task URL ('${URL_KEY}') must be provided as a string`;
  }

  try {
    new URL(task[URL_KEY]);
  } catch (error) {
    return `Task URL ('${URL_KEY}') is not a valid URL`;
  }

  if (!Array.isArray(task[QUERIES_KEY])) {
    return `Task queries ('${QUERIES_KEY}') must be provided as an array`;
  }

  if (task[QUERIES_KEY].length === 0) {
    return `Task queries ('${QUERIES_KEY}') are empty`;
  }

  return null;
}
