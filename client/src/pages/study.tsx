import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation, useSearch } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useFlashcards } from "@/hooks/use-flashcards";
import { Loader2, Volume2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import {
  buildSessionQueue,
  processResponse,
  saveSessionHistory,
  getSessionsCompletedToday,
  incrementSessionCount,
  type SessionCard,
  type CardType,
} from "@/utils/sessionQueue";
import { getImageUrl, getAudioUrl } from "@/utils/mediaResolver";
import { QuickFillCard } from "@/components/quick-fill-card";
import { QuickPickCard } from "@/components/quick-pick-card";
import { WordReorderCard } from "@/components/word-reorder-card";
import { ReviewCard } from "@/components/review-card";
import type { Flashcard } from "@shared/schema";

export default function Study() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const { data: flashcards, isLoading } = useFlashcards();
  
  const sessionNumber = useMemo(() => {
    const params = new URLSearchParams(searchString);
    const session = params.get("session");
    return session ? parseInt(session, 10) : getSessionsCompletedToday() + 1;
  }, [searchString]);
  
  const [sessionQueue, setSessionQueue] = useState<SessionCard[]>([]);
  const [reservePool, setReservePool] = useState<Flashcard[]>([]);
  const [userResponse, setUserResponse] = useState<"correct" | "incorrect" | null>(null);
  const [initializedSession, setInitializedSession] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [interactiveAnswered, setInteractiveAnswered] = useState(false);
  const [interactionCount, setInteractionCount] = useState(0);
  const [maxInteractions, setMaxInteractions] = useState(18);
  const [seenConceptIds, setSeenConceptIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (flashcards && flashcards.length > 0 && initializedSession !== sessionNumber) {
      const { queue, reservePool: pool, maxInteractions: max } = buildSessionQueue(flashcards);
      setSessionQueue(queue);
      setReservePool(pool);
      setMaxInteractions(max);
      setSeenConceptIds(new Set());
      setCurrentIndex(0);
      setInteractionCount(0);
      setUserResponse(null);
      setShowFeedback(false);
      setIsFlipped(false);
      setInteractiveAnswered(false);
      setInitializedSession(sessionNumber);
    }
  }, [flashcards, sessionNumber, initializedSession]);

  const handleInteractiveAnswer = useCallback((correct: boolean) => {
    setUserResponse(correct ? "correct" : "incorrect");
    setShowFeedback(true);
    setInteractiveAnswered(true);
  }, []);

  const handleInteractiveNext = useCallback(() => {
    if (sessionQueue.length === 0 || !interactiveAnswered) return;
    
    const currentSessionCard = sessionQueue[currentIndex];
    const gotItRight = userResponse === "correct";

    const result = processResponse(
      currentSessionCard,
      gotItRight,
      sessionQueue,
      currentIndex,
      reservePool,
      interactionCount
    );

    const newCount = interactionCount + 1;
    setInteractionCount(newCount);
    setSessionQueue(result.updatedQueue);
    setReservePool(result.updatedReservePool);
    
    const updatedSeenConcepts = new Set(Array.from(seenConceptIds).concat([currentSessionCard.conceptId]));
    setSeenConceptIds(updatedSeenConcepts);
    setUserResponse(null);
    setShowFeedback(false);
    setIsFlipped(false);
    setInteractiveAnswered(false);

    const nextIndex = currentIndex + 1;
    if (result.shouldEndSession || nextIndex >= result.updatedQueue.length) {
      saveSessionHistory({
        date: new Date().toISOString(),
        conceptsSeen: Array.from(updatedSeenConcepts),
      });
      incrementSessionCount();
      setLocation("/complete");
    } else {
      setCurrentIndex(nextIndex);
    }
  }, [currentIndex, userResponse, sessionQueue, reservePool, setLocation, interactiveAnswered, interactionCount, seenConceptIds]);

  const handleStandardNext = useCallback(() => {
    if (sessionQueue.length === 0) return;
    
    const currentSessionCard = sessionQueue[currentIndex];

    const result = processResponse(
      currentSessionCard,
      true,
      sessionQueue,
      currentIndex,
      reservePool,
      interactionCount
    );

    const newCount = interactionCount + 1;
    setInteractionCount(newCount);
    setSessionQueue(result.updatedQueue);
    setReservePool(result.updatedReservePool);
    
    const updatedSeenConcepts = new Set(Array.from(seenConceptIds).concat([currentSessionCard.conceptId]));
    setSeenConceptIds(updatedSeenConcepts);
    setUserResponse(null);
    setShowFeedback(false);
    setIsFlipped(false);
    setInteractiveAnswered(false);

    const nextIndex = currentIndex + 1;
    if (result.shouldEndSession || nextIndex >= result.updatedQueue.length) {
      saveSessionHistory({
        date: new Date().toISOString(),
        conceptsSeen: Array.from(updatedSeenConcepts),
      });
      incrementSessionCount();
      setLocation("/complete");
    } else {
      setCurrentIndex(nextIndex);
    }
  }, [currentIndex, sessionQueue, reservePool, setLocation, interactionCount, seenConceptIds]);

  const handleReviewAnswer = useCallback((knew: boolean) => {
    if (sessionQueue.length === 0) return;
    
    const currentSessionCard = sessionQueue[currentIndex];

    const result = processResponse(
      currentSessionCard,
      knew,
      sessionQueue,
      currentIndex,
      reservePool,
      interactionCount
    );

    const newCount = interactionCount + 1;
    setInteractionCount(newCount);
    setSessionQueue(result.updatedQueue);
    setReservePool(result.updatedReservePool);
    
    const updatedSeenConcepts = new Set(Array.from(seenConceptIds).concat([currentSessionCard.conceptId]));
    setSeenConceptIds(updatedSeenConcepts);
    setUserResponse(null);
    setShowFeedback(false);
    setIsFlipped(false);
    setInteractiveAnswered(false);

    const nextIndex = currentIndex + 1;
    if (result.shouldEndSession || nextIndex >= result.updatedQueue.length) {
      saveSessionHistory({
        date: new Date().toISOString(),
        conceptsSeen: Array.from(updatedSeenConcepts),
      });
      incrementSessionCount();
      setLocation("/complete");
    } else {
      setCurrentIndex(nextIndex);
    }
  }, [currentIndex, sessionQueue, reservePool, setLocation, interactionCount, seenConceptIds]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (sessionQueue.length === 0 || currentIndex >= sessionQueue.length) return;
      
      const currentSessionCard = sessionQueue[currentIndex];
      const cardType = currentSessionCard.cardType;

      if (cardType === "cloze" || cardType === "mcq") {
        if (e.key === "Enter" && interactiveAnswered) {
          handleInteractiveNext();
        }
      } else if (cardType === "reorder") {
        // Reorder card handles its own input
      } else if (cardType === "review") {
        // Review card handles its own buttons
      } else if (cardType === "intro") {
        if (e.key === "Enter" && isFlipped) {
          handleStandardNext();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleStandardNext, handleInteractiveNext, sessionQueue, currentIndex, interactiveAnswered, isFlipped]);

  if (isLoading || !flashcards || initializedSession === null || sessionQueue.length === 0) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  const totalCards = sessionQueue.length;
  const currentSessionCard = sessionQueue[currentIndex];
  const currentCard = currentSessionCard.card;
  const cardType = currentSessionCard.cardType;
  const progress = ((currentIndex + 1) / totalCards) * 100;

  const playAudio = () => {
    const audioUrl = getAudioUrl(currentCard);
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(() => {
        console.log("Audio not available for:", currentCard.text);
      });
    }
  };

  const getFeedbackMessage = () => {
    if (!showFeedback || !userResponse) return null;
    if (userResponse === "correct") {
      return "Great job!";
    }
    return "Keep going!";
  };

  const getLevelLabel = (cardType: CardType): string => {
    switch (cardType) {
      case "intro": return "Learn";
      case "cloze": return "Recognize";
      case "mcq": return "Recall";
      case "reorder": return "Produce";
      case "review": return "Review";
    }
  };

  return (
    <Layout>
      <div className="space-y-5">
        <div className="text-center">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest" data-testid="text-session-header">
            Today's Session
          </span>
        </div>

        <div className="space-y-2">
          <Progress value={progress} className="h-2 rounded-full bg-secondary/50" data-testid="progress-bar" />
          <div className="flex justify-between items-center gap-4 px-1">
            <span className="text-xs text-muted-foreground" data-testid="text-status">
              {getLevelLabel(cardType)} Mode
            </span>
            <span className="text-xs text-muted-foreground" data-testid="text-progress-counter">
              Card {currentIndex + 1} of {totalCards}
            </span>
          </div>
        </div>

        <div className="relative h-[380px] w-full p-1 perspective-1000">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCard.id + "-" + currentIndex}
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -40, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-full h-full"
            >
              {cardType === "cloze" ? (
                <QuickFillCard 
                  card={currentCard} 
                  onAnswer={handleInteractiveAnswer} 
                />
              ) : cardType === "mcq" ? (
                <QuickPickCard 
                  card={currentCard} 
                  onAnswer={handleInteractiveAnswer} 
                />
              ) : cardType === "reorder" ? (
                <WordReorderCard 
                  card={currentCard} 
                  onAnswer={handleInteractiveAnswer} 
                />
              ) : cardType === "review" ? (
                <ReviewCard 
                  card={currentCard} 
                  onAnswer={handleReviewAnswer} 
                />
              ) : (
                <div 
                  className="relative w-full h-full cursor-pointer"
                  style={{ transformStyle: "preserve-3d" }}
                  onClick={() => setIsFlipped(!isFlipped)}
                  data-testid="flashcard-container"
                >
                  <motion.div
                    className="absolute inset-0"
                    initial={false}
                    animate={{ 
                      rotateY: isFlipped ? 180 : 0,
                      opacity: isFlipped ? 0 : 1 
                    }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <Card className="h-full flex flex-col overflow-hidden">
                      <div className="h-[65%] w-full bg-secondary/30 relative flex items-center justify-center">
                        <img 
                          src={getImageUrl(currentCard)} 
                          alt={currentCard.englishText}
                          className="max-w-full max-h-full object-contain"
                          data-testid={`img-flashcard-${currentCard.id}`}
                        />
                        <div className="absolute top-3 right-3">
                          <span 
                            className="px-2.5 py-1 bg-card/90 backdrop-blur-sm text-xs font-medium rounded-full text-muted-foreground uppercase tracking-wide"
                            data-testid={`text-category-${currentCard.id}`}
                          >
                            {currentCard.category}
                          </span>
                        </div>
                        <Button
                          variant="default"
                          size="icon"
                          onClick={(e) => { e.stopPropagation(); playAudio(); }}
                          data-testid="button-audio"
                          className="absolute -bottom-6 rounded-full shadow-lg h-14 w-14"
                        >
                          <Volume2 className="h-7 w-7" />
                        </Button>
                      </div>

                      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                        <div className="space-y-3 mt-2">
                          <h2 className="text-xl md:text-2xl font-bold text-foreground" data-testid="text-spanish-word">
                            {currentCard.text}
                          </h2>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); setIsFlipped(true); }}
                            data-testid="button-show-translation"
                          >
                            Show translation
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>

                  <motion.div
                    className="absolute inset-0"
                    initial={false}
                    animate={{ 
                      rotateY: isFlipped ? 0 : -180,
                      opacity: isFlipped ? 1 : 0 
                    }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <Card className="h-full flex flex-col items-center justify-center p-6 text-center">
                      <div className="space-y-4">
                        <p className="text-base text-muted-foreground" data-testid="text-spanish-back">
                          {currentCard.text}
                        </p>
                        <h2 className="text-xl md:text-2xl font-bold text-foreground" data-testid="text-english-translation">
                          {currentCard.englishText}
                        </h2>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }}
                          data-testid="button-hide-translation"
                        >
                          Hide translation
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="space-y-3">
          {cardType === "intro" && isFlipped && (
            <Button 
              size="lg"
              onClick={handleStandardNext}
              data-testid="button-next-standard"
              className="w-full font-semibold"
            >
              <span>Next</span>
              <ArrowRight className="ml-2 h-5 w-5" />
              <span className="text-xs opacity-60 ml-2">(Enter)</span>
            </Button>
          )}

          {(cardType === "cloze" || cardType === "mcq" || cardType === "reorder") && interactiveAnswered && (
            <Button 
              size="lg"
              onClick={handleInteractiveNext}
              data-testid="button-next"
              className="w-full font-semibold"
            >
              <span>Next</span>
              <ArrowRight className="ml-2 h-5 w-5" />
              <span className="text-xs opacity-60 ml-2">(Enter)</span>
            </Button>
          )}

          <AnimatePresence mode="wait">
            {showFeedback && userResponse && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={`text-center text-sm font-medium ${
                  userResponse === "correct" ? "text-foreground" : "text-muted-foreground"
                }`}
                data-testid="text-feedback"
              >
                {getFeedbackMessage()}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}
