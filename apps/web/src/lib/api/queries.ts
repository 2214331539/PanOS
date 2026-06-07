import { useQuery } from "@tanstack/react-query";

import { getDesktopBootstrap } from "./client";

export function useDesktopBootstrap() {
  return useQuery({
    queryKey: ["desktop", "bootstrap"],
    queryFn: getDesktopBootstrap,
    enabled: Boolean(import.meta.env.VITE_API_BASE_URL),
  });
}

