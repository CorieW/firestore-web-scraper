import { LogLevel } from "../logger";

export interface Config {
  location: string;
  database: string;
  scrapeCollection: string;
  logLevel: LogLevel;
}
