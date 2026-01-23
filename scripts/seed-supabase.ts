import { createClient } from '@supabase/supabase-js';
import { flashcardsData } from '../client/src/data/flashcards';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log(`Seeding ${flashcardsData.length} flashcards to Supabase...`);

  const { data: existing } = await supabase
    .from('flashcards')
    .select('id')
    .limit(1);

  if (existing && existing.length > 0) {
    console.log('Flashcards already exist. Skipping seed.');
    console.log('To re-seed, first delete existing flashcards:');
    console.log('  DELETE FROM flashcards;');
    return;
  }

  const formattedCards = flashcardsData.map(card => ({
    text: card.text,
    english_text: card.englishText,
    image_url: card.imageUrl || '',
    audio_url: card.audioUrl || '',
    concept_id: card.conceptId,
    variant_type: card.variantType,
    category: card.category,
    deck_id: card.deckId,
    tags: card.tags,
    image_key: card.imageKey,
    audio_key: card.audioKey,
    cloze_options: (card as any).clozeOptions,
    cloze_correct: (card as any).clozeCorrect,
    mcq_question_es: (card as any).mcqQuestionEs,
    mcq_options_en: (card as any).mcqOptionsEn,
    mcq_correct_en: (card as any).mcqCorrectEn,
  }));

  const batchSize = 50;
  for (let i = 0; i < formattedCards.length; i += batchSize) {
    const batch = formattedCards.slice(i, i + batchSize);
    const { error } = await supabase.from('flashcards').insert(batch);
    
    if (error) {
      console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
    } else {
      console.log(`Inserted batch ${i / batchSize + 1} (${batch.length} cards)`);
    }
  }

  console.log('Seeding complete!');
}

seed().catch(console.error);
