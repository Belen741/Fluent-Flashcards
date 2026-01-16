import type { Flashcard } from "@shared/schema";

const CLOUDFLARE_BASE_URL = "https://pub-1fbc99701cda4b24becbb4123415045d.r2.dev/";
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop";

export function getImageUrl(card: Flashcard): string {
  if (card.imageKey) {
    return `${CLOUDFLARE_BASE_URL}${card.imageKey}`;
  }

  if (card.imageUrl) {
    return card.imageUrl;
  }

  return PLACEHOLDER_IMAGE;
}

export function getAudioUrl(card: Flashcard): string | null {
  if (card.audioKey) {
    return `${CLOUDFLARE_BASE_URL}${card.audioKey}`;
  }

  if (card.audioUrl) {
    return card.audioUrl;
  }

  return null;
}
