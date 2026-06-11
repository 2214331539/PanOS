import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router";

import { AdminLoginRoute } from "@/features/admin/AdminLoginRoute";
import { RequireAuth } from "@/features/auth/RequireAuth";
import { ArticleDetailRoute } from "@/features/articles/ArticleDetailRoute";
import { ArticleEditorRoute } from "@/features/articles/admin/ArticleEditorRoute";
import { ArticleListRoute } from "@/features/articles/admin/ArticleListRoute";
import { DesktopShell } from "@/features/desktop/DesktopShell";
import { WidgetsAdminRoute } from "@/features/desktop/admin/WidgetsAdminRoute";
import { GalleryAdminRoute } from "@/features/gallery/admin/GalleryAdminRoute";
import { LinksAdminRoute } from "@/features/links/admin/LinksAdminRoute";
import { ProjectDetailRoute } from "@/features/projects/ProjectDetailRoute";
import { ProjectEditorRoute } from "@/features/projects/admin/ProjectEditorRoute";
import { ProjectListRoute } from "@/features/projects/admin/ProjectListRoute";

import { NotFoundPage } from "./NotFoundPage";

function guarded(element: ReactNode) {
  return <RequireAuth>{element}</RequireAuth>;
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<DesktopShell />} />
      <Route path="/articles/:slug" element={<ArticleDetailRoute />} />
      <Route path="/projects/:slug" element={<ProjectDetailRoute />} />

      <Route path="/admin/login" element={<AdminLoginRoute />} />
      <Route path="/admin" element={<Navigate to="/admin/articles" replace />} />
      <Route path="/admin/articles" element={guarded(<ArticleListRoute />)} />
      <Route path="/admin/articles/new" element={guarded(<ArticleEditorRoute />)} />
      <Route path="/admin/articles/:id/edit" element={guarded(<ArticleEditorRoute />)} />
      <Route path="/admin/projects" element={guarded(<ProjectListRoute />)} />
      <Route path="/admin/projects/new" element={guarded(<ProjectEditorRoute />)} />
      <Route path="/admin/projects/:id/edit" element={guarded(<ProjectEditorRoute />)} />
      <Route path="/admin/gallery" element={guarded(<GalleryAdminRoute />)} />
      <Route path="/admin/links" element={guarded(<LinksAdminRoute />)} />
      <Route path="/admin/widgets" element={guarded(<WidgetsAdminRoute />)} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
