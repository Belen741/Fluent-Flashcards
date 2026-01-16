import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get(api.flashcards.list.path, async (req, res) => {
    const cards = await storage.getFlashcards();
    res.json(cards);
  });

  // Seed data check - 9 cards with 3 concepts x 3 variants each
  const cards = await storage.getFlashcards();
  if (cards.length === 0) {
    console.log("Seeding flashcards with 9 cards (3 concepts x 3 variants)...");
    
    // Concept A: Blood Pressure (bp_01)
    await storage.createFlashcard({
      text: "Presión arterial",
      englishText: "Blood pressure",
      imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
      audioUrl: "/audio/presion_arterial.mp3",
      conceptId: "bp_01",
      variantType: "intro",
      category: "vitals"
    });
    await storage.createFlashcard({
      text: "La _____ arterial mide la fuerza de la sangre",
      englishText: "Blood _____ measures the force of blood",
      imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
      audioUrl: "/audio/presion_arterial.mp3",
      conceptId: "bp_01",
      variantType: "cloze",
      category: "vitals"
    });
    await storage.createFlashcard({
      text: "¿Qué mide un esfigmomanómetro?",
      englishText: "What does a sphygmomanometer measure?",
      imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
      audioUrl: "/audio/presion_arterial.mp3",
      conceptId: "bp_01",
      variantType: "mcq",
      category: "vitals"
    });

    // Concept B: Pain (dolor_01)
    await storage.createFlashcard({
      text: "Dolor",
      englishText: "Pain",
      imageUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80",
      audioUrl: "/audio/dolor.mp3",
      conceptId: "dolor_01",
      variantType: "intro",
      category: "symptoms"
    });
    await storage.createFlashcard({
      text: "El paciente tiene _____ en el pecho",
      englishText: "The patient has _____ in the chest",
      imageUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80",
      audioUrl: "/audio/dolor.mp3",
      conceptId: "dolor_01",
      variantType: "cloze",
      category: "symptoms"
    });
    await storage.createFlashcard({
      text: "¿Cómo se dice 'pain' en español?",
      englishText: "How do you say 'pain' in Spanish?",
      imageUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80",
      audioUrl: "/audio/dolor.mp3",
      conceptId: "dolor_01",
      variantType: "mcq",
      category: "symptoms"
    });

    // Concept C: Medicine (med_01)
    await storage.createFlashcard({
      text: "Medicina",
      englishText: "Medicine",
      imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80",
      audioUrl: "/audio/medicina.mp3",
      conceptId: "med_01",
      variantType: "intro",
      category: "treatment"
    });
    await storage.createFlashcard({
      text: "Tome la _____ con agua",
      englishText: "Take the _____ with water",
      imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80",
      audioUrl: "/audio/medicina.mp3",
      conceptId: "med_01",
      variantType: "cloze",
      category: "treatment"
    });
    await storage.createFlashcard({
      text: "¿Qué significa 'medicine' en español?",
      englishText: "What does 'medicine' mean in Spanish?",
      imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80",
      audioUrl: "/audio/medicina.mp3",
      conceptId: "med_01",
      variantType: "mcq",
      category: "treatment"
    });

    console.log("Seeding complete with 9 flashcards!");
  }

  return httpServer;
}
