import type { Flashcard } from "@shared/schema";

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop";

// FUTURO: Configuración de Cloudflare R2
// const CLOUDFLARE_BASE_URL = "https://cdn.tudominio.com/";
// const USE_CDN = import.meta.env.VITE_USE_CDN === "true";

export function getImageUrl(card: Flashcard): string {
  // FUTURO: Cuando se active CDN
  // if (USE_CDN && card.imageKey) {
  //   return `${CLOUDFLARE_BASE_URL}${card.imageKey}`;
  // }

  if (card.imageUrl) {
    return card.imageUrl;
  }

  return PLACEHOLDER_IMAGE;
}

export function getAudioUrl(card: Flashcard): string | null {
  // FUTURO: Cuando se active CDN
  // if (USE_CDN && card.audioKey) {
  //   return `${CLOUDFLARE_BASE_URL}${card.audioKey}`;
  // }

  if (card.audioUrl) {
    return card.audioUrl;
  }

  return null;
}
