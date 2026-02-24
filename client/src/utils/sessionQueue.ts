import type { Flashcard, ConceptLearningState, SessionHistory } from "@shared/schema";
import { 
  getUserProgress, 
  saveUserProgress, 
  getConceptLevel, 
  updateConceptLevel,
  getTotalSessionsCompleted,
  incrementTotalSessions,
  type CardLevel 
} from "./userProgress";

const LEARNING_STATE_KEY = "flashcard_learning_state";
const SESSION_HISTORY_KEY = "flashcard_session_history";
const SESSION_COUNT_KEY = "flashcard_session_count";
const SESSION_DATE_KEY = "flashcard_session_date";

const NEW_CONCEPTS_PER_SESSION = 5;
const MAX_INTERACTIONS_PER_SESSION = 18;
const MASTERED_REVIEW_INTERVAL = 20;

export type CardType = "intro" | "cloze" | "mcq" | "reorder" | "review";

export interface SessionCard {
  card: Flashcard;
  cardType: CardType;
  conceptId: string;
  level: CardLevel;
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
    
    incrementTotalSessions();
    
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

function getCardTypeForLevel(level: CardLevel): CardType {
  switch (level) {
    case 0: return "intro";
    case 1: return "cloze";
    case 2: return "mcq";
    case 3: return "reorder";
    case 4: return "review";
  }
}

function getCardByType(cards: Flashcard[], cardType: CardType): { card: Flashcard; actualType: CardType } | null {
  if (cardType === "intro" || cardType === "review") {
    const card = cards.find(c => c.variantType === "intro");
    return card ? { card, actualType: cardType } : null;
  }
  if (cardType === "cloze") {
    const card = cards.find(c => c.variantType === "cloze");
    if (card && hasValidCloze(card)) {
      console.log(`[Queue] ${cards[0]?.conceptId}: cloze card valid, showing as cloze`);
      return { card, actualType: "cloze" };
    }
    console.warn(`[Queue] ${cards[0]?.conceptId}: cloze INVALID, falling back to intro. clozeOptions:`, card?.clozeOptions, 'clozeCorrect:', card?.clozeCorrect);
    const introCard = cards.find(c => c.variantType === "intro");
    return introCard ? { card: introCard, actualType: "intro" } : null;
  }
  if (cardType === "mcq") {
    const card = cards.find(c => c.variantType === "mcq");
    if (card && hasValidMcq(card)) {
      console.log(`[Queue] ${cards[0]?.conceptId}: mcq card valid, showing as mcq`);
      return { card, actualType: "mcq" };
    }
    console.warn(`[Queue] ${cards[0]?.conceptId}: mcq INVALID, trying cloze. mcqOptionsEn:`, card?.mcqOptionsEn, 'mcqCorrectEn:', card?.mcqCorrectEn, 'mcqQuestionEs:', card?.mcqQuestionEs);
    const clozeCard = cards.find(c => c.variantType === "cloze");
    if (clozeCard && hasValidCloze(clozeCard)) return { card: clozeCard, actualType: "cloze" };
    const introCard = cards.find(c => c.variantType === "intro");
    return introCard ? { card: introCard, actualType: "intro" } : null;
  }
  if (cardType === "reorder") {
    const introCard = cards.find(c => c.variantType === "intro");
    return introCard ? { card: introCard, actualType: "reorder" } : null;
  }
  return null;
}

export function buildSessionQueue(flashcards: Flashcard[]): {
  queue: SessionCard[];
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

  const allConceptIds = Object.keys(conceptGroups);
  const userProgress = getUserProgress();
  const currentSession = userProgress.totalSessionsCompleted + 1;
  
  const conceptsByLevel: Record<CardLevel, string[]> = {
    0: [],
    1: [],
    2: [],
    3: [],
    4: [],
  };
  
  for (const conceptId of allConceptIds) {
    const level = getConceptLevel(conceptId);
    conceptsByLevel[level].push(conceptId);
  }
  
  console.log('[Queue] Concept level distribution:', JSON.stringify({
    level0: conceptsByLevel[0].length,
    level1: conceptsByLevel[1].length,
    level2: conceptsByLevel[2].length,
    level3: conceptsByLevel[3].length,
    level4: conceptsByLevel[4].length,
  }));
  console.log('[Queue] In-progress concepts:', JSON.stringify([
    ...conceptsByLevel[1].map(id => ({ id, level: 1 })),
    ...conceptsByLevel[2].map(id => ({ id, level: 2 })),
    ...conceptsByLevel[3].map(id => ({ id, level: 3 })),
  ]));
  
  const masteredForReview = conceptsByLevel[4].filter(conceptId => {
    const concept = userProgress.concepts[conceptId];
    if (!concept) return false;
    return currentSession - concept.lastSessionSeen >= MASTERED_REVIEW_INTERVAL;
  });
  
  const inProgressConcepts: string[] = [
    ...shuffle(conceptsByLevel[1]),
    ...shuffle(conceptsByLevel[2]),
    ...shuffle(conceptsByLevel[3]),
  ];
  
  const newConcepts = shuffle(conceptsByLevel[0]);
  
  const queue: SessionCard[] = [];
  
  const reviewToAdd = Math.min(masteredForReview.length, 2);
  for (let i = 0; i < reviewToAdd; i++) {
    const conceptId = masteredForReview[i];
    const cards = conceptGroups[conceptId];
    const result = getCardByType(cards, "review");
    if (result) {
      queue.push({
        card: result.card,
        cardType: result.actualType,
        conceptId,
        level: 4,
      });
    }
  }
  
  const inProgressToAdd = Math.min(inProgressConcepts.length, MAX_INTERACTIONS_PER_SESSION - queue.length);
  console.log(`[Queue] Adding ${inProgressToAdd} in-progress concepts (${inProgressConcepts.length} available)`);
  for (let i = 0; i < inProgressToAdd; i++) {
    const conceptId = inProgressConcepts[i];
    const level = getConceptLevel(conceptId);
    const cardType = getCardTypeForLevel(level);
    const cards = conceptGroups[conceptId];
    const result = getCardByType(cards, cardType);
    console.log(`[Queue] In-progress: ${conceptId} level=${level} wantType=${cardType} gotType=${result?.actualType || 'null'} variants=${cards?.map(c => c.variantType).join(',')}`);
    if (result) {
      queue.push({
        card: result.card,
        cardType: result.actualType,
        conceptId,
        level,
      });
    }
  }
  
  const remainingSlots = Math.min(NEW_CONCEPTS_PER_SESSION, MAX_INTERACTIONS_PER_SESSION - queue.length);
  for (let i = 0; i < remainingSlots && i < newConcepts.length; i++) {
    const conceptId = newConcepts[i];
    const cards = conceptGroups[conceptId];
    const result = getCardByType(cards, "intro");
    if (result) {
      queue.push({
        card: result.card,
        cardType: result.actualType,
        conceptId,
        level: 0,
      });
    }
  }
  
  const practiceCards = shuffle(queue.filter(item => item.cardType !== "intro"));
  const introCards = shuffle(queue.filter(item => item.cardType === "intro"));
  
  const interleavedQueue: SessionCard[] = [];
  
  if (practiceCards.length > 0) {
    const pi = Math.max(practiceCards.length, introCards.length);
    let pIdx = 0;
    let iIdx = 0;
    
    for (let i = 0; i < pi * 2 && interleavedQueue.length < queue.length; i++) {
      if (i % 2 === 0 && pIdx < practiceCards.length) {
        interleavedQueue.push(practiceCards[pIdx++]);
      } else if (iIdx < introCards.length) {
        interleavedQueue.push(introCards[iIdx++]);
      } else if (pIdx < practiceCards.length) {
        interleavedQueue.push(practiceCards[pIdx++]);
      }
    }
    
    while (pIdx < practiceCards.length) interleavedQueue.push(practiceCards[pIdx++]);
    while (iIdx < introCards.length) interleavedQueue.push(introCards[iIdx++]);
  } else {
    interleavedQueue.push(...shuffle(introCards));
  }

  const typeCounts: Record<string, number> = {};
  for (const item of interleavedQueue) {
    typeCounts[item.cardType] = (typeCounts[item.cardType] || 0) + 1;
  }
  console.log('[Queue] Session queue built:', JSON.stringify(typeCounts), 'total:', interleavedQueue.length);
  console.log('[Queue] Concept levels:', JSON.stringify(
    interleavedQueue.map(item => ({ id: item.conceptId, level: item.level, type: item.cardType }))
  ));

  return { 
    queue: interleavedQueue, 
    reservePool: flashcards,
    maxInteractions: MAX_INTERACTIONS_PER_SESSION
  };
}

export function processResponse(
  sessionCard: SessionCard,
  gotItRight: boolean,
  currentQueue: SessionCard[],
  currentIndex: number,
  reservePool: Flashcard[],
  interactionCount: number = 0
): {
  updatedQueue: SessionCard[];
  updatedReservePool: Flashcard[];
  shouldEndSession: boolean;
  newLevel: CardLevel;
} {
  const { conceptId, level } = sessionCard;
  
  const userProgress = getUserProgress();
  const currentSession = userProgress.totalSessionsCompleted + 1;
  const newLevel = updateConceptLevel(conceptId, gotItRight, currentSession);
  
  let updatedQueue = [...currentQueue];
  const updatedReservePool = [...reservePool];

  const newInteractionCount = interactionCount + 1;
  const shouldEndSession = newInteractionCount >= MAX_INTERACTIONS_PER_SESSION;
  
  if (shouldEndSession) {
    return {
      updatedQueue,
      updatedReservePool,
      shouldEndSession,
      newLevel,
    };
  }
  
  if (!gotItRight && newLevel < level) {
    const conceptCards = updatedReservePool.filter(c => c.conceptId === conceptId);
    const newCardType = getCardTypeForLevel(newLevel);
    const result = getCardByType(conceptCards, newCardType);
    
    if (result) {
      const offset = 2 + Math.floor(Math.random() * 3);
      const insertPosition = Math.min(currentIndex + offset, updatedQueue.length);
      
      const newSessionCard: SessionCard = {
        card: result.card,
        cardType: result.actualType,
        conceptId,
        level: newLevel,
      };
      
      updatedQueue.splice(insertPosition, 0, newSessionCard);
    }
  }

  return {
    updatedQueue,
    updatedReservePool,
    shouldEndSession,
    newLevel,
  };
}

export function processResponseLegacy(
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

  const newInteractionCount = interactionCount + 1;
  const shouldEndSession = newInteractionCount >= MAX_INTERACTIONS_PER_SESSION;

  return {
    updatedQueue: [...currentQueue],
    updatedState,
    updatedReservePool: [...reservePool],
    updatedSeenConcepts,
    shouldEndSession,
  };
}
