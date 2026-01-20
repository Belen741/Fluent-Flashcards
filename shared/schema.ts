import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Re-export auth models for Replit Auth integration
export * from "./models/auth";

export const flashcards = pgTable("flashcards", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  englishText: text("english_text").notNull(),
  imageUrl: text("image_url").notNull(),
  audioUrl: text("audio_url").notNull(),
  conceptId: text("concept_id").notNull(),
  variantType: text("variant_type").notNull(), // "intro" | "cloze" | "mcq"
  category: text("category").notNull(),
  deckId: text("deck_id"),
  tags: text("tags").array(),
  imageKey: text("image_key"),
  audioKey: text("audio_key"),
  clozeOptions: text("cloze_options").array(),
  clozeCorrect: text("cloze_correct"),
  mcqQuestionEs: text("mcq_question_es"),
  mcqOptionsEn: text("mcq_options_en").array(),
  mcqCorrectEn: text("mcq_correct_en"),
});

export const insertFlashcardSchema = createInsertSchema(flashcards).omit({ id: true });

export type Flashcard = typeof flashcards.$inferSelect;
export type InsertFlashcard = z.infer<typeof insertFlashcardSchema>;

// Learning state types (stored in localStorage, not DB)
export type LearningStrength = "new" | "weak" | "strong";

export interface ConceptLearningState {
  conceptId: string;
  seenCountToday: number;
  correctStreak: number;
  lastSeenIndex?: number;
  strength: LearningStrength;
}

export interface SessionHistory {
  date: string;
  conceptsSeen: string[];
}

export type VariantType = "intro" | "cloze" | "mcq";
