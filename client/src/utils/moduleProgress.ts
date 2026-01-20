import { modules, type Module } from "@/data/modules";
import { getUserProgress, type CardLevel } from "./userProgress";
import type { Flashcard } from "@shared/schema";

export interface ModuleProgress {
  moduleId: string;
  totalConcepts: number;
  masteredConcepts: number;
  inProgressConcepts: number;
  newConcepts: number;
  completionPercentage: number;
  isCompleted: boolean;
  isUnlocked: boolean;
  isActive: boolean;
}

export function getConceptsByModule(flashcards: Flashcard[]): Map<string, Set<string>> {
  const moduleConceptsMap = new Map<string, Set<string>>();
  
  for (const card of flashcards) {
    const deckId = card.deckId;
    if (!deckId) continue;
    
    if (!moduleConceptsMap.has(deckId)) {
      moduleConceptsMap.set(deckId, new Set());
    }
    moduleConceptsMap.get(deckId)!.add(card.conceptId);
  }
  
  return moduleConceptsMap;
}

export function getModuleProgress(
  module: Module,
  flashcards: Flashcard[]
): ModuleProgress {
  const userProgress = getUserProgress();
  const moduleConceptsMap = getConceptsByModule(flashcards);
  const conceptIds = moduleConceptsMap.get(module.deckId) || new Set<string>();
  
  const totalConcepts = conceptIds.size;
  
  if (totalConcepts === 0) {
    return {
      moduleId: module.id,
      totalConcepts: 0,
      masteredConcepts: 0,
      inProgressConcepts: 0,
      newConcepts: 0,
      completionPercentage: 0,
      isCompleted: false,
      isUnlocked: false,
      isActive: false,
    };
  }
  
  let masteredConcepts = 0;
  let inProgressConcepts = 0;
  let newConcepts = 0;
  
  for (const conceptId of Array.from(conceptIds)) {
    const level = userProgress.concepts[conceptId]?.level ?? 0;
    
    if (level === 4) {
      masteredConcepts++;
    } else if (level > 0) {
      inProgressConcepts++;
    } else {
      newConcepts++;
    }
  }
  
  const completionPercentage = Math.round((masteredConcepts / totalConcepts) * 100);
  const isCompleted = completionPercentage >= 80;
  
  return {
    moduleId: module.id,
    totalConcepts,
    masteredConcepts,
    inProgressConcepts,
    newConcepts,
    completionPercentage,
    isCompleted,
    isUnlocked: true,
    isActive: false,
  };
}

export function getAllModulesProgress(flashcards: Flashcard[]): ModuleProgress[] {
  const progressList: ModuleProgress[] = [];
  let foundActiveModule = false;
  
  for (let i = 0; i < modules.length; i++) {
    const module = modules[i];
    const progress = getModuleProgress(module, flashcards);
    
    if (!module.hasContent) {
      progressList.push({
        ...progress,
        isUnlocked: false,
        isActive: false,
      });
      continue;
    }
    
    if (i === 0) {
      progress.isUnlocked = true;
    } else {
      const prevModule = modules[i - 1];
      const prevProgress = progressList.find(p => p.moduleId === prevModule.id);
      progress.isUnlocked = prevProgress?.isCompleted ?? false;
    }
    
    if (progress.isUnlocked && !progress.isCompleted && !foundActiveModule) {
      progress.isActive = true;
      foundActiveModule = true;
    }
    
    progressList.push(progress);
  }
  
  if (!foundActiveModule && progressList.length > 0) {
    const firstUnlockedIncomplete = progressList.find(p => p.isUnlocked && !p.isCompleted);
    if (firstUnlockedIncomplete) {
      firstUnlockedIncomplete.isActive = true;
    } else {
      progressList[0].isActive = true;
    }
  }
  
  return progressList;
}

export function getCurrentModule(flashcards: Flashcard[]): Module | null {
  const allProgress = getAllModulesProgress(flashcards);
  const activeProgress = allProgress.find(p => p.isActive);
  
  if (activeProgress) {
    return modules.find(m => m.id === activeProgress.moduleId) || null;
  }
  
  return modules[0];
}

export function getOverallProgress(flashcards: Flashcard[]): {
  completedModules: number;
  totalModules: number;
  percentage: number;
} {
  const allProgress = getAllModulesProgress(flashcards);
  const modulesWithContent = allProgress.filter(p => {
    const module = modules.find(m => m.id === p.moduleId);
    return module?.hasContent;
  });
  
  const completedModules = modulesWithContent.filter(p => p.isCompleted).length;
  const totalModules = modulesWithContent.length;
  
  return {
    completedModules,
    totalModules,
    percentage: totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0,
  };
}
