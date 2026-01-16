import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Home, PartyPopper } from "lucide-react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useEffect } from "react";

export default function Complete() {
  useEffect(() => {
    // Fire confetti on mount
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: ReturnType<typeof setInterval> = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center space-y-8 text-center py-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4"
        >
          <CheckCircle2 className="w-12 h-12" />
        </motion.div>

        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-3xl font-extrabold text-foreground" data-testid="text-session-complete">
              Sesión completada
            </h1>
            <PartyPopper className="w-7 h-7 text-primary" />
          </div>
          <p className="text-lg text-muted-foreground max-w-[260px] mx-auto" data-testid="text-success-message">
            Has repasado todas las tarjetas de hoy.
          </p>
        </div>

        <div className="w-full pt-8">
          <Link href="/">
            <Button 
              variant="outline" 
              size="lg" 
              data-testid="button-volver"
              className="w-full h-14 text-lg font-bold border-2"
            >
              <Home className="mr-2 h-5 w-5" />
              Volver al inicio
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
