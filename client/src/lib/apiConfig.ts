// API Base URL configuration
// In development (Replit), use relative URLs
// In production (Vercel), use the Replit backend URL

const REPLIT_BACKEND_URL = import.meta.env.VITE_API_BASE_URL || '';

// Debug: log the API URL configuration at startup
if (typeof window !== 'undefined') {
  console.log('[API Config] VITE_API_BASE_URL:', REPLIT_BACKEND_URL || '(not set)');
  console.log('[API Config] Current hostname:', window.location.hostname);
}

export function getApiUrl(path: string): string {
  // If VITE_API_BASE_URL is set, always use it (production/Vercel)
  if (REPLIT_BACKEND_URL) {
    return `${REPLIT_BACKEND_URL}${path}`;
  }
  
  // Fallback to relative URL (development/Replit)
  return path;
}

export const API_BASE_URL = REPLIT_BACKEND_URL;
