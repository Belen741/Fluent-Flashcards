import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
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

  if (isLoading || !flashcards || !isInitialized || sessionQueue.length === 0) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const totalCards = sessionQueue.length;
  const currentCard = sessionQueue[currentIndex];
  const progress = ((currentIndex + 1) / totalCards) * 100;

  const handleResponse = (correct: boolean) => {
    setUserResponse(correct ? "correct" : "incorrect");
  };

  const handleNext = () => {
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
  };

  const playAudio = () => {
    console.log("Playing audio for:", currentCard.text);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Progress */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-end px-1">
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
              Progreso
            </span>
            <span className="text-sm font-bold text-foreground">
              Tarjeta {currentIndex + 1} <span className="text-muted-foreground font-normal">de</span> {totalCards}
            </span>
          </div>
          <Progress value={progress} className="h-3 rounded-full bg-secondary" />
        </div>

        {/* Flashcard Area */}
        <div className="relative h-[420px] w-full perspective-1000">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCard.id + "-" + currentIndex}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full"
            >
              <div className="h-full bg-white rounded-3xl shadow-xl shadow-black/5 border border-border flex flex-col overflow-hidden">
                {/* Image Section */}
                <div className="h-[50%] w-full bg-secondary/30 relative group overflow-hidden">
                  <img 
                    src={currentCard.imageUrl} 
                    alt={currentCard.englishText}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-bold rounded-full shadow-sm text-foreground/80 uppercase tracking-wide">
                      {currentCard.category}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center space-y-3 relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={playAudio}
                    data-testid="button-audio"
                    className="absolute -top-6 bg-primary text-primary-foreground h-12 w-12 rounded-full shadow-lg"
                  >
                    <Volume2 className="h-6 w-6" />
                  </Button>
                  
                  <div className="space-y-1 mt-4">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-foreground" data-testid="text-spanish-word">
                      {currentCard.text}
                    </h2>
                    <p className="text-base text-muted-foreground font-medium" data-testid="text-english-translation">
                      {currentCard.englishText}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Response Buttons */}
        <div className="flex gap-3 justify-center">
          <Button
            variant={userResponse === "correct" ? "default" : "outline"}
            size="sm"
            onClick={() => handleResponse(true)}
            data-testid="button-lo-supe"
            className="flex items-center gap-2 px-4"
          >
            <ThumbsUp className="h-4 w-4" />
            <span>Lo supe</span>
          </Button>
          <Button
            variant={userResponse === "incorrect" ? "destructive" : "outline"}
            size="sm"
            onClick={() => handleResponse(false)}
            data-testid="button-no-lo-supe"
            className="flex items-center gap-2 px-4"
          >
            <ThumbsDown className="h-4 w-4" />
            <span>No lo supe</span>
          </Button>
        </div>

        {/* Next Button */}
        <div className="pt-2">
          <Button 
            onClick={handleNext}
            data-testid="button-siguiente"
            className="w-full h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/20"
          >
            <span>Siguiente</span>
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </Layout>
  );
}
