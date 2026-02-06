import { Switch, Route } from "wouter";
import { queryClient, setAuthTokenGetter } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider, SignIn, SignUp, useAuth } from "@clerk/clerk-react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import Home from "@/pages/home";
import Study from "@/pages/study";
import Complete from "@/pages/complete";
import Modules from "@/pages/modules";
import CheckoutSuccess from "@/pages/checkout-success";
import CheckoutCancel from "@/pages/checkout-cancel";
import NotFound from "@/pages/not-found";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/study" component={Study} />
      <Route path="/complete" component={Complete} />
      <Route path="/modules" component={Modules} />
      <Route path="/checkout/success" component={CheckoutSuccess} />
      <Route path="/checkout/cancel" component={CheckoutCancel} />
      <Route path="/sign-in/:rest*">
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
          <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" afterSignInUrl="/modules" />
        </div>
      </Route>
      <Route path="/sign-in">
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
          <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" afterSignInUrl="/modules" />
        </div>
      </Route>
      <Route path="/sign-up/:rest*">
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
          <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" afterSignUpUrl="/modules" />
        </div>
      </Route>
      <Route path="/sign-up">
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
          <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" afterSignUpUrl="/modules" />
        </div>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function AuthTokenProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();

  useEffect(() => {
    setAuthTokenGetter(getToken);
  }, [getToken]);

  return <>{children}</>;
}

function App() {
  if (!clerkPubKey) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <AuthTokenProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </QueryClientProvider>
      </AuthTokenProvider>
    </ClerkProvider>
  );
}

export default App;
