import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const flashcards = pgTable("flashcards", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(), // Spanish text
  englishText: text("english_text").notNull(), // English translation (helper)
  imageUrl: text("image_url").notNull(),
  category: text("category").notNull(),
});

export const insertFlashcardSchema = createInsertSchema(flashcards).omit({ id: true });

export type Flashcard = typeof flashcards.$inferSelect;
export type InsertFlashcard = z.infer<typeof insertFlashcardSchema>;
