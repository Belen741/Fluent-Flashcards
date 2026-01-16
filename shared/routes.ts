import { z } from 'zod';
import { flashcards, insertFlashcardSchema } from './schema';

export const api = {
  flashcards: {
    list: {
      method: 'GET' as const,
      path: '/api/flashcards',
      responses: {
        200: z.array(z.custom<typeof flashcards.$inferSelect>()),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
