import * as admin from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import * as functions from "firebase-functions";

import * as logs from "./logs";
import config from "./config";
import * as events from "./events";
import { applyTaskDefaults, getTaskValidationErrorMessage, Task, validateTask } from "./types/Task";
import { sendHttpRequestTo } from "./http";
import { TaskStage } from "./types/TaskStage";

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

export const processQueue = functions.firestore
  .document(config.scrapeCollection)
  .onCreate(
    async (
      snapshot: admin.firestore.QueryDocumentSnapshot<Task>,
    ) => {
      await initialize();
      logs.start();

      try {
        await processWrite(snapshot);
      } catch (err) {
        await events.recordErrorEvent(
          snapshot.data(),
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
  snapshot: admin.firestore.QueryDocumentSnapshot<Task>,
) {
  const task = snapshot.data();
  const { url, queries } = applyTaskDefaults(task);

  // Get the same document reference
  const doc = db.collection(config.scrapeCollection).doc(snapshot.id);

  // The task is invalid, set the error and return
  if (!validateTask(task)) {
    await doc.update({
      ...task,
      error: getTaskValidationErrorMessage(task),
      timestamp: Timestamp.now(),
      stage: TaskStage.ERROR
    });
    logs.error(getTaskValidationErrorMessage(task));

    return;
  }

  // Set the task to processing
  await doc.update({
    ...task,
    stage: TaskStage.PROCESSING,
    timestamp: Timestamp.now(),
  });
  logs.info(`Processing task: ${snapshot.id}`);

  try {
    // Request the data from the URL
    const queriable = await sendHttpRequestTo(url);

    logs.info(`Received data from ${url}: ${queriable.html}`);
    // Run the queries on the data
    const data = queriable.multiQuery(queries);

    // Set the data in the Firestore document
    await doc.update({
      ...task,
      data: { ...data },
      timestamp: Timestamp.now(),
      stage: TaskStage.SUCCESS,
    });

    logs.info(`Task successful: ${snapshot.id}`);
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