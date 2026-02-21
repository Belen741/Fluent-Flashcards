// API Base URL configuration
// When hosted on Replit (spanish4nurses.com), use relative URLs (same origin)
// Only use VITE_API_BASE_URL for external hosting (e.g., Vercel)
function resolveApiBase(): string {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.includes('spanish4nurses.com') || hostname.includes('replit')) {
      return '';
    }
  }
  return import.meta.env.VITE_API_BASE_URL || '';
}

const API_BASE = resolveApiBase();

export function getApiUrl(path: string): string {
  if (API_BASE) {
    return `${API_BASE}${path}`;
  }
  return path;
}

export const API_BASE_URL = API_BASE;
