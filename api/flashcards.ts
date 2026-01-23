import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from('flashcards')
      .select('*');

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to fetch flashcards' });
    }

    const formattedData = data?.map(card => ({
      id: card.id,
      text: card.text,
      englishText: card.english_text,
      imageUrl: card.image_url,
      audioUrl: card.audio_url,
      conceptId: card.concept_id,
      variantType: card.variant_type,
      category: card.category,
      deckId: card.deck_id,
      tags: card.tags,
      imageKey: card.image_key,
      audioKey: card.audio_key,
      clozeOptions: card.cloze_options,
      clozeCorrect: card.cloze_correct,
      mcqQuestionEs: card.mcq_question_es,
      mcqOptionsEn: card.mcq_options_en,
      mcqCorrectEn: card.mcq_correct_en,
    })) || [];

    return res.status(200).json(formattedData);
  } catch (error) {
    console.error('Error fetching flashcards:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
