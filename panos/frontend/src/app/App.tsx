import { Navigate, Route, Routes } from "react-router";

import { AdminLoginRoute } from "@/features/admin/AdminLoginRoute";
import { RequireAuth } from "@/features/admin/RequireAuth";
import { ArticleDetailRoute } from "@/features/articles/ArticleDetailRoute";
import { ArticleEditorRoute } from "@/features/articles/admin/ArticleEditorRoute";
import { ArticleListRoute } from "@/features/articles/admin/ArticleListRoute";
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
      <Route path="/admin" element={<Navigate to="/admin/articles" replace />} />
      <Route
        path="/admin/articles"
        element={
          <RequireAuth>
            <ArticleListRoute />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/articles/new"
        element={
          <RequireAuth>
            <ArticleEditorRoute />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/articles/:id/edit"
        element={
          <RequireAuth>
            <ArticleEditorRoute />
          </RequireAuth>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
