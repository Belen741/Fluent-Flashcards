import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get(api.flashcards.list.path, async (req, res) => {
    const cards = await storage.getFlashcards();
    res.json(cards);
  });

  // Seed data check
  const cards = await storage.getFlashcards();
  if (cards.length === 0) {
    console.log("Seeding flashcards...");
    await storage.createFlashcard({
      text: "Enfermera",
      englishText: "Nurse",
      imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
      category: "people"
    });
    await storage.createFlashcard({
      text: "Dolor",
      englishText: "Pain",
      imageUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80",
      category: "symptoms"
    });
    await storage.createFlashcard({
      text: "Médico",
      englishText: "Doctor",
      imageUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=800&q=80",
      category: "people"
    });
    await storage.createFlashcard({
      text: "Hospital",
      englishText: "Hospital",
      imageUrl: "https://images.unsplash.com/photo-1587351021759-3e566b9af923?w=800&q=80",
      category: "places"
    });
    await storage.createFlashcard({
      text: "Medicina",
      englishText: "Medicine",
      imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80",
      category: "objects"
    });
    console.log("Seeding complete!");
  }

  return httpServer;
}
