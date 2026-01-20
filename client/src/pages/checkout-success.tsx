import { useEffect } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, PartyPopper } from "lucide-react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import confetti from "canvas-confetti";
import { queryClient } from "@/lib/queryClient";

export default function CheckoutSuccess() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["/api/subscription"] });
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8 text-center max-w-md space-y-4">
            <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto">
              <PartyPopper className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            
            <h1 className="text-2xl font-bold" data-testid="text-success-title">
              Welcome to Premium!
            </h1>
            
            <p className="text-muted-foreground" data-testid="text-success-desc">
              Thank you for subscribing! You now have full access to all 15 medical Spanish modules.
            </p>

            <ul className="text-left space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>All vocabulary modules unlocked</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Your progress is saved</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Manage subscription anytime</span>
              </li>
            </ul>

            <Button
              className="w-full"
              onClick={() => setLocation("/modules")}
              data-testid="button-continue-learning"
            >
              Continue Learning
            </Button>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
