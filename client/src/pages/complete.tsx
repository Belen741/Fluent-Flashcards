import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Home, RotateCcw, PartyPopper } from "lucide-react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useEffect } from "react";

export default function Complete() {
  useEffect(() => {
    // Fire confetti on mount
    const duration = 2.5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 25, spread: 360, ticks: 50, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: ReturnType<typeof setInterval> = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 40 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8 text-center">
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          className="w-20 h-20 bg-secondary text-foreground rounded-full flex items-center justify-center"
        >
          <CheckCircle2 className="w-10 h-10" />
        </motion.div>

        {/* Message */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl font-bold text-foreground" data-testid="text-session-complete">
              Session complete
            </h1>
            <PartyPopper className="w-6 h-6 text-foreground" />
          </div>
          <p className="text-base text-muted-foreground max-w-[280px] mx-auto" data-testid="text-success-message">
            Great job! Keep it up.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full space-y-3 pt-6"
        >
          <Link href="/" data-testid="link-home">
            <Button 
              size="lg" 
              data-testid="button-home"
              className="w-full font-semibold"
            >
              <Home className="mr-2 h-5 w-5" />
              Back to home
            </Button>
          </Link>
          
          <Link href="/study" data-testid="link-repeat">
            <Button 
              variant="outline"
              size="lg" 
              data-testid="button-repeat"
              className="w-full font-medium"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Repeat session
            </Button>
          </Link>
        </motion.div>
      </div>
    </Layout>
  );
}
