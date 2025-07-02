import { Query } from './Query';

export interface Task {
  url: string; // The target URL for the task.
  queries: Query[]; // Element queries to run on the page html to extract data.
}
