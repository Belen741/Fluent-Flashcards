// API Base URL configuration
// Replit backend URL - used when not on Replit domain
const REPLIT_BACKEND = 'https://efd0c2b9-faba-4dcd-a542-cac018800a89-00-2y0ya6b2sa1ra.janeway.replit.dev';

export function getApiUrl(path: string): string {
  // Check hostname at call time (not module load time)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Only use relative URLs on Replit domain
    if (hostname.includes('replit.dev') || hostname.includes('replit.app') || hostname === 'localhost') {
      return path;
    }
  }
  // For all other domains (Vercel, spanish4nurses, etc), use Replit backend
  return `${REPLIT_BACKEND}${path}`;
}

export const API_BASE_URL = REPLIT_BACKEND;
