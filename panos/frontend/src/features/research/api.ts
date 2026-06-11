import { useQuery } from "@tanstack/react-query";

import { apiGet } from "@/shared/lib/api/client";

export interface ResearchCard {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  progress: number | null;
  startedAt: string | null;
  publishedAt: string | null;
}

export interface ResearchDetail extends ResearchCard {
  bodyMdx: string;
}

export function useResearchList() {
  return useQuery({
    queryKey: ["research"],
    queryFn: async () => (await apiGet<ResearchCard[]>("/research")).data,
  });
}

export function useResearchNote(slug: string) {
  return useQuery({
    queryKey: ["research", slug],
    queryFn: async () => (await apiGet<ResearchDetail>(`/research/${slug}`)).data,
    enabled: Boolean(slug),
  });
}
