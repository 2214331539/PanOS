import { useQuery } from "@tanstack/react-query";

import { apiGet } from "@/shared/lib/api/client";

// 分类是跨模块概念（articles / projects / gallery 共用一张表，按 module 区分），
// 类型与查询 hook 放 shared，避免各 feature 互相 import。
export interface Category {
  id: string;
  module: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
}

export function useCategories(module: "articles" | "projects" | "gallery") {
  return useQuery({
    queryKey: ["categories", module],
    queryFn: async () => (await apiGet<Category[]>(`/categories?module=${module}`)).data,
  });
}
