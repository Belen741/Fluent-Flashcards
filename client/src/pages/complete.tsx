import { Link, useLocation, useSearch } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Home, ArrowRight, PartyPopper, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useEffect, useState, useMemo } from "react";
import { getSessionsCompletedToday } from "@/utils/sessionQueue";

export default function Complete() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const [sessionsToday, setSessionsToday] = useState(0);

  const isModuleComplete = useMemo(() => {
    const params = new URLSearchParams(searchString);
    return params.get("moduleComplete") === "true";
  }, [searchString]);

  useEffect(() => {
    const count = getSessionsCompletedToday();
    setSessionsToday(count);
  }, []);

  const handleNextSession = () => {
    setLocation("/study?session=" + (sessionsToday + 1));
  };

  useEffect(() => {
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
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          className="w-20 h-20 bg-secondary text-foreground rounded-full flex items-center justify-center"
        >
          {isModuleComplete ? <Trophy className="w-10 h-10" /> : <CheckCircle2 className="w-10 h-10" />}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          {isModuleComplete ? (
            <>
              <div className="flex items-center justify-center gap-2">
                <h1 className="text-2xl font-bold text-foreground" data-testid="text-module-complete">
                  Module Complete!
                </h1>
                <PartyPopper className="w-6 h-6 text-foreground" />
              </div>
              <p className="text-base text-muted-foreground max-w-[280px] mx-auto" data-testid="text-success-message">
                You've mastered all the concepts in this module. Go back to choose your next module!
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center gap-2">
                <h1 className="text-2xl font-bold text-foreground" data-testid="text-session-complete">
                  Session {sessionsToday} complete
                </h1>
                <PartyPopper className="w-6 h-6 text-foreground" />
              </div>
              <p className="text-base text-muted-foreground max-w-[280px] mx-auto" data-testid="text-success-message">
                {sessionsToday === 1 
                  ? "Great job! Keep it up." 
                  : `Amazing! You've completed ${sessionsToday} sessions today.`}
              </p>
            </>
          )}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full space-y-3 pt-6"
        >
          {isModuleComplete ? (
            <Link href="/" data-testid="link-modules">
              <Button 
                size="lg" 
                data-testid="button-back-modules"
                className="w-full font-semibold"
              >
                <Home className="mr-2 h-5 w-5" />
                Back to Modules
              </Button>
            </Link>
          ) : (
            <>
              <Button 
                size="lg" 
                onClick={handleNextSession}
                data-testid="button-next-session"
                className="w-full font-semibold"
              >
                Continue to next session
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Link href="/" data-testid="link-home">
                <Button 
                  variant="outline"
                  size="lg" 
                  data-testid="button-home"
                  className="w-full font-medium"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Done for now
                </Button>
              </Link>
            </>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
