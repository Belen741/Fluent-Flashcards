import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Check, BookOpen, Mic, MessageCircle, Heart, Shield, Zap, Users } from "lucide-react";

const topics = [
  { num: 1, name: "Patient Admission" },
  { num: 2, name: "Symptoms and Pain" },
  { num: 3, name: "Vital Signs" },
  { num: 4, name: "Medications" },
  { num: 5, name: "Basic Instructions" },
  { num: 6, name: "Common Procedures" },
  { num: 7, name: "Hygiene and Personal Care" },
  { num: 8, name: "Mobility and Fall Prevention" },
  { num: 9, name: "Nutrition and Fasting" },
  { num: 10, name: "Emergencies" },
  { num: 11, name: "Empathetic Communication" },
  { num: 12, name: "Preoperative Instructions" },
  { num: 13, name: "Postoperative Care" },
  { num: 14, name: "Discharge" },
  { num: 15, name: "Family Members and Caregivers" },
];

const benefits = [
  { icon: Heart, text: "Learn phrases used in real hospitals" },
  { icon: Shield, text: "Designed specifically for nurses" },
  { icon: MessageCircle, text: "Improve communication with patients" },
  { icon: Zap, text: "Build confidence quickly" },
];

const steps = [
  {
    icon: BookOpen,
    step: "1",
    title: "Study flashcards",
    desc: "Learn medical Spanish phrases through short, focused sessions designed for busy nurses.",
  },
  {
    icon: Mic,
    step: "2",
    title: "Practice real phrases",
    desc: "Reinforce what you learn with multiple-choice and fill-in exercises based on real hospital situations.",
  },
  {
    icon: MessageCircle,
    step: "3",
    title: "Speak with patients confidently",
    desc: "Apply your new vocabulary directly with Spanish-speaking patients and improve care quality.",
  },
];

function NurseIcon() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="40" fill="#EEF2FF" />
      <circle cx="40" cy="28" r="10" fill="#6366F1" opacity="0.2" />
      <circle cx="40" cy="26" r="9" fill="#1E40FF" opacity="0.15" />
      <path d="M22 62C22 51 30 44 40 44C50 44 58 51 58 62" stroke="#1E40FF" strokeWidth="3" strokeLinecap="round" />
      <circle cx="40" cy="26" r="8" fill="#1E40FF" opacity="0.1" />
      <rect x="35" y="48" width="10" height="3" rx="1.5" fill="#1E40FF" opacity="0.3" />
      <rect x="37.5" y="45.5" width="5" height="8" rx="1.5" fill="#1E40FF" opacity="0.25" />
      <path d="M36 22v8M32 26h8" stroke="#1E40FF" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function CTAButton({ label = "Start Free", size = "lg" }: { label?: string; size?: "lg" | "sm" | "default" }) {
  return (
    <Link href="/modules">
      <Button
        size={size}
        className="bg-gradient-to-r from-[#1E40FF] to-[#3B82F6] text-white border-0 rounded-xl px-8 py-3 text-lg font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all"
        data-testid="button-start-free"
      >
        {label}
      </Button>
    </Link>
  );
}

