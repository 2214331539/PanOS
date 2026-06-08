import { Route, Routes } from "react-router";

import { AdminDashboardRoute } from "@/features/admin/AdminDashboardRoute";
import { AdminLoginRoute } from "@/features/admin/AdminLoginRoute";
import { ArticleDetailRoute } from "@/features/articles/ArticleDetailRoute";
import { DesktopShell } from "@/features/desktop/DesktopShell";
import { ProjectDetailRoute } from "@/features/projects/ProjectDetailRoute";

import { NotFoundPage } from "./NotFoundPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<DesktopShell />} />
      <Route path="/articles/:slug" element={<ArticleDetailRoute />} />
      <Route path="/projects/:slug" element={<ProjectDetailRoute />} />
      <Route path="/admin/login" element={<AdminLoginRoute />} />
      <Route path="/admin" element={<AdminDashboardRoute />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
