// API Base URL configuration
// In development (Replit), use relative URLs
// In production (Vercel), use the Replit backend URL

const REPLIT_BACKEND_URL = import.meta.env.VITE_API_BASE_URL || '';

export function getApiUrl(path: string): string {
  // If we're on the Replit domain, use relative URLs
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.includes('replit') || hostname === 'localhost') {
      return path;
    }
  }
  
  // For Vercel (production), use the Replit backend
  if (REPLIT_BACKEND_URL) {
    return `${REPLIT_BACKEND_URL}${path}`;
  }
  
  // Fallback to relative URL
  return path;
}

export const API_BASE_URL = REPLIT_BACKEND_URL;
