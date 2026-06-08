import type { ReactNode } from "react";
import { Navigate } from "react-router";

import { useAuthStore } from "@/shared/stores/auth-store";

// 未登录访问后台时跳转登录页。
export function RequireAuth({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
}
