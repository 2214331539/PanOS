import { useQuery } from "@tanstack/react-query";

import { apiGet } from "@/shared/lib/api/client";

interface Cover {
  url: string;
  alt: string | null;
}

interface CategoryRef {
  name: string;
  slug: string;
}

export interface ArticleCard {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover: Cover | null;
  category: CategoryRef | null;
  readingMinutes: number | null;
  publishedAt: string | null;
}

interface ArticleNav {
  slug: string;
  title: string;
}

export interface ArticleDetail extends ArticleCard {
  bodyMdx: string;
  viewCount: number;
  previous: ArticleNav | null;
  next: ArticleNav | null;
}

export function useArticles(category?: string) {
  return useQuery({
    queryKey: ["articles", category ?? "all"],
    queryFn: async () => {
      const qs = category ? `?category=${encodeURIComponent(category)}` : "";
      return (await apiGet<ArticleCard[]>(`/articles${qs}`)).data;
    },
  });
}

export function useArticle(slug: string) {
  return useQuery({
    queryKey: ["article", slug],
    queryFn: async () => (await apiGet<ArticleDetail>(`/articles/${slug}`)).data,
    enabled: Boolean(slug),
  });
}
