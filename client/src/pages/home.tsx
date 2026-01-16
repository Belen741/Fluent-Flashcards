import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useFlashcards } from "@/hooks/use-flashcards";
import { Loader2, BookOpen, ArrowRight, Clock, CheckCircle2 } from "lucide-react";
import { buildSessionQueue, getSessionsCompletedToday } from "@/utils/sessionQueue";

export default function Home() {
  const { data: flashcards, isLoading } = useFlashcards();
  const sessionsCompleted = getSessionsCompletedToday();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  // Calculate session size (intro variants only)
  const sessionCount = flashcards ? buildSessionQueue(flashcards).queue.length : 0;

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-10">
        {/* Logo and Title */}
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-md bg-secondary text-foreground mb-2">
            <BookOpen className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground" data-testid="text-title">
            Spanish for Nurses
          </h1>
        </div>

        {/* Session Info */}
        <div className="space-y-3">
          {sessionsCompleted > 0 && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2" data-testid="text-sessions-completed">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm">{sessionsCompleted} session{sessionsCompleted !== 1 ? 's' : ''} completed today</span>
            </div>
          )}
          <p className="text-xl text-foreground font-semibold" data-testid="text-session-count">
            {sessionsCompleted > 0 ? 'Next session' : "Today's session"}: {sessionCount} cards
          </p>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="text-sm" data-testid="text-time-estimate">Complete in about 5 minutes.</span>
          </div>
        </div>

        {/* CTA Section */}
        <div className="w-full space-y-4 pt-4">
          <Link href="/study" data-testid="link-start">
            <Button 
              size="lg" 
              data-testid="button-start"
              className="w-full font-bold"
            >
              <span>{sessionsCompleted > 0 ? 'Start next session' : "Start today's session"}</span>
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground" data-testid="text-motivation">
            No pressure. Just consistency.
          </p>
        </div>
      </div>
    </Layout>
  );
}
