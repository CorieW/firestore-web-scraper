import * as admin from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { FirestoreEvent, onDocumentCreated, QueryDocumentSnapshot } from "firebase-functions/v2/firestore";

import * as logs from "./logs";
import config from "./config";
import * as events from "./events";
import { Task } from "./types/Task";
import { validateTask } from "./validation/task-validation";
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
      await handleUnhandledError(snapshot, err);
      return null;
    }

    await handleCompleteEvent(snapshot);

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

  const startedAtTimestamp = Timestamp.now();
  const task: Task = snapshot.data() as Task;
  const doc = db.collection(config.scrapeCollection).doc(snapshot.id);

  // Record pending event for the newly created task
  const change = { after: { id: snapshot.id, ...task } };
  await events.recordPendingEvent(change, snapshot.data());

  // The task is invalid, set the error and return
  const isNotValid = validateTask(task); // is a message (invalid) or null (valid)
  if (isNotValid) {
    await handleInvalidTask(doc, task, isNotValid, startedAtTimestamp);
    return;
  }

  // Record start event before beginning processing
  await events.recordStartEvent(change);

  await setTaskProcessing(doc, task, startedAtTimestamp, snapshot.id);

  try {
    await handleTaskProcessing(doc, task, startedAtTimestamp, snapshot.id);
  } catch (err) {
    await handleTaskError(doc, task, startedAtTimestamp, snapshot, err);
  }
}

async function handleInvalidTask(
  doc: admin.firestore.DocumentReference,
  task: Task,
  errorMsg: string,
  startedAtTimestamp: FirebaseFirestore.Timestamp
) {
  const errorDoc = {
    ...task,
    error: errorMsg,
    startedAt: startedAtTimestamp,
    concludedAt: Timestamp.now(),
    stage: TaskStage.ERROR
  };

  await doc.update(errorDoc);

  // Record error event for invalid task
  await events.recordErrorEvent({
    after: {
      id: doc.id,
      ...errorDoc,
    }
  }, new Error(errorMsg));

  logs.error(errorMsg);
}

async function setTaskProcessing(
  doc: admin.firestore.DocumentReference,
  task: Task,
  startedAtTimestamp: FirebaseFirestore.Timestamp,
  taskId: string
) {
  const processingDoc = {
    ...task,
    startedAt: startedAtTimestamp,
    stage: TaskStage.PROCESSING,
  };

  await doc.update(processingDoc);

  // Record processing event when stage is set to processing
  await events.recordProcessingEvent({
    after: {
      id: taskId,
      ...processingDoc,
    }
  });

  logs.debug(`Processing task: ${taskId}`);
}

async function handleTaskProcessing(
  doc: admin.firestore.DocumentReference,
  task: Task,
  startedAtTimestamp: FirebaseFirestore.Timestamp,
  taskId: string
) {
  const { url, queries } = task;
  // Request the data from the URL
  const queriable = await sendHttpRequestTo(url);

  logs.debug(`Received data from ${url}: ${queriable.html}`);
  // Run the queries on the data
  const data = queriable.multiQuery(queries);

  const successDoc = {
    ...task,
    data: { ...data },
    startedAt: startedAtTimestamp,
    concludedAt: Timestamp.now(),
    stage: TaskStage.SUCCESS,
  };

  // Set the data in the Firestore document
  await doc.update(successDoc);

  // Record success event when task completes successfully
  await events.recordSuccessEvent({
    after: {
      id: taskId,
      ...successDoc,
    }
  });

  logs.debug(`Task successful: ${taskId}`);
}

async function handleTaskError(
  doc: admin.firestore.DocumentReference,
  task: Task,
  startedAtTimestamp: FirebaseFirestore.Timestamp,
  snapshot: QueryDocumentSnapshot,
  err: any
) {
  await doc.update({
    ...task,
    error: err.toString().replace(/^Error: /, ''),
    startedAt: startedAtTimestamp,
    concludedAt: Timestamp.now(),
    stage: TaskStage.ERROR,
  });

  await events.recordErrorEvent(snapshot, err);
  logs.unhandledError(err);
}

async function handleUnhandledError(
  snapshot: FirestoreEvent<QueryDocumentSnapshot>,
  err: any
) {
  await events.recordErrorEvent(
    snapshot.data.data(),
    `Unhandled error occurred during processing: ${err.message}"`
  );
  logs.unhandledError(err);
}

async function handleCompleteEvent(
  snapshot: FirestoreEvent<QueryDocumentSnapshot>
) {
  await events.recordCompleteEvent(snapshot);
}