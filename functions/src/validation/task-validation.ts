import { QUERIES_KEY, Task, URL_KEY } from "../types/Task";
import { QUERIES_KEY, Task, URL_KEY } from "../types/Task";

/**
 * Validates a task.
 * @param task - The task to validate.
 * @throws Error - When validation fails. Includes an appropriate validation failure message.
 */
export function validateTask(task?: Task) {
  if (!task) {
    throw new Error("Task is missing");
  }

  if (typeof task[URL_KEY] !== 'string') {
    throw new Error(`Task URL ('${URL_KEY}') must be provided as a string`);
  }

  try {
    new URL(task[URL_KEY]);
    new URL(task[URL_KEY]);
  } catch (error) {
    throw new Error(`Task URL ('${URL_KEY}') is not a valid URL`);
  }

  if (!Array.isArray(task[QUERIES_KEY])) {
    throw new Error(`Task queries ('${QUERIES_KEY}') must be provided as an array`);
  }

  if (task[QUERIES_KEY].length === 0) {
    throw new Error(`Task queries ('${QUERIES_KEY}') are empty`);
  }
}
