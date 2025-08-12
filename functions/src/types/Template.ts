import config from '../config'
import { Query } from './Query'
import { Task } from './Task'
import { db } from '../firebase'

// These are used for dynamic logging where the key of a property is output
export const URL_KEY = 'url'
export const QUERIES_KEY = 'queries'

export interface TemplateData {
  [URL_KEY]?: string // The target URL for the task.
  [QUERIES_KEY]?: Query[] // Element queries to run on the page html to extract data.
}

export class Template implements TemplateData {
  private _initialized = false
  private _templateId: string;
  [URL_KEY]?: string;
  [QUERIES_KEY]?: Query[]

  constructor(templateId: string) {
    this._initialized = false
    this._templateId = templateId
  }

  /**
   * Initializes the template by loading the template from Firestore.
   */
  public async initialize() {
    if (this._initialized) {
      return
    }

    const templateDoc = await db.collection(config.templatesCollection).doc(this._templateId).get()
    if (!templateDoc.exists) {
      throw new Error(`Template not found: ${this._templateId}`)
    }

    const templateData = templateDoc.data() as TemplateData

    this[URL_KEY] = templateData[URL_KEY]
    this[QUERIES_KEY] = templateData[QUERIES_KEY]
    this._initialized = true
  }

  /**
   * Merges the template with the task.
   * @param task The task to merge the template with.
   * @returns The task with the template merged in.
   */
  public mergeWithTask(task: Task): Task {
    if (!this._initialized) {
      throw new Error('Template not initialized')
    }

    // replace url with template url, if provided (task url will take precedence if both are provided)
    if (this[URL_KEY] && !task[URL_KEY]) {
      task[URL_KEY] = this[URL_KEY]
    }

    // merge template queries with task queries (task queries may be undefined, so we need to check)
    if (this[QUERIES_KEY]) {
      const mergedQueries = [
        ...this[QUERIES_KEY],
        ...(Array.isArray(task[QUERIES_KEY]) ? task[QUERIES_KEY] : []),
      ]

      // deduplicate queries by id (first occurrence wins)
      const deduplicatedQueries = mergedQueries.filter(
        (query, index, self) => index === self.findIndex((t) => t.id === query.id)
      )

      task[QUERIES_KEY] = deduplicatedQueries
    }

    return task
  }
}
