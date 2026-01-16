import XLSX from "xlsx";
import * as fs from "fs";
import * as path from "path";

interface ExcelRow {
  deck: string;
  card_id: string;
  es: string;
  en: string;
  audio_file: string;
  image_file: string;
  cloze_option_1?: string;
  cloze_option_2?: string;
  cloze_option_3?: string;
  cloze_option_4?: string;
  cloze_correct?: string;
  mcq_question_es?: string;
  mcq_option_en_1?: string;
  mcq_option_en_2?: string;
  mcq_option_en_3?: string;
  mcq_correct_en?: string;
  tag_1?: string;
  tag_2?: string;
}

interface FlashcardVariant {
  id: string;
  conceptId: string;
  variantType: "intro" | "cloze" | "mcq";
  text: string;
  englishText: string;
  deckId: string;
  tags: string[];
  imageKey: string | null;
  audioKey: string | null;
  category: string;
  imageUrl: string;
  audioUrl: string;
  clozeOptions?: string[];
  clozeCorrect?: string;
  mcqQuestionEs?: string;
  mcqOptionsEn?: string[];
  mcqCorrectEn?: string;
}

function importFlashcards(xlsxPath: string, deckId: string): FlashcardVariant[] {
  const workbook = XLSX.readFile(xlsxPath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows: ExcelRow[] = XLSX.utils.sheet_to_json(sheet);

  const flashcards: FlashcardVariant[] = [];

  for (const row of rows) {
    if (!row.card_id || !row.es || !row.en) continue;

    const tags = [row.tag_1, row.tag_2].filter((t): t is string => !!t && t.trim() !== "");
    const category = tags[0] || "General";

    const baseCard = {
      conceptId: row.card_id,
      deckId,
      tags,
      imageKey: row.image_file ? `${deckId}/images/${row.image_file}` : null,
      audioKey: row.audio_file ? `${deckId}/audio/${row.audio_file}` : null,
      category,
      imageUrl: "",
      audioUrl: "",
    };

    flashcards.push({
      ...baseCard,
      id: `${row.card_id}_intro`,
      variantType: "intro",
      text: row.es,
      englishText: row.en,
    });

    const hasCloze = row.cloze_correct && 
      (row.cloze_option_1 || row.cloze_option_2 || row.cloze_option_3 || row.cloze_option_4);
    
    if (hasCloze) {
      const clozeOptions = [
        row.cloze_option_1,
        row.cloze_option_2,
        row.cloze_option_3,
        row.cloze_option_4,
      ].filter((o): o is string => !!o && o.trim() !== "");

      flashcards.push({
        ...baseCard,
        id: `${row.card_id}_cloze`,
        variantType: "cloze",
        text: row.cloze_correct || row.es,
        englishText: row.en,
        clozeOptions,
        clozeCorrect: row.cloze_correct,
      });
    }

    const hasMcq = row.mcq_question_es && 
      (row.mcq_option_en_1 || row.mcq_option_en_2 || row.mcq_option_en_3);

    if (hasMcq) {
      const mcqOptionsEn = [
        row.mcq_option_en_1,
        row.mcq_option_en_2,
        row.mcq_option_en_3,
      ].filter((o): o is string => !!o && o.trim() !== "");

      flashcards.push({
        ...baseCard,
        id: `${row.card_id}_mcq`,
        variantType: "mcq",
        text: row.mcq_question_es || row.es,
        englishText: row.en,
        mcqQuestionEs: row.mcq_question_es,
        mcqOptionsEn,
        mcqCorrectEn: row.mcq_correct_en,
      });
    }
  }

  return flashcards;
}

function generateFlashcardsFile(flashcards: FlashcardVariant[], outputPath: string) {
  const content = `export const flashcardsData = ${JSON.stringify(flashcards, null, 2)} as const;

export type FlashcardData = typeof flashcardsData[number];
`;

  fs.writeFileSync(outputPath, content, "utf-8");
  console.log(`Generated ${flashcards.length} flashcard variants at ${outputPath}`);
}

const rawDir = path.join(process.cwd(), "client/src/data/raw");
const outputPath = path.join(process.cwd(), "client/src/data/flashcards.ts");

const xlsxFiles = fs.readdirSync(rawDir).filter((f) => f.endsWith(".xlsx"));

if (xlsxFiles.length === 0) {
  console.log("No .xlsx files found in client/src/data/raw/");
  console.log("Place your Excel files there and run this script again.");
  process.exit(1);
}

let allFlashcards: FlashcardVariant[] = [];

for (const file of xlsxFiles) {
  const deckId = file.replace(".xlsx", "");
  const filePath = path.join(rawDir, file);
  console.log(`Processing: ${file} -> deckId: ${deckId}`);
  
  const cards = importFlashcards(filePath, deckId);
  allFlashcards = allFlashcards.concat(cards);
  
  console.log(`  - ${cards.length} variants generated`);
}

generateFlashcardsFile(allFlashcards, outputPath);
console.log(`\nTotal: ${allFlashcards.length} flashcard variants from ${xlsxFiles.length} deck(s)`);
