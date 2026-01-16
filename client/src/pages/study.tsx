import { useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useFlashcards } from "@/hooks/use-flashcards";
import { Loader2, Volume2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";

export default function Study() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [, setLocation] = useLocation();
  const { data: flashcards, isLoading } = useFlashcards();

  if (isLoading || !flashcards) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const totalCards = flashcards.length;
  const currentCard = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / totalCards) * 100;

  const handleNext = () => {
    if (currentIndex < totalCards - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setLocation("/complete");
    }
  };

  const playAudio = () => {
    // Mock audio playback interaction
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
              {currentIndex + 1} <span className="text-muted-foreground font-normal">de</span> {totalCards}
            </span>
          </div>
          <Progress value={progress} className="h-3 rounded-full bg-secondary" />
        </div>

        {/* Flashcard Area */}
        <div className="relative h-[500px] w-full perspective-1000">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCard.id}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full"
            >
              <div className="h-full bg-white rounded-3xl shadow-xl shadow-black/5 border border-border flex flex-col overflow-hidden">
                {/* Image Section */}
                <div className="h-[55%] w-full bg-secondary/30 relative group overflow-hidden">
                  {/* Unsplash image with descriptive alt */}
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
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={playAudio}
                    className="absolute -top-6 bg-primary text-primary-foreground h-12 w-12 rounded-full shadow-lg hover:bg-primary/90 hover:scale-110 transition-all duration-200"
                  >
                    <Volume2 className="h-6 w-6" />
                  </Button>
                  
                  <div className="space-y-2 mt-4">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-foreground">
                      {currentCard.text}
                    </h2>
                    <p className="text-lg text-muted-foreground font-medium">
                      {currentCard.englishText}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Action Bar */}
        <div className="pt-2">
          <Button 
            onClick={handleNext}
            className="w-full h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200"
          >
            <span>Siguiente</span>
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </Layout>
  );
}
