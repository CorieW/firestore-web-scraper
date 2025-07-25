import { logger } from './logger';
import { Queriable } from './types/Queriable';

async function fetchHtml(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Network error: ${response.status} ${response.statusText}`);
    }
    const html = await response.text();
    return html;
  } catch (error) {
    logger.error('Error fetching HTML:', error);
    throw error;
  }
}

export async function sendHttpRequestTo(url: string): Promise<Queriable> {
  // Send the HTTP request
  const response = await fetchHtml(url);

  // Return the Queriable object
  return new Queriable(response);
}
