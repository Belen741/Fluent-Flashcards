import { Link } from "wouter";
import { useFlashcards } from "@/hooks/use-flashcards";
import { Loader2, CheckCircle, ArrowRight, Map } from "lucide-react";
import { getSessionsCompletedToday } from "@/utils/sessionQueue";
import { Button } from "@/components/ui/button";

function MedicalChatIcon() {
  return (
    <svg width="72" height="64" viewBox="0 0 72 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 12C4 7.58172 7.58172 4 12 4H40C44.4183 4 48 7.58172 48 12V32C48 36.4183 44.4183 40 40 40H20L10 50V40H12C7.58172 40 4 36.4183 4 32V12Z" fill="white" stroke="#1E56E8" strokeWidth="3"/>
      <path d="M26 16V28M20 22H32" stroke="#1E56E8" strokeWidth="4" strokeLinecap="round"/>
      <path d="M52 24H56C60.4183 24 64 27.5817 64 32V48C64 52.4183 60.4183 56 56 56H54V62L46 56H36C31.5817 56 28 52.4183 28 48V44" fill="#1E56E8"/>
    </svg>
  );
}

export default function Home() {
  const { isLoading } = useFlashcards();
  const sessionsCompleted = getSessionsCompletedToday();

  if (isLoading) {
    return (
      <div className="home-page">
        <div className="home-glow" />
        <div className="home-card">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#1E40FF' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="home-glow" />
      <div className="home-card">
        <MedicalChatIcon />
        
        <h1 className="home-title" data-testid="text-title">
          Spanish for Nurses
        </h1>
        
        <p className="home-subtitle">
          Real Hospital Spanish Phrases
        </p>

        {sessionsCompleted > 0 && (
          <div className="home-progress" data-testid="text-sessions-completed">
            <CheckCircle size={18} color="#1E40FF" />
            <span>{sessionsCompleted} session{sessionsCompleted !== 1 ? 's' : ''} completed today</span>
          </div>
        )}

        <h2 className="home-ready" data-testid="text-session-header">
          {sessionsCompleted > 0 ? 'Ready for more?' : "Ready to practice?"}
        </h2>
        
        <p className="home-time" data-testid="text-time-estimate">
          Complete in about 2–3 minutes
        </p>

        <Link href="/study" data-testid="link-start">
          <Button size="lg" className="gap-2 bg-gradient-to-r from-[#1E40FF] to-[#3B82F6] text-white border-0" data-testid="button-start">
            {sessionsCompleted > 0 ? 'Start next clinical session' : 'Start clinical session'}
            <ArrowRight size={22} />
          </Button>
        </Link>

        <Link href="/modules" data-testid="link-modules">
          <Button variant="outline" className="mt-4 gap-2" data-testid="button-modules">
            <Map size={18} />
            View Learning Path
          </Button>
        </Link>

        <p className="home-motivation" data-testid="text-motivation">
          No pressure. Just consistency.
        </p>

        <p className="home-microcopy">
          Designed for nurses working with Spanish-speaking patients
        </p>
      </div>
    </div>
  );
}
