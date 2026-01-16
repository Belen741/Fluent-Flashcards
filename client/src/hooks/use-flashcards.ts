import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useFlashcards() {
  return useQuery({
    queryKey: [api.flashcards.list.path],
    queryFn: async () => {
      const res = await fetch(api.flashcards.list.path);
      if (!res.ok) throw new Error("Failed to fetch flashcards");
      return api.flashcards.list.responses[200].parse(await res.json());
    },
  });
}
