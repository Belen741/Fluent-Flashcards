import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useFlashcards } from "@/hooks/use-flashcards";
import { Loader2, Volume2, ArrowRight, ThumbsUp, ThumbsDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import {
  buildSessionQueue,
  processResponse,
  getLearningState,
  saveLearningState,
  saveSessionHistory,
} from "@/utils/sessionQueue";
import { getImageUrl, getAudioUrl } from "@/utils/mediaResolver";
import type { Flashcard, ConceptLearningState } from "@shared/schema";

export default function Study() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [, setLocation] = useLocation();
  const { data: flashcards, isLoading } = useFlashcards();
  
  // Session queue state
  const [sessionQueue, setSessionQueue] = useState<Flashcard[]>([]);
  const [reservePool, setReservePool] = useState<Flashcard[]>([]);
  const [learningState, setLearningState] = useState<Record<string, ConceptLearningState>>({});
  const [seenConceptIds, setSeenConceptIds] = useState<Set<string>>(new Set());
  const [userResponse, setUserResponse] = useState<"correct" | "incorrect" | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  // Initialize session queue when flashcards load
  useEffect(() => {
    if (flashcards && flashcards.length > 0 && !isInitialized) {
      const { queue, reservePool: pool } = buildSessionQueue(flashcards);
      setSessionQueue(queue);
      setReservePool(pool);
      setLearningState(getLearningState());
      setIsInitialized(true);
    }
  }, [flashcards, isInitialized]);

  const handleResponse = useCallback((correct: boolean) => {
    setUserResponse(correct ? "correct" : "incorrect");
    setShowFeedback(true);
  }, []);

  const handleNext = useCallback(() => {
    if (sessionQueue.length === 0) return;
    
    const currentCard = sessionQueue[currentIndex];
    // Determine if user got it right (default to correct if no response)
    const gotItRight = userResponse !== "incorrect";

    // Process response and potentially update queue
    const result = processResponse(
      currentCard,
      gotItRight,
      sessionQueue,
      currentIndex,
      reservePool,
      learningState,
      seenConceptIds
    );

    setSessionQueue(result.updatedQueue);
    setLearningState(result.updatedState);
    setReservePool(result.updatedReservePool);
    setSeenConceptIds(result.updatedSeenConcepts);
    setUserResponse(null);
    setShowFeedback(false);

    // Check if session is complete
    const nextIndex = currentIndex + 1;
    if (nextIndex >= result.updatedQueue.length) {
      // Save final state before completing
      saveLearningState(result.updatedState);
      saveSessionHistory({
        date: new Date().toISOString(),
        conceptsSeen: Array.from(result.updatedSeenConcepts),
      });
      setLocation("/complete");
    } else {
      setCurrentIndex(nextIndex);
    }
  }, [currentIndex, userResponse, sessionQueue, reservePool, learningState, seenConceptIds, setLocation]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case "1":
          handleResponse(true);
          break;
        case "2":
          handleResponse(false);
          break;
        case "Enter":
          handleNext();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleResponse, handleNext]);

  if (isLoading || !flashcards || !isInitialized || sessionQueue.length === 0) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  const totalCards = sessionQueue.length;
  const currentCard = sessionQueue[currentIndex];
  const progress = ((currentIndex + 1) / totalCards) * 100;

  const playAudio = () => {
    const audioUrl = getAudioUrl(currentCard);
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(() => {
        console.log("Audio not available for:", currentCard.text);
      });
    } else {
      console.log("No audio URL for:", currentCard.text);
    }
  };

  // Micro-feedback message
  const getFeedbackMessage = () => {
    if (!showFeedback || !userResponse) return null;
    if (userResponse === "correct") {
      return "Muy bien.";
    }
    return "Sigue adelante.";
  };

  return (
    <Layout>
      <div className="space-y-5">
        {/* Session Header */}
        <div className="text-center">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest" data-testid="text-session-header">
            Sesión de hoy
          </span>
        </div>

        {/* Progress Section */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2 rounded-full bg-secondary/50" data-testid="progress-bar" />
          <div className="flex justify-between items-center gap-4 px-1">
            <span className="text-xs text-muted-foreground" data-testid="text-status">
              Vas muy bien.
            </span>
            <span className="text-xs text-muted-foreground" data-testid="text-progress-counter">
              Tarjeta {currentIndex + 1} de {totalCards}
            </span>
          </div>
        </div>

        {/* Flashcard Area */}
        <div className="relative h-[380px] w-full p-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCard.id + "-" + currentIndex}
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -40, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-full h-full"
            >
              <Card className="h-full flex flex-col overflow-hidden">
                {/* Image Section */}
                <div className="h-[55%] w-full bg-secondary/30 relative flex items-center justify-center">
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
                </div>

                {/* Content Section */}
                <div className="flex-1 flex flex-col items-center justify-center p-5 text-center relative">
                  <Button
                    variant="default"
                    size="icon"
                    onClick={playAudio}
                    data-testid="button-audio"
                    className="absolute -top-5 rounded-full shadow-md"
                  >
                    <Volume2 className="h-5 w-5" />
                  </Button>
                  
                  <div className="space-y-2 mt-3">
                    <h2 className="text-xl md:text-2xl font-bold text-foreground" data-testid="text-spanish-word">
                      {currentCard.text}
                    </h2>
                    <AnimatePresence>
                      {showFeedback && userResponse && (
                        <motion.p 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-base text-muted-foreground" 
                          data-testid="text-english-translation"
                        >
                          {currentCard.englishText}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Response Section */}
        <div className="space-y-3">
          {/* Question prompt */}
          <p className="text-center text-xs text-muted-foreground" data-testid="text-question-prompt">
            ¿Cómo te fue con esta tarjeta?
          </p>

          {/* Response Buttons */}
          <div className="flex gap-3 justify-center">
            <Button
              variant={userResponse === "correct" ? "default" : "outline"}
              size="default"
              onClick={() => handleResponse(true)}
              data-testid="button-lo-supe"
              className="flex items-center gap-2"
            >
              <ThumbsUp className="h-4 w-4" />
              <span>Lo supe</span>
              <span className="text-xs opacity-60 ml-1">(1)</span>
            </Button>
            <Button
              variant={userResponse === "incorrect" ? "destructive" : "outline"}
              size="default"
              onClick={() => handleResponse(false)}
              data-testid="button-no-lo-supe"
              className="flex items-center gap-2"
            >
              <ThumbsDown className="h-4 w-4" />
              <span>No lo supe</span>
              <span className="text-xs opacity-60 ml-1">(2)</span>
            </Button>
          </div>

          {/* Micro-feedback */}
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

        {/* Next Button */}
        <div className="pt-1">
          <Button 
            size="lg"
            onClick={handleNext}
            data-testid="button-siguiente"
            className="w-full font-semibold"
          >
            <span>Siguiente</span>
            <ArrowRight className="ml-2 h-5 w-5" />
            <span className="text-xs opacity-60 ml-2">(Enter)</span>
          </Button>
        </div>
      </div>
    </Layout>
  );
}
