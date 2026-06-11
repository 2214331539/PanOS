import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { apiGet, apiSend } from "@/shared/lib/api/client";

export interface ViewSummary {
  total: number;
  today: number;
}

// 匿名浏览埋点：组件挂载时对站内路径记一次（后端按访客/天去重，失败静默）。
export function useRecordView(path: string | null) {
  useEffect(() => {
    if (!path) return;
    void apiSend("/views", "POST", { path }).catch(() => undefined);
  }, [path]);
}

export function useViewSummary() {
  return useQuery({
    queryKey: ["views", "summary"],
    queryFn: async () => (await apiGet<ViewSummary>("/views/summary")).data,
    staleTime: 30_000,
  });
}
