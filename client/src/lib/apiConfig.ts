// API Base URL configuration for split architecture (Vercel frontend + Replit backend)
const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

// Debug: log API configuration on load
if (typeof window !== 'undefined') {
  console.log('[API Config] VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
  console.log('[API Config] API_BASE:', API_BASE);
  console.log('[API Config] Current hostname:', window.location.hostname);
}

export function getApiUrl(path: string): string {
  // If API_BASE is set (production on Vercel), use it
  // Otherwise use relative path (development on Replit)
  if (API_BASE) {
    return `${API_BASE}${path}`;
  }
  return path;
}

export const API_BASE_URL = API_BASE;
