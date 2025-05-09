import { API_URL } from '../config';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface ApiOptions {
  method?: RequestMethod;
  body?: any;
  requiresAuth?: boolean;
  additionalHeaders?: Record<string, string>;
}

export async function apiRequest(
  endpoint: string,
  gameId: string | null,
  options: ApiOptions = {}
) {
  const {
    method = 'GET',
    body,
    requiresAuth = true,
    additionalHeaders = {}
  } = options;

  // Build headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    // Request CORS support
    'Origin': window.location.origin,
    ...additionalHeaders
  };

  // Add auth token if required and available
  if (requiresAuth && gameId) {
    const gameMasterToken = localStorage.getItem(`gameMasterToken_${gameId}`);
    if (gameMasterToken) {
      headers['x-game-master-token'] = gameMasterToken;
    } else {
      throw new Error('Game master token required but not available');
    }
  }

  // Build request options
  const requestOptions: RequestInit = {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  };

  // Make request
  const response = await fetch(`${API_URL}/${endpoint}`, requestOptions);
  
  // Handle non-OK responses
  if (!response.ok) {
    let errorMessage = `Error ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || JSON.stringify(errorData);
    } catch (e) {
      // If we can't parse JSON, use the default error message
    }
    throw new Error(errorMessage);
  }

  // Return parsed response or null for 204 No Content
  return response.status === 204 ? null : await response.json();
}