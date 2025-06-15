import * as admin from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { FirestoreEvent, onDocumentCreated, QueryDocumentSnapshot } from "firebase-functions/v2/firestore";

import * as logs from "./logs";
import config from "./config";
import * as events from "./events";
import { QUERIES_KEY, Task, URL_KEY } from "./types/Task";
import { validateTask } from "./validation/task-validation";
import { sendHttpRequestTo } from "./http";
import { TaskStage } from "./types/TaskStage";
import { Queriable } from "./types/Queriable";
import { validateQueries } from "./validation/query-validation";

logs.init();

let db: admin.firestore.Firestore;
let initialized = false;

/**
 * Initializes Admin SDK, Firestore, and Eventarc
 */
async function initialize() {
  if (initialized === true) return;
  initialized = true;
  admin.initializeApp();
  db = admin.firestore();

  /** setup events */
  events.setupEventChannel();
}

export const processQueue = onDocumentCreated(config.scrapeCollection,
    async (
      snapshot: FirestoreEvent<QueryDocumentSnapshot>,
    ) => {
      await initialize();
      logs.start();

      try {
        await processWrite(snapshot.data);
      } catch (err) {
        await events.recordErrorEvent(
          snapshot.data.data(),
          `Unhandled error occurred during processing: ${err.message}"`
        );
        logs.unhandledError(err);
        return null;
      }

      /** record complete event */
      await events.recordCompleteEvent(snapshot);

      logs.complete();
    }
  );

async function processWrite(
  snapshot: QueryDocumentSnapshot
) {
  if (!snapshot.exists) {
    logs.error("Document does not exist");
    return;
  }

  const task: Task = snapshot.data() as Task;
  const doc = db.collection(config.scrapeCollection).doc(snapshot.id);

  logs.debug(`Validating task: ${snapshot.id}`);
  // Set the task to processing
  await doc.update({
    ...task,
    stage: TaskStage.VALIDATING,
    timestamp: Timestamp.now(),
  });

  try {
    // Validates the base task properties
    validateTask(task);

    // Validates each query
    validateQueries(task[QUERIES_KEY])
  } catch (err) {
    // Something went wrong, set the error and return
    await doc.update({
      ...task,
      error: err.toString().replace(/^Error: /, ''),
      timestamp: Timestamp.now(),
      stage: TaskStage.ERROR,
    });

    await events.recordErrorEvent(snapshot, err);
    logs.unhandledError(err);
  }

  const url = task[URL_KEY];
  const queries = task[QUERIES_KEY];

  logs.debug(`Fetching HTML: ${snapshot.id}`);
  await doc.update({
    ...task,
    stage: TaskStage.FETCHING,
    timestamp: Timestamp.now(),
  });

  let html = null;
  try {
    // Request the data from the URL
    html = await sendHttpRequestTo(url);

    logs.debug(`Received data from ${url}`);
  } catch (err) {
    // Something went wrong, set the error and return
    await doc.update({
      ...task,
      error: err.toString(),
      timestamp: Timestamp.now(),
      stage: TaskStage.ERROR,
    });

    await events.recordErrorEvent(snapshot, err);
    logs.unhandledError(err);
  }

  logs.debug(`Querying HTML: ${snapshot.id}`);
  await doc.update({
    ...task,
    stage: TaskStage.QUERYING,
    timestamp: Timestamp.now(),
  });

  try {
    // Run the queries on the data
    const data = new Queriable(html).query(queries)

    // Set the data in the Firestore document
    await doc.update({
      ...task,
      data: { ...data },
      timestamp: Timestamp.now(),
      stage: TaskStage.SUCCESS,
    });

    logs.debug(`Task successful: ${snapshot.id}`);
  } catch (err) {
    // Something went wrong, set the error and return
    await doc.update({
      ...task,
      error: err.toString(),
      timestamp: Timestamp.now(),
      stage: TaskStage.ERROR,
    });

    await events.recordErrorEvent(snapshot, err);
    logs.unhandledError(err);
  }
}