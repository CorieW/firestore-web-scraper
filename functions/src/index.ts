import * as admin from 'firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'
import {
  FirestoreEvent,
  onDocumentCreated,
  QueryDocumentSnapshot,
} from 'firebase-functions/v2/firestore'

import { logger } from './logger'
import config from './config'
import * as events from './events'
import { QUERIES_KEY, Task, TEMPLATE_KEY, URL_KEY } from './types/Task'
import { validateTask } from './validation/task-validation'
import { sendHttpRequestTo } from './http'
import { TaskStage } from './types/TaskStage'
import { Template } from './types/Template'

let db: admin.firestore.Firestore
let initialized = false

/**
 * Initializes Admin SDK, Firestore, and Eventarc
 */
async function initialize() {
  if (initialized === true) return
  initialized = true
  admin.initializeApp()
  db = admin.firestore()

  /** setup events */
  events.setupEventChannel()
}

export const processQueue = onDocumentCreated(
  config.scrapeCollection,
  async (snapshot: FirestoreEvent<QueryDocumentSnapshot>) => {
    await initialize()
    logger.debug('Processing queue')

    try {
      await processWrite(snapshot.data)
    } catch (err) {
      await events.recordErrorEvent(
        snapshot.data.data(),
        `Unhandled error occurred during processing: ${err.message}"`
      )
      logger.error(err)
      return null
    }

    /** record complete event */
    await events.recordCompleteEvent(snapshot)

    logger.debug('Queue processed')
  }
)

async function processWrite(snapshot: QueryDocumentSnapshot) {
  if (!snapshot.exists) {
    logger.error('Process called with non-existent document')
    return
  }

  logger.info(`Starting task: ${snapshot.id}`)

  const startedAtTimestamp = Timestamp.now()
  const task: Task = snapshot.data() as Task
  const doc = db.collection(config.scrapeCollection).doc(snapshot.id)

  logger.info(`Validating task: ${snapshot.id}`)

  // The task is invalid, set the error and return
  try {
    validateTask(task)
  } catch (err) {
    await doc.update({
      ...task,
      error: err.toString().replace(/^Error: /, ''),
      startedAt: startedAtTimestamp,
      concludedAt: Timestamp.now(),
      stage: TaskStage.ERROR,
    })

    return
  }

  const template = task[TEMPLATE_KEY]

  // When a template is provided, load in values
  if (template) {
    // load template from firestore
    const templateDoc = await db.collection(config.templatesCollection).doc(template).get()
    if (!templateDoc.exists) {
      throw new Error(`Template not found: ${template}`)
    }
    const templateData = templateDoc.data() as Template

    // replace url with template url, if provided
    if (templateData[URL_KEY]) {
      task[URL_KEY] = templateData[URL_KEY]
    }

    // merge template queries with task queries (task queries may be undefined, so we need to check)
    if (templateData[QUERIES_KEY]) {
      task[QUERIES_KEY] = [
        ...templateData[QUERIES_KEY],
        ...(Array.isArray(task[QUERIES_KEY]) ? task[QUERIES_KEY] : []),
      ]
    }
  }

  const url = task[URL_KEY]
  const queries = task[QUERIES_KEY]

  // Set the task to processing
  logger.info(`Processing task: ${snapshot.id}`)
  await doc.update({
    ...task,
    startedAt: startedAtTimestamp,
    stage: TaskStage.PROCESSING,
  })

  try {
    // Request the data from the URL
    const queriable = await sendHttpRequestTo(url)

    logger.debug(`Received data from ${url}: ${queriable.html}`)
    // Run the queries on the data
    const data = queriable.multiQuery(queries)

    // Set the data in the Firestore document
    await doc.update({
      ...task,
      data: { ...data },
      startedAt: startedAtTimestamp,
      concludedAt: Timestamp.now(),
      stage: TaskStage.SUCCESS,
    })
  } catch (err) {
    // Something went wrong, set the error and return
    await doc.update({
      ...task,
      error: err.toString().replace(/^Error: /, ''),
      startedAt: startedAtTimestamp,
      concludedAt: Timestamp.now(),
      stage: TaskStage.ERROR,
    })

    await events.recordErrorEvent(snapshot, err)
    logger.error(err)
  }

  logger.info(`Task successful: ${snapshot.id}`)
}
