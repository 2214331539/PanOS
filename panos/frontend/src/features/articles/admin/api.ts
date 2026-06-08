import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiGet, apiSend } from "@/shared/lib/api/client";

export type ArticleStatus = "draft" | "published" | "archived";

export interface AdminArticleListItem {
  id: string;
  slug: string;
  title: string;
  status: ArticleStatus;
  visibility: string;
  categoryId: string | null;
  updatedAt: string;
  publishedAt: string | null;
}

export interface AdminArticleDetail {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  bodyMdx: string;
  categoryId: string | null;
  coverMediaId: string | null;
  status: ArticleStatus;
  visibility: string;
  isFeatured: boolean;
  readingMinutes: number | null;
  seoTitle: string | null;
  seoDescription: string | null;
  publishedAt: string | null;
}

export interface ArticleInput {
  title: string;
  slug?: string;
  excerpt: string;
  bodyMdx: string;
  categoryId?: string | null;
  status: ArticleStatus;
  visibility?: string;
  isFeatured?: boolean;
  coverMediaId?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
}

export function useAdminArticles() {
  return useQuery({
    queryKey: ["admin", "articles"],
    queryFn: async () => (await apiGet<AdminArticleListItem[]>("/admin/articles", { auth: true })).data,
  });
}

export function useAdminArticle(id: string | undefined) {
  return useQuery({
    queryKey: ["admin", "article", id],
    queryFn: async () => (await apiGet<AdminArticleDetail>(`/admin/articles/${id}`, { auth: true })).data,
    enabled: Boolean(id),
  });
}

export function useSaveArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id?: string; input: ArticleInput }) => {
      const res = id
        ? await apiSend<AdminArticleDetail>(`/admin/articles/${id}`, "PATCH", input, { auth: true })
        : await apiSend<AdminArticleDetail>("/admin/articles", "POST", input, { auth: true });
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "articles"] });
      void queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
  });
}
