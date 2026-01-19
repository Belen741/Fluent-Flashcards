import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Volume2, Check, X } from "lucide-react";
import { motion } from "framer-motion";
import type { Flashcard } from "@shared/schema";
import { getAudioUrl, getImageUrl } from "@/utils/mediaResolver";

interface ReviewCardProps {
  card: Flashcard;
  onAnswer: (correct: boolean) => void;
}

export function ReviewCard({ card, onAnswer }: ReviewCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  
  const imageUrl = getImageUrl(card);
  const audioUrl = getAudioUrl(card);

  const playAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(console.error);
    }
  };

  const handleFlip = () => {
    if (!isFlipped) {
      setIsFlipped(true);
    }
  };

  const handleKnow = () => {
    onAnswer(true);
  };

  const handleDontKnow = () => {
    onAnswer(false);
  };

  return (
    <Card 
      className="h-full flex flex-col overflow-hidden cursor-pointer"
      onClick={handleFlip}
      data-testid="review-card"
    >
      <div className="relative flex-shrink-0">
        {imageUrl && (
          <div className="h-36 overflow-hidden">
            <img 
              src={imageUrl} 
              alt="" 
              className="w-full h-full object-cover"
              data-testid="img-review-card"
            />
          </div>
        )}
        <div className="absolute top-2 left-2 flex items-center gap-2">
          <span className="px-2.5 py-1 bg-background/90 backdrop-blur-sm text-xs font-medium rounded-full text-muted-foreground">
            {card.category}
          </span>
          <span className="px-2.5 py-1 bg-amber-500/90 backdrop-blur-sm text-xs font-medium rounded-full text-white">
            Review
          </span>
        </div>
        {audioUrl && (
          <Button
            variant="default"
            size="icon"
            onClick={(e) => { e.stopPropagation(); playAudio(); }}
            data-testid="button-audio-review"
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 rounded-full shadow-lg h-14 w-14"
          >
            <Volume2 className="h-7 w-7" />
          </Button>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.4 }}
          style={{ transformStyle: "preserve-3d" }}
          className="w-full"
        >
          {!isFlipped ? (
            <div>
              <p className="text-xl font-medium mb-4" data-testid="text-spanish-phrase">
                {card.text}
              </p>
              <p className="text-sm text-muted-foreground">
                Tap to reveal translation
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-xl font-medium mb-2" data-testid="text-spanish-phrase-back">
                {card.text}
              </p>
              <p className="text-lg text-muted-foreground mb-4" data-testid="text-english-translation">
                {card.englishText}
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {isFlipped && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 pt-0 flex gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="outline"
            className="flex-1 h-12 text-base border-red-300 text-red-600 hover:bg-red-50"
            onClick={handleDontKnow}
            data-testid="button-dont-know"
          >
            <X className="h-5 w-5 mr-2" />
            I didn't know
          </Button>
          <Button
            variant="default"
            className="flex-1 h-12 text-base bg-green-600 hover:bg-green-700"
            onClick={handleKnow}
            data-testid="button-know"
          >
            <Check className="h-5 w-5 mr-2" />
            I knew it
          </Button>
        </motion.div>
      )}
    </Card>
  );
}
