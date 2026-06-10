import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiGet, apiSend, uploadFile } from "@/shared/lib/api/client";

export interface AdminGalleryListItem {
  id: string;
  slug: string;
  title: string;
  status: "draft" | "published" | "archived";
  visibility: string;
  mediaUrl: string | null;
  sortOrder: number;
  updatedAt: string;
}

export interface GalleryCreateInput {
  title: string;
  description?: string | null;
  categoryId?: string | null;
  mediaAssetId: string;
  tool?: string | null;
}

export interface GalleryUpdateInput {
  title?: string;
  description?: string | null;
  categoryId?: string | null;
  status?: "draft" | "published" | "archived";
  visibility?: string;
  sortOrder?: number;
}

function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ["admin", "gallery"] });
  void queryClient.invalidateQueries({ queryKey: ["gallery"] });
}

export function useAdminGallery() {
  return useQuery({
    queryKey: ["admin", "gallery"],
    queryFn: async () =>
      (await apiGet<AdminGalleryListItem[]>("/admin/gallery", { auth: true })).data,
  });
}

export function useCreateGalleryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, input }: { file: File; input: Omit<GalleryCreateInput, "mediaAssetId"> }) => {
      const uploaded = await uploadFile("/admin/media/upload", file);
      const res = await apiSend<AdminGalleryListItem>(
        "/admin/gallery",
        "POST",
        { ...input, mediaAssetId: uploaded.id },
        { auth: true },
      );
      return res.data;
    },
    onSuccess: () => invalidate(queryClient),
  });
}

export function useUpdateGalleryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: GalleryUpdateInput }) => {
      const res = await apiSend<AdminGalleryListItem>(`/admin/gallery/${id}`, "PATCH", input, {
        auth: true,
      });
      return res.data;
    },
    onSuccess: () => invalidate(queryClient),
  });
}

export function useDeleteGalleryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiSend(`/admin/gallery/${id}`, "DELETE", undefined, { auth: true });
    },
    onSuccess: () => invalidate(queryClient),
  });
}
