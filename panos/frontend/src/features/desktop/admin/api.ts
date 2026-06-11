import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiGet, apiSend } from "@/shared/lib/api/client";

export interface AdminWidgetItem {
  id: string;
  type: string;
  title: string;
  payload: Record<string, unknown>;
  isEnabled: boolean;
  sortOrder: number;
  updatedAt: string;
}

export interface WidgetInput {
  type?: string;
  title?: string;
  payload?: Record<string, unknown>;
  isEnabled?: boolean;
  sortOrder?: number;
}

function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ["admin", "widgets"] });
  void queryClient.invalidateQueries({ queryKey: ["widgets"] });
}

export function useAdminWidgets() {
  return useQuery({
    queryKey: ["admin", "widgets"],
    queryFn: async () => (await apiGet<AdminWidgetItem[]>("/admin/widgets", { auth: true })).data,
  });
}

export function useSaveWidget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id?: string; input: WidgetInput }) => {
      const res = id
        ? await apiSend<AdminWidgetItem>(`/admin/widgets/${id}`, "PATCH", input, { auth: true })
        : await apiSend<AdminWidgetItem>("/admin/widgets", "POST", input, { auth: true });
      return res.data;
    },
    onSuccess: () => invalidate(queryClient),
  });
}

export function useDeleteWidget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiSend(`/admin/widgets/${id}`, "DELETE", undefined, { auth: true });
    },
    onSuccess: () => invalidate(queryClient),
  });
}
