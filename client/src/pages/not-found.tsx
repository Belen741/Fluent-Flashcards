import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <Layout>
      <Card className="w-full mt-4 border-2 border-border/50">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2 text-destructive font-bold items-center">
            <AlertCircle className="h-8 w-8" />
            <h1 className="text-2xl">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            Did you forget to add the page to the router?
          </p>

          <div className="mt-8">
             <Link href="/" className="text-primary font-bold hover:underline">
               Return Home
             </Link>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}
