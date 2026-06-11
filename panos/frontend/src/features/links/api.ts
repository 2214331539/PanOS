import { useQuery } from "@tanstack/react-query";

import { apiGet } from "@/shared/lib/api/client";

export interface SocialLink {
  id: string;
  platform: string;
  slug: string;
  description: string;
  url: string;
  iconName: string | null;
  isPrimary: boolean;
}

export function useLinks() {
  return useQuery({
    queryKey: ["links"],
    queryFn: async () => (await apiGet<SocialLink[]>("/links")).data,
  });
}
