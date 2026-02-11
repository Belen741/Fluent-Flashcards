import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { getApiUrl } from "@/lib/apiConfig";

interface SubscriptionData {
  subscription: any;
  status: string | null;
}

export function useSubscription() {
  const { isSignedIn, isLoaded, getToken } = useAuth();

  const { data, isLoading: subLoading, refetch } = useQuery<SubscriptionData | null>({
    queryKey: ["/api/subscription"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) return null;
      
      const response = await fetch(getApiUrl("/api/subscription"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.status === 401) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }

      return response.json();
    },
    enabled: isLoaded && isSignedIn,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const isLoading = !isLoaded || (isSignedIn && subLoading);
  const hasActiveSubscription = data?.status === "active" || data?.status === "trialing";

  return {
    subscription: data?.subscription,
    subscriptionStatus: data?.status,
    hasActiveSubscription,
    isLoading,
    refetch,
  };
}

export const PREMIUM_PRICE_ID = "price_1SzmFL9jgd4cptrqQYELUnb1";
