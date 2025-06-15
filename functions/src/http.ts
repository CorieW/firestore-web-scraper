async function fetchHtml(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Network error: ${response.status} ${response.statusText}`);
    }
    const html = await response.text();
    return html;
  } catch (error) {
    console.error("Error fetching HTML:", error);
    throw error;
  }
}

export async function sendHttpRequestTo(url: string): Promise<string> {
  // Send the HTTP request
  return await fetchHtml(url);
}