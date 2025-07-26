import { QUERIES_KEY, Task, TEMPLATE_KEY, URL_KEY } from '../types/Task'
import { validateQueriesAttribute } from './common'

/**
 * Validates a task and returns an error message if the task is invalid.
 * @param task - The task to validate.
 * @returns An error message if the task is invalid, or null if the task is valid.
 */
export function validateTask(task?: Task): void {
  if (!task) {
    throw new Error('Task is missing')
  }

  if (typeof task[URL_KEY] !== 'string') {
    throw new Error(`Task URL ('${URL_KEY}') must be provided as a string`)
  }

  try {
    new URL(task[URL_KEY])
  } catch (error) {
    throw new Error(`Task URL ('${URL_KEY}') is not a valid URL`)
  }

  if (!task[QUERIES_KEY] && !task[TEMPLATE_KEY]) {
    throw new Error(
      `Task must have either template ('${TEMPLATE_KEY}') or queries ('${QUERIES_KEY}')`
    )
  }

  if (task[QUERIES_KEY]) {
    validateQueriesAttribute(task)
  }

  if (task[TEMPLATE_KEY]) {
    validateTemplateAttribute(task)
  }
}

function validateTemplateAttribute(task: Task): void {
  if (typeof task[TEMPLATE_KEY] !== 'string') {
    throw new Error(`Task template ('${TEMPLATE_KEY}') must be provided as a string`)
  }

  if (task[TEMPLATE_KEY].length === 0) {
    throw new Error(`Task template ('${TEMPLATE_KEY}') is empty`)
  }
}
