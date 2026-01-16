import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Volume2, Check, X } from "lucide-react";
import { motion } from "framer-motion";
import type { Flashcard } from "@shared/schema";
import { getImageUrl, getAudioUrl } from "@/utils/mediaResolver";

interface QuickPickCardProps {
  card: Flashcard;
  onAnswer: (correct: boolean) => void;
}

export function QuickPickCard({ card, onAnswer }: QuickPickCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  
  const options = card.mcqOptionsEn || [];
  const correctAnswer = card.mcqCorrectEn || card.englishText;
  const questionEs = card.mcqQuestionEs || card.text;
  
  const shuffledOptions = useState(() => 
    [...options].sort(() => Math.random() - 0.5)
  )[0];

  const playAudio = () => {
    const audioUrl = getAudioUrl(card);
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(console.error);
    }
  };

  const handleSelect = (option: string) => {
    if (showResult) return;
    
    setSelectedAnswer(option);
    setShowResult(true);
    
    const isCorrect = option === correctAnswer;
    
    setTimeout(() => {
      onAnswer(isCorrect);
    }, 1200);
  };

  const getButtonVariant = (option: string) => {
    if (!showResult) return "outline";
    if (option === correctAnswer) return "default";
    if (option === selectedAnswer && option !== correctAnswer) return "destructive";
    return "outline";
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden" data-testid="quick-pick-card">
      <div className="h-[40%] w-full bg-secondary/30 relative flex items-center justify-center">
        <img 
          src={getImageUrl(card)} 
          alt={card.englishText}
          className="max-w-full max-h-full object-contain"
          data-testid={`img-quickpick-${card.id}`}
        />
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 bg-card/90 backdrop-blur-sm text-xs font-medium rounded-full text-muted-foreground">
            {card.category}
          </span>
        </div>
        <Button
          variant="default"
          size="icon"
          onClick={(e) => { e.stopPropagation(); playAudio(); }}
          data-testid="button-audio-quickpick"
          className="absolute -bottom-5 rounded-full shadow-md"
        >
          <Volume2 className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 flex flex-col p-4 pt-8">
        <div className="text-center mb-4">
          <p className="text-sm text-muted-foreground mb-2" data-testid="text-quickpick-prompt">
            What does this mean?
          </p>
          <h2 className="text-lg font-bold text-foreground" data-testid="text-spanish-question">
            {questionEs}
          </h2>
        </div>
        
        <div className="flex-1 flex flex-col justify-center gap-2">
          {shuffledOptions.map((option, index) => (
            <motion.div
              key={option}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                variant={getButtonVariant(option)}
                className="w-full justify-start text-left h-auto py-3 px-4 whitespace-normal"
                onClick={() => handleSelect(option)}
                disabled={showResult}
                data-testid={`button-option-${index}`}
              >
                <span className="flex-1">{option}</span>
                {showResult && option === correctAnswer && (
                  <Check className="h-4 w-4 ml-2 flex-shrink-0" />
                )}
                {showResult && option === selectedAnswer && option !== correctAnswer && (
                  <X className="h-4 w-4 ml-2 flex-shrink-0" />
                )}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </Card>
  );
}
