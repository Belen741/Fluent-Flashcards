// API Base URL configuration
// In development (Replit), use relative URLs
// In production (Vercel/spanish4nurses.com), use the Replit backend URL

// Hardcoded Replit backend URL for production
const REPLIT_BACKEND = 'https://efd0c2b9-faba-4dcd-a542-cac018800a89-00-2y0ya6b2sa1ra.janeway.replit.dev';

function getBackendUrl(): string {
  if (typeof window === 'undefined') return '';
  
  const hostname = window.location.hostname;
  
  // If we're on Vercel/production domain, use Replit backend
  if (hostname.includes('spanish4nurses') || hostname.includes('vercel.app')) {
    return REPLIT_BACKEND;
  }
  
  // If we're on Replit or localhost, use relative URLs
  return '';
}

const API_BASE = getBackendUrl();

export function getApiUrl(path: string): string {
  if (API_BASE) {
    return `${API_BASE}${path}`;
  }
  return path;
}

export const API_BASE_URL = API_BASE;
