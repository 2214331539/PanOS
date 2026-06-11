import { useQuery } from "@tanstack/react-query";

import { apiGet } from "@/shared/lib/api/client";

export type IdeaStage = "seed" | "growing" | "draft" | "built";

export interface Idea {
  id: string;
  title: string;
  summary: string;
  bodyMdx: string | null;
  status: IdeaStage;
  source: string | null;
  isFeatured: boolean;
  createdAt: string;
}

export function useIdeas() {
  return useQuery({
    queryKey: ["ideas"],
    queryFn: async () => (await apiGet<Idea[]>("/ideas")).data,
  });
}
