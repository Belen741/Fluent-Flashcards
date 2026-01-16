import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useFlashcards } from "@/hooks/use-flashcards";
import { Loader2, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const { data: flashcards, isLoading } = useFlashcards();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const count = flashcards?.length || 0;

  return (
    <Layout>
      <div className="space-y-8 text-center">
        <div className="space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4 shadow-sm">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            Spanish for Nurses
          </h1>
          <p className="text-xl text-muted-foreground font-medium">
            Learn essential medical vocabulary
          </p>
        </div>

        <Card className="border-border/50 shadow-sm">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold text-foreground mb-1">
              Sesión de hoy
            </h2>
            <p className="text-3xl font-bold text-primary">
              {count} tarjetas
            </p>
          </CardContent>
        </Card>

        <div className="pt-4">
          <Link href="/study">
            <Button 
              size="lg" 
              className="w-full h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 transform hover:-translate-y-1"
            >
              Empezar sesión de hoy
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
