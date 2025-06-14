import { Task } from "../types/Task";

/**
 * Validates a task and returns an error message if the task is invalid.
 * @param task - The task to validate.
 * @returns An error message if the task is invalid, or null if the task is valid.
 */
export function validateTask(task?: Task): string | null {
  if (!task) {
    return "Task is missing";
  }

  if (!task.url) {
    return "Task URL ('url') is missing";
  }

  if (typeof task.url !== 'string') {
    return "Task URL ('url') must be a string";
  }

  try {
    new URL(task.url);
  } catch (error) {
    return "Task URL ('url') is not a valid URL";
  }

  if (!task.queries) {
    return "Task queries ('queries') are missing";
  }

  if (!Array.isArray(task.queries)) {
    return "Task queries ('queries') must be an array";
  }

  if (task.queries.length === 0) {
    return "Task queries ('queries') are empty";
  }

  return null;
}
