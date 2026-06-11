import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { apiGet } from "@/shared/lib/api/client";

export type SearchResultType = "article" | "project" | "gallery" | "link";

export interface SearchResult {
  type: SearchResultType;
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  url: string;
}

export function useDebouncedValue<T>(value: T, delayMs = 200): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

export function useContentSearch(query: string) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: async () =>
      (await apiGet<SearchResult[]>(`/search?q=${encodeURIComponent(query)}`)).data,
    enabled: query.length > 0,
    staleTime: 30_000,
    placeholderData: (previous) => previous,
  });
}
