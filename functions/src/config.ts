import { Config } from './types/Config';

const config: Config = {
  location: process.env.LOCATION,
  database: process.env.DATABASE,
  scrapeCollection: process.env.SCRAPE_COLLECTION,
};

export default config;
