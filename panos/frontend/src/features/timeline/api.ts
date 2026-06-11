import { useQuery } from "@tanstack/react-query";

import { apiGet } from "@/shared/lib/api/client";

export type TimelineType = "research" | "project" | "writing" | "content" | "life";

export interface TimelineEvent {
  id: string;
  date: string;
  type: TimelineType;
  title: string;
  description: string | null;
  url: string | null;
  isFeatured: boolean;
}

export function useTimeline(type?: TimelineType) {
  return useQuery({
    queryKey: ["timeline", type ?? "all"],
    queryFn: async () => {
      const qs = type ? `?type=${type}` : "";
      return (await apiGet<TimelineEvent[]>(`/timeline${qs}`)).data;
    },
  });
}
