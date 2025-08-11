import { QUERIES_KEY } from '../types/Task'
import { Task } from '../types/Task'
import { TemplateData } from '../types/Template'

export function validateQueriesAttribute(task: Task | TemplateData): void {
  if (!Array.isArray(task[QUERIES_KEY])) {
    throw new Error(`Task queries ('${QUERIES_KEY}') must be provided as an array`)
  }

  if (task[QUERIES_KEY].length === 0) {
    throw new Error(`Task queries ('${QUERIES_KEY}') are empty`)
  }
}
