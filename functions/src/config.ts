import { LogLevel } from './logger';
import { Config } from './types/Config';

const config: Config = {
  location: process.env.LOCATION,
  database: process.env.DATABASE,
  scrapeCollection: process.env.SCRAPE_COLLECTION,
  logLevel: process.env.LOG_LEVEL as LogLevel,
};

export default config;
