// src/config.ts

// Read the API URL from Vite's environment variables
// Fallback to localhost:3000 for local development if VITE_API_URL is not set
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const API_URL = apiUrl;