import { useQuery } from "@tanstack/react-query";

import { apiGet } from "@/shared/lib/api/client";

import type { Category } from "@/features/articles/api";

export interface GalleryMedia {
  url: string;
  width: number | null;
  height: number | null;
  alt: string | null;
}

export interface GalleryItem {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: { name: string; slug: string } | null;
  media: GalleryMedia;
  tool: string | null;
  shotAt: string | null;
  allowDownload: boolean;
}

export function useGallery(category?: string) {
  return useQuery({
    queryKey: ["gallery", category ?? "all"],
    queryFn: async () => {
      const qs = category ? `?category=${encodeURIComponent(category)}` : "";
      return (await apiGet<GalleryItem[]>(`/gallery${qs}`)).data;
    },
  });
}

export function useGalleryCategories() {
  return useQuery({
    queryKey: ["categories", "gallery"],
    queryFn: async () => (await apiGet<Category[]>("/categories?module=gallery")).data,
  });
}
