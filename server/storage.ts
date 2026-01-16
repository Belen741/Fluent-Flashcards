import { db } from "./db";
import { flashcards, type Flashcard, type InsertFlashcard } from "@shared/schema";

export interface IStorage {
  getFlashcards(): Promise<Flashcard[]>;
  createFlashcard(card: InsertFlashcard): Promise<Flashcard>;
}

export class DatabaseStorage implements IStorage {
  async getFlashcards(): Promise<Flashcard[]> {
    return await db.select().from(flashcards);
  }

  async createFlashcard(insertFlashcard: InsertFlashcard): Promise<Flashcard> {
    const [card] = await db
      .insert(flashcards)
      .values(insertFlashcard)
      .returning();
    return card;
  }
}

export const storage = new DatabaseStorage();
