import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiGet, apiSend } from "@/shared/lib/api/client";

export interface AdminLinkItem {
  id: string;
  platform: string;
  slug: string;
  description: string;
  url: string;
  iconName: string | null;
  isPrimary: boolean;
  isActive: boolean;
  sortOrder: number;
  updatedAt: string;
}

export interface LinkInput {
  platform: string;
  slug?: string;
  description: string;
  url: string;
  iconName?: string | null;
  isPrimary?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}

function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ["admin", "links"] });
  void queryClient.invalidateQueries({ queryKey: ["links"] });
}

export function useAdminLinks() {
  return useQuery({
    queryKey: ["admin", "links"],
    queryFn: async () => (await apiGet<AdminLinkItem[]>("/admin/links", { auth: true })).data,
  });
}

export function useSaveLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id?: string; input: LinkInput }) => {
      const res = id
        ? await apiSend<AdminLinkItem>(`/admin/links/${id}`, "PATCH", input, { auth: true })
        : await apiSend<AdminLinkItem>("/admin/links", "POST", input, { auth: true });
      return res.data;
    },
    onSuccess: () => invalidate(queryClient),
  });
}

export function useDeleteLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiSend(`/admin/links/${id}`, "DELETE", undefined, { auth: true });
    },
    onSuccess: () => invalidate(queryClient),
  });
}
