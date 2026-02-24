const USER_PROGRESS_KEY = "flashcard_user_progress";
const TOTAL_SESSIONS_KEY = "flashcard_total_sessions";

export type CardLevel = 0 | 1 | 2 | 3 | 4;

export interface ConceptProgress {
  conceptId: string;
  level: CardLevel;
  lastSessionSeen: number;
}

export interface UserProgress {
  concepts: Record<string, ConceptProgress>;
  totalSessionsCompleted: number;
}

export function getUserProgress(): UserProgress {
  try {
    const stored = localStorage.getItem(USER_PROGRESS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const conceptCount = Object.keys(parsed.concepts || {}).length;
      const levels = Object.values(parsed.concepts || {}).map((c: any) => c.level);
      console.log(`[Progress] getUserProgress: ${conceptCount} concepts, sessions=${parsed.totalSessionsCompleted}, levels=[${levels.join(',')}]`);
      return parsed;
    }
  } catch {
    console.error("Failed to load user progress");
  }
  console.log('[Progress] getUserProgress: EMPTY (no stored data)');
  return {
    concepts: {},
    totalSessionsCompleted: 0,
  };
}

export function resetAllProgress(): void {
  try {
    localStorage.removeItem(USER_PROGRESS_KEY);
    localStorage.removeItem(TOTAL_SESSIONS_KEY);
    localStorage.removeItem("flashcard_learning_state");
    localStorage.removeItem("flashcard_session_history");
    localStorage.removeItem("flashcard_session_count");
    localStorage.removeItem("flashcard_session_date");
  } catch (e) {
    console.error("Failed to reset progress:", e);
  }
}

export function saveUserProgress(progress: UserProgress): void {
  try {
    localStorage.setItem(USER_PROGRESS_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error("Failed to save user progress:", e);
  }
}

export function getConceptLevel(conceptId: string): CardLevel {
  const progress = getUserProgress();
  return progress.concepts[conceptId]?.level ?? 0;
}

export function updateConceptLevel(
  conceptId: string,
  gotItRight: boolean,
  currentSessionNumber: number
): CardLevel {
  const progress = getUserProgress();
  
  const current = progress.concepts[conceptId] || {
    conceptId,
    level: 0 as CardLevel,
    lastSessionSeen: currentSessionNumber,
  };
  
  let newLevel: CardLevel;
  
  if (gotItRight) {
    newLevel = Math.min(4, current.level + 1) as CardLevel;
  } else {
    newLevel = Math.max(0, current.level - 1) as CardLevel;
  }
  
  progress.concepts[conceptId] = {
    ...current,
    level: newLevel,
    lastSessionSeen: currentSessionNumber,
  };
  
  console.log(`[Progress] ${conceptId}: level ${current.level} → ${newLevel} (gotItRight=${gotItRight}, session=${currentSessionNumber})`);
  saveUserProgress(progress);
  
  return newLevel;
}

export function markConceptSeen(conceptId: string, currentSessionNumber: number): void {
  const progress = getUserProgress();
  const current = progress.concepts[conceptId];
  if (current) {
    current.lastSessionSeen = currentSessionNumber;
    saveUserProgress(progress);
  }
}

export function incrementTotalSessions(): number {
  const progress = getUserProgress();
  progress.totalSessionsCompleted += 1;
  saveUserProgress(progress);
  return progress.totalSessionsCompleted;
}

export function getTotalSessionsCompleted(): number {
  return getUserProgress().totalSessionsCompleted;
}

export function shouldShowMasteredCard(conceptId: string, currentSession: number): boolean {
  const progress = getUserProgress();
  const concept = progress.concepts[conceptId];
  
  if (!concept || concept.level !== 4) {
    return false;
  }
  
  const sessionsSinceLastSeen = currentSession - concept.lastSessionSeen;
  return sessionsSinceLastSeen >= 20;
}

export function getConceptsAtLevel(level: CardLevel): string[] {
  const progress = getUserProgress();
  return Object.keys(progress.concepts).filter(
    (conceptId) => progress.concepts[conceptId].level === level
  );
}

export function getConceptsNeedingReview(currentSession: number): string[] {
  const progress = getUserProgress();
  return Object.keys(progress.concepts).filter((conceptId) => {
    const concept = progress.concepts[conceptId];
    if (concept.level !== 4) return false;
    return currentSession - concept.lastSessionSeen >= 20;
  });
}

export function getLevelCardType(level: CardLevel): "intro" | "cloze" | "mcq" | "reorder" | "review" {
  switch (level) {
    case 0:
      return "intro";
    case 1:
      return "cloze";
    case 2:
      return "mcq";
    case 3:
      return "reorder";
    case 4:
      return "review";
  }
}

export function resetUserProgress(): void {
  localStorage.removeItem(USER_PROGRESS_KEY);
}
