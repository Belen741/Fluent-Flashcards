import { useState } from "react";
import { Layout } from "@/components/layout";
import { useFlashcards } from "@/hooks/use-flashcards";
import { modules } from "@/data/modules";
import { getAllModulesProgress, getOverallProgress, setActiveModule } from "@/utils/moduleProgress";
import { resetAllProgress } from "@/utils/userProgress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, Lock, Check, ChevronRight, Trophy, RotateCcw, Crown, LogIn } from "lucide-react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useAuth } from "@clerk/clerk-react";
import { useSubscription, PREMIUM_PRICE_ID } from "@/hooks/use-subscription";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Modules() {
  const { data: flashcards, isLoading } = useFlashcards();
  const [, setLocation] = useLocation();
  const { isSignedIn, isLoaded } = useAuth();
  const isAuthenticated = isSignedIn ?? false;
  const authLoading = !isLoaded;
  const { hasActiveSubscription, isLoading: subLoading } = useSubscription();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/checkout", { priceId: PREMIUM_PRICE_ID });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
  });

  if (isLoading || !flashcards || authLoading || subLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  const allProgress = getAllModulesProgress(flashcards);
  const overall = getOverallProgress(flashcards);

  const canAccessModule = (moduleOrder: number): boolean => {
    if (moduleOrder === 1) return true;
    return isAuthenticated && hasActiveSubscription;
  };

  const handleModuleClick = (moduleId: string, moduleOrder: number, isUnlocked: boolean, hasContent: boolean) => {
    if (!hasContent) return;
    
    if (moduleOrder > 1 && !isAuthenticated) {
      setLocation("/sign-in");
      return;
    }

    if (moduleOrder > 1 && !hasActiveSubscription) {
      setShowUpgradeModal(true);
      return;
    }

    if (!isUnlocked) return;
    
    setActiveModule(moduleId);
    setLocation("/study");
  };

  const handleSubscribe = () => {
    if (!isAuthenticated) {
      setLocation("/sign-in");
      return;
    }
    checkoutMutation.mutate();
  };

  return (
    <Layout>
      <div className="space-y-6 pb-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground" data-testid="text-page-title">
            Learning Path
          </h1>
          <p className="text-sm text-muted-foreground" data-testid="text-page-subtitle">
            Master medical Spanish one module at a time
          </p>
        </div>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-sm font-medium" data-testid="text-overall-label">Overall Progress</span>
                <span className="text-sm text-muted-foreground" data-testid="text-overall-count">
                  {overall.completedModules}/{overall.totalModules} modules
                </span>
              </div>
              <Progress value={overall.percentage} className="h-2" data-testid="progress-overall" />
            </div>
          </div>
        </Card>

        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-1 bg-border rounded-full" />

          <div className="space-y-4 relative">
            {modules.map((module, index) => {
              const progress = allProgress.find(p => p.moduleId === module.id);
              const isUnlocked = progress?.isUnlocked ?? false;
              const isCompleted = progress?.isCompleted ?? false;
              const isActive = progress?.isActive ?? false;
              const hasContent = module.hasContent;

              const IconComponent = module.icon;

              return (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className={`
                      relative flex items-start gap-4 p-4 transition-all overflow-visible
                      ${isActive ? "border-2 border-primary shadow-sm" : ""}
                      ${isCompleted ? "bg-secondary/30" : ""}
                      ${!isUnlocked || !hasContent ? "opacity-60" : "cursor-pointer hover-elevate"}
                    `}
                    onClick={() => handleModuleClick(module.id, module.order, isUnlocked, hasContent)}
                    data-testid={`module-${module.id}`}
                  >
                    <div
                      className={`
                        relative z-10 h-16 w-16 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0
                        ${isCompleted ? "bg-primary" : ""}
                        ${isActive ? "bg-primary ring-4 ring-primary/20" : ""}
                        ${!isUnlocked || !hasContent ? "bg-muted" : ""}
                        ${isUnlocked && !isCompleted && !isActive ? "bg-card border-2 border-border" : ""}
                      `}
                      style={isUnlocked && hasContent && !isCompleted ? { borderColor: module.color } : {}}
                      data-testid={`icon-module-${module.id}`}
                    >
                      {isCompleted ? (
                        <Check className="h-8 w-8 text-primary-foreground" />
                      ) : !isUnlocked || !hasContent ? (
                        <Lock className="h-6 w-6 text-muted-foreground" />
                      ) : (
                        <IconComponent 
                          className="h-8 w-8" 
                          style={{ color: module.color }}
                        />
                      )}

                      <div 
                        className={`
                          absolute -top-1 -right-1 h-6 w-6 rounded-full text-xs font-bold
                          flex items-center justify-center
                          ${isCompleted ? "bg-green-500 text-white" : "bg-card border-2 border-border text-muted-foreground"}
                        `}
                        data-testid={`badge-order-${module.id}`}
                      >
                        {module.order}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 pt-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 
                          className={`font-semibold truncate ${!isUnlocked || !hasContent ? "text-muted-foreground" : "text-foreground"}`}
                          data-testid={`text-module-name-${module.id}`}
                        >
                          {module.name}
                        </h3>
                        {isActive && (
                          <span 
                            className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded-full"
                            data-testid={`badge-current-${module.id}`}
                          >
                            Current
                          </span>
                        )}
                        {!hasContent && (
                          <span 
                            className="px-2 py-0.5 bg-muted text-muted-foreground text-xs font-medium rounded-full"
                            data-testid={`badge-coming-soon-${module.id}`}
                          >
                            Coming soon
                          </span>
                        )}
                        {module.order > 1 && !hasActiveSubscription && hasContent && (
                          <span 
                            className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 text-xs font-medium rounded-full flex items-center gap-1"
                            data-testid={`badge-premium-${module.id}`}
                          >
                            <Crown className="h-3 w-3" />
                            Premium
                          </span>
                        )}
                      </div>

                      <p 
                        className="text-sm text-muted-foreground mt-0.5 truncate"
                        data-testid={`text-module-desc-${module.id}`}
                      >
                        {module.description}
                      </p>

                      {isUnlocked && hasContent && progress && progress.totalConcepts > 0 && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground mb-1">
                            <span data-testid={`text-mastered-${module.id}`}>
                              {progress.masteredConcepts}/{progress.totalConcepts} mastered
                            </span>
                            <span data-testid={`text-percentage-${module.id}`}>{progress.completionPercentage}%</span>
                          </div>
                          <Progress 
                            value={progress.completionPercentage} 
                            className="h-1.5"
                            data-testid={`progress-module-${module.id}`}
                          />
                        </div>
                      )}
                    </div>

                    {isUnlocked && hasContent && (
                      <ChevronRight className="h-5 w-5 text-muted-foreground mt-4 flex-shrink-0" data-testid={`icon-chevron-${module.id}`} />
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => setLocation("/")}
            data-testid="button-back-home"
          >
            Back to Home
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => {
              if (confirm("Are you sure you want to reset all progress? This cannot be undone.")) {
                resetAllProgress();
                window.location.reload();
              }
            }}
            data-testid="button-reset-progress"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Progress
          </Button>
        </div>
      </div>

      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" data-testid="modal-upgrade">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background border rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4"
          >
            <div className="text-center space-y-2">
              <div className="h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center mx-auto">
                <Crown className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-xl font-bold" data-testid="text-upgrade-title">
                Unlock All Modules
              </h2>
              <p className="text-muted-foreground" data-testid="text-upgrade-desc">
                Get full access to all 15 medical Spanish modules for just $5/month. Learn vocabulary for every nursing situation.
              </p>
            </div>

            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>All 15 phrases modules</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Spaced repetition learning</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Audio pronunciation</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Cancel anytime</span>
              </li>
            </ul>

            <div className="flex flex-col gap-2">
              <Button
                className="w-full"
                onClick={handleSubscribe}
                disabled={checkoutMutation.isPending}
                data-testid="button-subscribe"
              >
                {checkoutMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Crown className="h-4 w-4 mr-2" />
                )}
                Subscribe for $5/month
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowUpgradeModal(false)}
                data-testid="button-cancel-upgrade"
              >
                Maybe later
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </Layout>
  );
}
