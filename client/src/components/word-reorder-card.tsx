import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Volume2, RotateCcw, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Flashcard } from "@shared/schema";
import { getAudioUrl } from "@/utils/mediaResolver";
import { playCorrectSound, playIncorrectSound } from "@/utils/audioFeedback";

interface WordReorderCardProps {
  card: Flashcard;
  onAnswer: (correct: boolean) => void;
}

function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function tokenizeSpanish(text: string): string[] {
  const punctuation = /[¿?¡!.,;:]/g;
  const cleanText = text.replace(punctuation, "");
  return cleanText.split(/\s+/).filter(word => word.length > 0);
}

export function WordReorderCard({ card, onAnswer }: WordReorderCardProps) {
  const correctTokens = tokenizeSpanish(card.text);
  const [availableTokens, setAvailableTokens] = useState<string[]>(() => 
    shuffleArray(correctTokens)
  );
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const playAudio = () => {
    const audioUrl = getAudioUrl(card);
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(console.error);
    }
  };

  const handleTokenSelect = (token: string, index: number) => {
    if (showResult) return;
    
    const newAvailable = [...availableTokens];
    newAvailable.splice(index, 1);
    setAvailableTokens(newAvailable);
    setSelectedTokens([...selectedTokens, token]);
  };

  const handleTokenRemove = (token: string, index: number) => {
    if (showResult) return;
    
    const newSelected = [...selectedTokens];
    newSelected.splice(index, 1);
    setSelectedTokens(newSelected);
    setAvailableTokens([...availableTokens, token]);
  };

  const handleReset = () => {
    if (showResult) return;
    setAvailableTokens(shuffleArray(correctTokens));
    setSelectedTokens([]);
  };

  const handleSubmit = () => {
    if (showResult || selectedTokens.length !== correctTokens.length) return;
    
    const userAnswer = selectedTokens.join("");
    const correctAnswer = correctTokens.join("");
    const correct = userAnswer === correctAnswer;
    
    setIsCorrect(correct);
    setShowResult(true);
    
    if (correct) {
      playCorrectSound();
    } else {
      playIncorrectSound();
    }
    
    setTimeout(() => {
      onAnswer(correct);
    }, 1500);
  };

  useEffect(() => {
    if (selectedTokens.length === correctTokens.length && !showResult) {
      handleSubmit();
    }
  }, [selectedTokens, correctTokens.length, showResult]);

  return (
    <Card className="h-full flex flex-col overflow-hidden" data-testid="word-reorder-card">
      <div className="flex flex-col items-center pt-6 pb-4 px-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-1 bg-secondary/50 text-xs font-medium rounded-full text-muted-foreground">
            {card.category}
          </span>
        </div>
        
        <p className="text-center text-base font-medium mb-3" data-testid="text-english-prompt">
          {card.englishText}
        </p>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => { e.stopPropagation(); playAudio(); }}
          data-testid="button-audio-reorder"
          className="rounded-full h-12 w-12"
        >
          <Volume2 className="h-6 w-6" />
        </Button>
        
        <p className="text-center text-sm text-muted-foreground mt-2" data-testid="text-reorder-prompt">
          Tap the words in the correct order
        </p>
      </div>

      <div className="flex-1 flex flex-col p-4 gap-4">
        <div 
          className="min-h-[80px] p-3 rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-wrap gap-1.5 items-start content-start"
          data-testid="selected-tokens-area"
        >
          <AnimatePresence mode="popLayout">
            {selectedTokens.map((token, index) => (
              <motion.div
                key={`selected-${index}-${token}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
              >
                <Button
                  variant={showResult ? (isCorrect ? "default" : "destructive") : "secondary"}
                  size="sm"
                  onClick={() => handleTokenRemove(token, index)}
                  disabled={showResult}
                  className="h-auto py-1.5 px-2.5 text-sm"
                  data-testid={`button-selected-${index}`}
                >
                  {token}
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
          {selectedTokens.length === 0 && (
            <span className="text-muted-foreground/50 text-sm">
              Your answer will appear here...
            </span>
          )}
        </div>

        <div 
          className="flex flex-wrap gap-1.5 justify-center"
          data-testid="available-tokens-area"
        >
          <AnimatePresence mode="popLayout">
            {availableTokens.map((token, index) => (
              <motion.div
                key={`available-${index}-${token}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTokenSelect(token, index)}
                  disabled={showResult}
                  className="h-auto py-1.5 px-2.5 text-sm"
                  data-testid={`button-available-${index}`}
                >
                  {token}
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {!showResult && selectedTokens.length > 0 && (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-muted-foreground"
              data-testid="button-reset"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </div>
        )}

        {showResult && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-2"
          >
            <div className={`flex items-center gap-2 ${isCorrect ? "text-green-600" : "text-red-500"}`}>
              {isCorrect ? (
                <>
                  <Check className="h-5 w-5" />
                  <span className="font-medium">Correct!</span>
                </>
              ) : (
                <>
                  <X className="h-5 w-5" />
                  <span className="font-medium">Not quite</span>
                </>
              )}
            </div>
            {!isCorrect && (
              <p className="text-center text-sm text-muted-foreground" data-testid="text-correct-answer">
                Correct: {card.text}
              </p>
            )}
          </motion.div>
        )}
      </div>
    </Card>
  );
}
