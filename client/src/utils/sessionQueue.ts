import type { Flashcard, ConceptLearningState, SessionHistory } from "@shared/schema";

const LEARNING_STATE_KEY = "flashcard_learning_state";
const SESSION_HISTORY_KEY = "flashcard_session_history";
const SESSION_COUNT_KEY = "flashcard_session_count";
const SESSION_DATE_KEY = "flashcard_session_date";

// Get today's date as string (YYYY-MM-DD)
function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

// Get number of sessions completed today
export function getSessionsCompletedToday(): number {
  try {
    const storedDate = localStorage.getItem(SESSION_DATE_KEY);
    const today = getTodayString();
    
    if (storedDate !== today) {
      // New day, reset count
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

// Increment session count for today
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

// Get learning state from localStorage
export function getLearningState(): Record<string, ConceptLearningState> {
  try {
    const stored = localStorage.getItem(LEARNING_STATE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

// Save learning state to localStorage
export function saveLearningState(state: Record<string, ConceptLearningState>): void {
  try {
    localStorage.setItem(LEARNING_STATE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save learning state:", e);
  }
}

// Get session history from localStorage
export function getSessionHistory(): SessionHistory | null {
  try {
    const stored = localStorage.getItem(SESSION_HISTORY_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

// Save session history to localStorage
export function saveSessionHistory(history: SessionHistory): void {
  try {
    localStorage.setItem(SESSION_HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.error("Failed to save session history:", e);
  }
}

// Build initial session queue with only intro variants (one per concept)
// Other variants are reserved for reinforcement when user marks "No lo supe"
export function buildSessionQueue(flashcards: Flashcard[]): {
  queue: Flashcard[];
  reservePool: Flashcard[];
} {
  // Group cards by conceptId
  const conceptGroups: Record<string, Flashcard[]> = {};
  
  for (const card of flashcards) {
    if (!conceptGroups[card.conceptId]) {
      conceptGroups[card.conceptId] = [];
    }
    conceptGroups[card.conceptId].push(card);
  }

  // Sort variants within each concept: intro -> cloze -> mcq
  const variantOrder = ["intro", "cloze", "mcq"];
  for (const conceptId in conceptGroups) {
    conceptGroups[conceptId].sort(
      (a, b) => variantOrder.indexOf(a.variantType) - variantOrder.indexOf(b.variantType)
    );
  }

  // Initial queue: only intro variants (first variant of each concept)
  const queue: Flashcard[] = [];
  const reservePool: Flashcard[] = [];
  const conceptIds = Object.keys(conceptGroups);

  // Shuffle concepts for variety
  const shuffledConcepts = [...conceptIds].sort(() => Math.random() - 0.5);

  for (const conceptId of shuffledConcepts) {
    const cards = conceptGroups[conceptId];
    if (cards.length > 0) {
      // First card (intro) goes to queue
      queue.push(cards[0]);
      // Rest go to reserve pool for reinforcement
      for (let i = 1; i < cards.length; i++) {
        reservePool.push(cards[i]);
      }
    }
  }

  return { queue, reservePool };
}

// Find next available variant for a concept from the reserve pool
function findNextVariantFromReserve(
  conceptId: string,
  reservePool: Flashcard[]
): { card: Flashcard | null; updatedPool: Flashcard[] } {
  const index = reservePool.findIndex(c => c.conceptId === conceptId);
  
  if (index === -1) {
    return { card: null, updatedPool: reservePool };
  }

  const card = reservePool[index];
  const updatedPool = [...reservePool];
  updatedPool.splice(index, 1);

  return { card, updatedPool };
}

// Handle user response and potentially insert repeat cards
export function processResponse(
  currentCard: Flashcard,
  gotItRight: boolean,
  currentQueue: Flashcard[],
  currentIndex: number,
  reservePool: Flashcard[],
  learningState: Record<string, ConceptLearningState>,
  seenConceptIds: Set<string>
): {
  updatedQueue: Flashcard[];
  updatedState: Record<string, ConceptLearningState>;
  updatedReservePool: Flashcard[];
  updatedSeenConcepts: Set<string>;
} {
  const conceptId = currentCard.conceptId;
  
  // Update learning state for this concept
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

  // Track seen concepts
  const updatedSeenConcepts = new Set(seenConceptIds);
  updatedSeenConcepts.add(conceptId);

  // Save state after each response
  saveLearningState(updatedState);

  let updatedQueue = [...currentQueue];
  let updatedReservePool = [...reservePool];

  // If user got it wrong, insert another variant from reserve pool soon
  if (!gotItRight) {
    const { card: nextVariant, updatedPool } = findNextVariantFromReserve(
      conceptId,
      updatedReservePool
    );

    if (nextVariant) {
      updatedReservePool = updatedPool;
      
      // Insert 2-3 positions ahead (camouflaged repetition)
      const insertOffset = 2 + Math.floor(Math.random() * 2);
      const insertPosition = Math.min(
        currentIndex + insertOffset,
        updatedQueue.length
      );
      
      // Check we don't put same concept adjacent
      const prev = updatedQueue[insertPosition - 1];
      const next = updatedQueue[insertPosition];
      
      if (
        (!prev || prev.conceptId !== conceptId) &&
        (!next || next.conceptId !== conceptId)
      ) {
        updatedQueue.splice(insertPosition, 0, nextVariant);
      } else {
        // Try one position later
        const altPosition = Math.min(insertPosition + 1, updatedQueue.length);
        updatedQueue.splice(altPosition, 0, nextVariant);
      }
    }
  }

  return {
    updatedQueue,
    updatedState,
    updatedReservePool,
    updatedSeenConcepts,
  };
}
