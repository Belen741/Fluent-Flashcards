import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./use-auth";

interface SubscriptionData {
  subscription: any;
  status: string | null;
}

async function fetchSubscription(): Promise<SubscriptionData | null> {
  const response = await fetch("/api/subscription", {
    credentials: "include",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export function useSubscription() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data, isLoading: subLoading, refetch } = useQuery<SubscriptionData | null>({
    queryKey: ["/api/subscription"],
    queryFn: fetchSubscription,
    enabled: isAuthenticated,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const isLoading = authLoading || (isAuthenticated && subLoading);
  const hasActiveSubscription = data?.status === "active" || data?.status === "trialing";

  return {
    subscription: data?.subscription,
    subscriptionStatus: data?.status,
    hasActiveSubscription,
    isLoading,
    refetch,
  };
}

export const PREMIUM_PRICE_ID = "price_1SroNeRjP93FY9NBao2zl3w6";
