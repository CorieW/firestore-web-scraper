import { logger } from "firebase-functions";

export function init() {
  logger.log("Initializing extension");
}

export function start() {
  logger.log(
    "Started execution of extension",
  );
}

export function error(err: string | Error) {
  logger.error("Error occurred during processing:", err);
}

export function unhandledError(err: Error) {
  logger.log("Unhandled error occurred during processing:", err);
}

export function complete() {
  logger.log("Completed execution of extension");
}

export function debug(message: string) {
  logger.debug(message);
}
