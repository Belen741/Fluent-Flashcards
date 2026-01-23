import { useAuth as useClerkAuth, useUser } from "@clerk/clerk-react";
import type { User } from "@shared/models/auth";

export function useAuth() {
  const { isLoaded, isSignedIn, getToken, signOut } = useClerkAuth();
  const { user: clerkUser } = useUser();

  const user: User | null = clerkUser ? {
    id: clerkUser.id,
    email: clerkUser.emailAddresses[0]?.emailAddress || null,
    firstName: clerkUser.firstName || null,
    lastName: clerkUser.lastName || null,
    profileImageUrl: clerkUser.imageUrl || null,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    subscriptionStatus: null,
    createdAt: clerkUser.createdAt ? new Date(clerkUser.createdAt) : null,
    updatedAt: clerkUser.updatedAt ? new Date(clerkUser.updatedAt) : null,
  } : null;

  return {
    user,
    isLoading: !isLoaded,
    isAuthenticated: isSignedIn ?? false,
    logout: () => signOut(),
    isLoggingOut: false,
    getToken,
  };
}
