import { Link } from "wouter";
import { useFlashcards } from "@/hooks/use-flashcards";
import { Loader2, CheckCircle, ArrowRight } from "lucide-react";
import { getSessionsCompletedToday } from "@/utils/sessionQueue";

function MedicalChatIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="8" width="36" height="28" rx="6" fill="#1E40FF" fillOpacity="0.15"/>
      <rect x="24" y="28" width="36" height="28" rx="6" fill="#1E40FF"/>
      <path d="M42 38v12M36 44h12" stroke="white" strokeWidth="3" strokeLinecap="round"/>
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
          Short sessions. Real hospital Spanish.
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
          <button className="home-cta" data-testid="button-start">
            {sessionsCompleted > 0 ? 'Start next clinical session' : 'Start clinical session'}
            <ArrowRight size={22} />
          </button>
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
