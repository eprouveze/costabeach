/**
 * Safely parse JSON from a response, handling cases where the response 
 * might not be valid JSON (e.g., HTML error pages)
 */
export async function safeJsonParse<T = any>(response: Response): Promise<T | null> {
  try {
    return await response.json();
  } catch (error) {
    console.error('Failed to parse JSON response:', error);
    console.error('Response status:', response.status, response.statusText);
    return null;
  }
}

/**
 * Handle API errors safely, attempting to extract error message from JSON
 * but falling back to generic error if JSON parsing fails
 */
export async function handleApiError(response: Response, fallbackMessage: string): Promise<string> {
  try {
    const errorData = await response.json();
    return errorData.message || errorData.error || fallbackMessage;
  } catch (parseError) {
    console.error('Error parsing error response:', parseError);
    return fallbackMessage;
  }
}