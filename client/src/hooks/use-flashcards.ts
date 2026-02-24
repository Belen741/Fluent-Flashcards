import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { getApiUrl } from "@/lib/apiConfig";

export function useFlashcards() {
  return useQuery({
    queryKey: [api.flashcards.list.path],
    queryFn: async () => {
      const res = await fetch(getApiUrl(api.flashcards.list.path), {
        credentials: 'include',
      });
      if (!res.ok) throw new Error("Failed to fetch flashcards");
      return api.flashcards.list.responses[200].parse(await res.json());
    },
    staleTime: 5 * 60 * 1000,
  });
}
