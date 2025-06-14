import * as admin from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { FirestoreEvent, onDocumentCreated, QueryDocumentSnapshot } from "firebase-functions/v2/firestore";

import * as logs from "./logs";
import config from "./config";
import * as events from "./events";
import { applyTaskDefaults, Task, isNotValidTask } from "./types/Task";
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

  // The task is invalid, set the error and return
  const isNotValid = isNotValidTask(task); // is a message (invalid) or null (valid)
  if (isNotValid) {
    await doc.update({
      ...task,
      error: isNotValid,
      timestamp: Timestamp.now(),
      stage: TaskStage.ERROR
    });
    logs.error(isNotValid);

    return;
  }

  const { url, queries } = applyTaskDefaults(task);

  // Set the task to processing
  await doc.update({
    ...task,
    stage: TaskStage.PROCESSING,
    timestamp: Timestamp.now(),
  });
  logs.debug(`Processing task: ${snapshot.id}`);

  try {
    // Request the data from the URL
    const queriable = await sendHttpRequestTo(url);

    logs.debug(`Received data from ${url}: ${queriable.html}`);
    // Run the queries on the data
    const data = queriable.multiQuery(queries);

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
      error: err.toString().replace(/^Error: /, ''),
      timestamp: Timestamp.now(),
      stage: TaskStage.ERROR,
    });

    await events.recordErrorEvent(snapshot, err);
    logs.unhandledError(err);
  }
}