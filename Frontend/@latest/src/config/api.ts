/**
 * Get the backend API base URL from environment variables
 */
export const getBackendURL = (): string => {
  return import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
};

export const BACKEND_URL = getBackendURL();
