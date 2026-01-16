import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { flashcardsData } from "../client/src/data/flashcards";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get(api.flashcards.list.path, async (req, res) => {
    const cards = await storage.getFlashcards();
    res.json(cards);
  });

  const cards = await storage.getFlashcards();
  if (cards.length === 0) {
    console.log(`Seeding flashcards with ${flashcardsData.length} cards from imported data...`);
    
    for (const card of flashcardsData) {
      await storage.createFlashcard({
        text: card.text,
        englishText: card.englishText,
        imageUrl: card.imageUrl || "",
        audioUrl: card.audioUrl || "",
        conceptId: card.conceptId,
        variantType: card.variantType,
        category: card.category,
        deckId: card.deckId,
        tags: [...card.tags],
        imageKey: card.imageKey,
        audioKey: card.audioKey,
      });
    }

    console.log(`Seeding complete with ${flashcardsData.length} flashcards!`);
  }

  return httpServer;
}
