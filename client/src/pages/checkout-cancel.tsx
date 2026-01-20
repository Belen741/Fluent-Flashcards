import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";

export default function CheckoutCancel() {
  const [, setLocation] = useLocation();

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8 text-center max-w-md space-y-4">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto">
              <XCircle className="h-10 w-10 text-muted-foreground" />
            </div>
            
            <h1 className="text-2xl font-bold" data-testid="text-cancel-title">
              Payment Cancelled
            </h1>
            
            <p className="text-muted-foreground" data-testid="text-cancel-desc">
              No worries! You can always subscribe later when you're ready. In the meantime, enjoy the free Patient Admission module.
            </p>

            <div className="flex flex-col gap-2">
              <Button
                onClick={() => setLocation("/modules")}
                data-testid="button-back-modules"
              >
                Back to Modules
              </Button>
              <Button
                variant="ghost"
                onClick={() => setLocation("/")}
                data-testid="button-back-home"
              >
                Go Home
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
