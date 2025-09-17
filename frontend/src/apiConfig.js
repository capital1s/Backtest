// apiConfig.js
// Centralized API base URL for backend requests

// Usage: create .env file in frontend/ with REACT_APP_API_BASE_URL=http://localhost:8001 or your desired URL
export const API_BASE_URL =
  (typeof globalThis.process !== 'undefined' && (globalThis.process.env.NODE_ENV === 'test' || globalThis.process.env.VITEST))
    ? ''
    : (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000");
