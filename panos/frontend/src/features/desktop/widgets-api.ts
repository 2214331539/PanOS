import { useQuery } from "@tanstack/react-query";

import { apiGet } from "@/shared/lib/api/client";

export interface DesktopWidget {
  id: string;
  type: string;
  title: string;
  payload: Record<string, unknown>;
}

export function useWidgets() {
  return useQuery({
    queryKey: ["widgets"],
    queryFn: async () => (await apiGet<DesktopWidget[]>("/widgets")).data,
    staleTime: 60_000,
  });
}

// GitHub 贡献热力图（社区只读 API；失败时该 Widget 整体隐藏）。
export interface GithubContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export function useGithubContributions(username: string | null) {
  return useQuery({
    queryKey: ["github-contributions", username],
    queryFn: async () => {
      const response = await fetch(
        `https://github-contributions-api.jogruber.de/v4/${username}?y=last`,
      );
      if (!response.ok) throw new Error("github contributions unavailable");
      const body = (await response.json()) as { contributions: GithubContributionDay[] };
      return body.contributions;
    },
    enabled: Boolean(username),
    staleTime: 60 * 60 * 1000,
    retry: 1,
  });
}
