import type { Flashcard, ConceptLearningState, SessionHistory } from "@shared/schema";

const LEARNING_STATE_KEY = "flashcard_learning_state";
const SESSION_HISTORY_KEY = "flashcard_session_history";
const SESSION_COUNT_KEY = "flashcard_session_count";
const SESSION_DATE_KEY = "flashcard_session_date";

const NEW_CONCEPTS_PER_SESSION = 5;
const MAX_INTERACTIONS_PER_SESSION = 18;
const TARGET_INTERACTIONS = 15;

type CardFormat = "intro" | "cloze" | "mcq";

interface ConceptTracker {
  appearanceCount: number;
  lastFormat: CardFormat | null;
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

export function getSessionsCompletedToday(): number {
  try {
    const storedDate = localStorage.getItem(SESSION_DATE_KEY);
    const today = getTodayString();
    
    if (storedDate !== today) {
      localStorage.setItem(SESSION_DATE_KEY, today);
      localStorage.setItem(SESSION_COUNT_KEY, "0");
      return 0;
    }
    
    const count = localStorage.getItem(SESSION_COUNT_KEY);
    return count ? parseInt(count, 10) : 0;
  } catch {
    return 0;
  }
}

export function incrementSessionCount(): number {
  try {
    const today = getTodayString();
    localStorage.setItem(SESSION_DATE_KEY, today);
    
    const current = getSessionsCompletedToday();
    const newCount = current + 1;
    localStorage.setItem(SESSION_COUNT_KEY, String(newCount));
    return newCount;
  } catch {
    return 1;
  }
}

export function getLearningState(): Record<string, ConceptLearningState> {
  try {
    const stored = localStorage.getItem(LEARNING_STATE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

export function saveLearningState(state: Record<string, ConceptLearningState>): void {
  try {
    localStorage.setItem(LEARNING_STATE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save learning state:", e);
  }
}

export function getSessionHistory(): SessionHistory | null {
  try {
    const stored = localStorage.getItem(SESSION_HISTORY_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function saveSessionHistory(history: SessionHistory): void {
  try {
    localStorage.setItem(SESSION_HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.error("Failed to save session history:", e);
  }
}

function hasValidCloze(card: Flashcard): boolean {
  return !!(card.clozeOptions && card.clozeOptions.length >= 2 && card.clozeCorrect);
}

function hasValidMcq(card: Flashcard): boolean {
  return !!(card.mcqOptionsEn && card.mcqOptionsEn.length >= 2 && card.mcqCorrectEn && card.mcqQuestionEs);
}

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function getCardByFormat(cards: Flashcard[], format: CardFormat): Flashcard | null {
  const card = cards.find(c => c.variantType === format);
  if (!card) return null;
  if (format === "cloze" && !hasValidCloze(card)) return null;
  if (format === "mcq" && !hasValidMcq(card)) return null;
  return card;
}

function getAvailableFormats(cards: Flashcard[]): CardFormat[] {
  const formats: CardFormat[] = [];
  if (cards.some(c => c.variantType === "intro")) formats.push("intro");
  const clozeCard = cards.find(c => c.variantType === "cloze");
  if (clozeCard && hasValidCloze(clozeCard)) formats.push("cloze");
  const mcqCard = cards.find(c => c.variantType === "mcq");
  if (mcqCard && hasValidMcq(mcqCard)) formats.push("mcq");
  return formats;
}

export function buildSessionQueue(flashcards: Flashcard[]): {
  queue: Flashcard[];
  reservePool: Flashcard[];
  maxInteractions: number;
} {
  const conceptGroups: Record<string, Flashcard[]> = {};
  
  for (const card of flashcards) {
    if (!conceptGroups[card.conceptId]) {
      conceptGroups[card.conceptId] = [];
    }
    conceptGroups[card.conceptId].push(card);
  }

  const allConceptIds = shuffle(Object.keys(conceptGroups));
  
  const sessionConceptIds = allConceptIds.slice(0, NEW_CONCEPTS_PER_SESSION);
  
  const queue: Flashcard[] = [];
  let isFirstCard = true;

  const slots: CardFormat[] = [];
  const introCount = Math.ceil(sessionConceptIds.length * 0.6);
  const clozeCount = Math.floor(sessionConceptIds.length * 0.2);
  const mcqCount = sessionConceptIds.length - introCount - clozeCount;
  
  for (let i = 0; i < introCount; i++) slots.push("intro");
  for (let i = 0; i < clozeCount; i++) slots.push("cloze");
  for (let i = 0; i < mcqCount; i++) slots.push("mcq");
  
  let shuffledSlots = shuffle(slots);
  
  if (shuffledSlots[0] !== "intro") {
    const introIdx = shuffledSlots.indexOf("intro");
    if (introIdx > 0) {
      [shuffledSlots[0], shuffledSlots[introIdx]] = [shuffledSlots[introIdx], shuffledSlots[0]];
    }
  }
  
  const availableConcepts = [...sessionConceptIds];
  const usedConcepts = new Set<string>();
  
  for (let i = 0; i < shuffledSlots.length && availableConcepts.length > 0; i++) {
    const targetFormat = shuffledSlots[i];
    let selectedCard: Flashcard | null = null;
    let selectedConceptIdx = -1;
    
    for (let j = 0; j < availableConcepts.length; j++) {
      const conceptId = availableConcepts[j];
      if (usedConcepts.has(conceptId)) continue;
      
      const cards = conceptGroups[conceptId];
      const card = getCardByFormat(cards, targetFormat);
      
      if (card) {
        if (queue.length > 0) {
          const lastCard = queue[queue.length - 1];
          if (lastCard.conceptId === conceptId || lastCard.text === card.text) {
            continue;
          }
        }
        selectedCard = card;
        selectedConceptIdx = j;
        break;
      }
    }
    
    if (!selectedCard) {
      for (let j = 0; j < availableConcepts.length; j++) {
        const conceptId = availableConcepts[j];
        if (usedConcepts.has(conceptId)) continue;
        
        const cards = conceptGroups[conceptId];
        const introCard = getCardByFormat(cards, "intro");
        
        if (introCard) {
          if (queue.length > 0) {
            const lastCard = queue[queue.length - 1];
            if (lastCard.conceptId === conceptId || lastCard.text === introCard.text) {
              continue;
            }
          }
          selectedCard = introCard;
          selectedConceptIdx = j;
          break;
        }
      }
    }
    
    if (selectedCard && selectedConceptIdx >= 0) {
      queue.push(selectedCard);
      usedConcepts.add(availableConcepts[selectedConceptIdx]);
      availableConcepts.splice(selectedConceptIdx, 1);
      isFirstCard = false;
    }
  }

  return { 
    queue, 
    reservePool: flashcards,
    maxInteractions: MAX_INTERACTIONS_PER_SESSION
  };
}

export function processResponse(
  currentCard: Flashcard,
  gotItRight: boolean,
  currentQueue: Flashcard[],
  currentIndex: number,
  reservePool: Flashcard[],
  learningState: Record<string, ConceptLearningState>,
  seenConceptIds: Set<string>,
  interactionCount: number = 0
): {
  updatedQueue: Flashcard[];
  updatedState: Record<string, ConceptLearningState>;
  updatedReservePool: Flashcard[];
  updatedSeenConcepts: Set<string>;
  shouldEndSession: boolean;
} {
  const conceptId = currentCard.conceptId;
  
  const currentConceptState = learningState[conceptId] || {
    conceptId,
    seenCountToday: 0,
    correctStreak: 0,
    strength: "new" as const,
  };

  currentConceptState.seenCountToday += 1;
  currentConceptState.lastSeenIndex = currentIndex;

  if (gotItRight) {
    currentConceptState.correctStreak += 1;
    if (currentConceptState.correctStreak >= 3) {
      currentConceptState.strength = "strong";
    } else if (currentConceptState.correctStreak >= 1) {
      currentConceptState.strength = "weak";
    }
  } else {
    currentConceptState.correctStreak = 0;
    currentConceptState.strength = "weak";
  }

  const updatedState = {
    ...learningState,
    [conceptId]: currentConceptState,
  };

  const updatedSeenConcepts = new Set(seenConceptIds);
  updatedSeenConcepts.add(conceptId);

  saveLearningState(updatedState);

  let updatedQueue = [...currentQueue];
  const updatedReservePool = [...reservePool];

  const newInteractionCount = interactionCount + 1;
  const shouldEndSession = newInteractionCount >= MAX_INTERACTIONS_PER_SESSION;
  
  const conceptAppearedCount = updatedQueue.filter(c => c.conceptId === conceptId).length;
  
  if (conceptAppearedCount >= 3 || shouldEndSession) {
    return {
      updatedQueue,
      updatedState,
      updatedReservePool,
      updatedSeenConcepts,
      shouldEndSession,
    };
  }

  const currentFormat = currentCard.variantType as CardFormat;
  const conceptCards = updatedReservePool.filter(c => c.conceptId === conceptId);
  
  if (!gotItRight) {
    const offset = 2 + Math.floor(Math.random() * 4);
    const insertPosition = Math.min(currentIndex + offset, updatedQueue.length);
    
    const differentFormatCard = findDifferentFormatCard(conceptCards, currentFormat);
    
    if (differentFormatCard) {
      if (!hasAdjacentConflict(updatedQueue, insertPosition, conceptId, differentFormatCard.text)) {
        updatedQueue.splice(insertPosition, 0, differentFormatCard);
      } else {
        const altPosition = Math.min(insertPosition + 1, updatedQueue.length);
        if (!hasAdjacentConflict(updatedQueue, altPosition, conceptId, differentFormatCard.text)) {
          updatedQueue.splice(altPosition, 0, differentFormatCard);
        }
      }
    }
  } else {
    if (currentConceptState.correctStreak < 2) {
      const offset = 8 + Math.floor(Math.random() * 7);
      const insertPosition = Math.min(currentIndex + offset, updatedQueue.length);
      
      const differentFormatCard = findDifferentFormatCard(conceptCards, currentFormat);
      
      if (differentFormatCard) {
        if (!hasAdjacentConflict(updatedQueue, insertPosition, conceptId, differentFormatCard.text)) {
          updatedQueue.splice(insertPosition, 0, differentFormatCard);
        }
      }
    }
  }

  return {
    updatedQueue,
    updatedState,
    updatedReservePool,
    updatedSeenConcepts,
    shouldEndSession,
  };
}

function findDifferentFormatCard(
  conceptCards: Flashcard[],
  currentFormat: CardFormat
): Flashcard | null {
  const preferredOrder: CardFormat[] = currentFormat === "intro" 
    ? ["cloze", "mcq"]
    : currentFormat === "cloze"
    ? ["mcq", "intro"]
    : ["cloze", "intro"];
  
  for (const format of preferredOrder) {
    const card = conceptCards.find(c => c.variantType === format);
    if (card) {
      if (format === "cloze" && !hasValidCloze(card)) continue;
      if (format === "mcq" && !hasValidMcq(card)) continue;
      return card;
    }
  }
  
  return null;
}

function hasAdjacentConflict(
  queue: Flashcard[],
  position: number,
  conceptId: string,
  text: string
): boolean {
  const prev = queue[position - 1];
  const next = queue[position];
  
  if (prev && (prev.conceptId === conceptId || prev.text === text)) return true;
  if (next && (next.conceptId === conceptId || next.text === text)) return true;
  
  return false;
}