export default function Start() {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100 px-6 py-3 flex items-center justify-between">
        <span className="font-display font-bold text-lg text-[#1E40FF]">Spanish for Nurses</span>
        <Link href="/modules">
          <Button size="sm" className="bg-[#1E40FF] text-white rounded-xl border-0 hover:bg-[#1a35d4]" data-testid="button-nav-start">
            Start Free
          </Button>
        </Link>
      </nav>

      {/* HERO */}
      <section className="bg-gradient-to-b from-[#EEF2FF] to-white px-6 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-center mb-6">
            <NurseIcon />
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-gray-900 leading-tight mb-4">
            Learn medical Spanish phrases for{" "}
            <span className="text-[#1E40FF]">real-life situations</span>{" "}
            in the hospital.
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-xl mx-auto">
            Flashcards designed specifically for nurses working with Spanish-speaking patients.
          </p>
          <CTAButton />
          <p className="text-sm text-gray-400 mt-3">
            Start with 1 FREE module · Then continue for only $19/month
          </p>
          <p className="text-xs text-gray-400 mt-1">No credit card required. No commitment. Cancel anytime.</p>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="px-6 py-16 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-lg text-gray-600 leading-relaxed">
            Many nurses struggle to communicate with Spanish-speaking patients.
          </p>
          <p className="text-lg text-[#1E40FF] font-semibold mt-4">
            Spanish for Nurses helps you learn exactly what to say in real hospital situations.
          </p>
        </div>
      </section>

      {/* TOPICS */}
      <section className="px-6 py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-gray-900 text-center mb-3">
            What you will learn
          </h2>
          <p className="text-center text-gray-500 text-lg mb-10">
            Everything you need to communicate in real hospital situations
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {topics.map((t) => (
              <div
                key={t.num}
                className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100"
                data-testid={`card-topic-${t.num}`}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#EEF2FF] flex items-center justify-center">
                  <Check className="w-4 h-4 text-[#1E40FF]" />
                </div>
                <span className="text-gray-800 font-medium text-sm">{t.num}. {t.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-6 py-16 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-gray-900 text-center mb-12">
            How it works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.step} className="text-center" data-testid={`card-step-${s.step}`}>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#EEF2FF] flex items-center justify-center">
                    <s.icon className="w-8 h-8 text-[#1E40FF]" />
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-[#1E40FF] text-white text-sm font-bold flex items-center justify-center mx-auto mb-3">
                  {s.step}
                </div>
                <h3 className="font-display font-bold text-gray-900 text-lg mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCT PREVIEW */}
      <section className="px-6 py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-gray-900 text-center mb-3">
            See how it works
          </h2>
          <p className="text-center text-gray-500 text-lg mb-12">
            Get a preview of the flashcards and exercises used in real hospital situations.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

            {/* Card 1: Flashcard */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow" data-testid="preview-flashcard">
              <div className="w-12 h-12 rounded-xl bg-[#EEF2FF] flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-[#1E40FF]" />
              </div>
              <h3 className="font-display font-bold text-gray-900 mb-1">Flashcards for real situations</h3>
              <p className="text-gray-500 text-sm mb-5 leading-relaxed">Learn exactly what to say with Spanish-speaking patients using clear, practical phrases.</p>
              <div className="w-full bg-gradient-to-b from-[#F0F4FF] to-white rounded-xl border border-blue-100 p-4 shadow-inner">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-3 font-semibold">Flashcard</p>
                <p className="text-2xl font-bold text-[#1E40FF] mb-3">¿Dónde le duele?</p>
                <div className="border-t border-blue-100 pt-3">
                  <p className="text-gray-600 font-medium text-sm">Where does it hurt?</p>
                </div>
              </div>
            </div>

            {/* Card 2: MCQ */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow" data-testid="preview-mcq">
              <div className="w-12 h-12 rounded-xl bg-[#EEF2FF] flex items-center justify-center mb-4">
                <Check className="w-6 h-6 text-[#1E40FF]" />
              </div>
              <h3 className="font-display font-bold text-gray-900 mb-1">Practice with real scenarios</h3>
              <p className="text-gray-500 text-sm mb-5 leading-relaxed">Reinforce your learning with simple exercises based on real hospital situations.</p>
              <div className="w-full bg-gradient-to-b from-[#F0F4FF] to-white rounded-xl border border-blue-100 p-4 shadow-inner text-left">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-3 font-semibold text-center">Multiple Choice</p>
                <p className="text-sm font-semibold text-gray-800 mb-3 text-center">"¿Tiene dolor?" means:</p>
                <div className="space-y-2">
                  <div className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-500">A) Are you tired?</div>
                  <div className="rounded-lg border border-[#1E40FF] bg-[#EEF2FF] px-3 py-2 text-sm text-[#1E40FF] font-semibold flex items-center gap-2">
                    <Check className="w-4 h-4 flex-shrink-0" />
                    B) Do you have pain?
                  </div>
                  <div className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-500">C) Are you hungry?</div>
                </div>
              </div>
            </div>

            {/* Card 3: Conversation */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow" data-testid="preview-chat">
              <div className="w-12 h-12 rounded-xl bg-[#EEF2FF] flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-[#1E40FF]" />
              </div>
              <h3 className="font-display font-bold text-gray-900 mb-1">Use it with real patients</h3>
              <p className="text-gray-500 text-sm mb-5 leading-relaxed">Apply what you learn immediately during your shifts.</p>
              <div className="w-full bg-gradient-to-b from-[#F0F4FF] to-white rounded-xl border border-blue-100 p-4 shadow-inner space-y-3">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1 font-semibold text-center">Real conversation</p>
                <div className="flex items-end gap-2">
                  <div className="bg-[#1E40FF] text-white rounded-2xl rounded-bl-sm px-4 py-2 text-sm font-medium text-left max-w-[80%] shadow-sm">
                    ¿Tiene dolor?
                    <p className="text-blue-200 text-xs mt-0.5">Nurse</p>
                  </div>
                </div>
                <div className="flex items-end gap-2 justify-end">
                  <div className="bg-white text-gray-800 rounded-2xl rounded-br-sm px-4 py-2 text-sm font-medium text-left max-w-[80%] shadow-sm border border-gray-200">
                    Sí, en el pecho.
                    <p className="text-gray-400 text-xs mt-0.5">Patient</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FREE MODULE CTA */}
      <section className="px-6 py-16 bg-gradient-to-r from-[#1E40FF] to-[#3B82F6] text-white text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-display font-bold mb-3">
            Try the first module for free
          </h2>
          <p className="text-blue-100 text-lg mb-6">
            No credit card required. Start learning today.
          </p>
          <Link href="/modules">
            <Button
              size="lg"
              className="bg-white text-[#1E40FF] font-bold rounded-xl px-8 hover:bg-blue-50 border-0 shadow-md text-lg"
              data-testid="button-free-module"
            >
              Start Free
            </Button>
          </Link>
          <p className="text-blue-200 text-sm mt-3">
            Start with 1 FREE module · Then continue for only $19/month
          </p>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="px-6 py-16 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-gray-900 text-center mb-10">
            Why nurses love it
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {benefits.map((b, i) => (
              <div key={i} className="flex items-start gap-4 p-5 rounded-2xl border border-gray-100 shadow-sm bg-gray-50" data-testid={`card-benefit-${i}`}>
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#EEF2FF] flex items-center justify-center">
                  <b.icon className="w-5 h-5 text-[#1E40FF]" />
                </div>
                <p className="text-gray-800 font-semibold leading-snug">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-6 py-20 bg-gray-50 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-gray-900 mb-3">
            Ready to start?
          </h2>
          <p className="text-gray-500 text-lg mb-6">
            Join nurses who are already communicating better with their patients.
          </p>
          <CTAButton />
          <p className="text-sm text-gray-400 mt-3">
            Start with 1 FREE module · Then continue for only $19/month
          </p>
          <p className="text-xs text-gray-400 mt-1">No commitment. Cancel anytime.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 py-8 border-t border-gray-100 text-center">
        <p className="text-gray-400 text-sm">
          © 2026 Spanish for Nurses ·{" "}
          <a href="mailto:hablandoconbelen@gmail.com" className="text-[#1E40FF] hover:underline">
            hablandoconbelen@gmail.com
          </a>
        </p>
      </footer>

    </div>
  );
}
