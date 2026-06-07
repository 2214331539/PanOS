import { Route, Routes } from "react-router";

import { AdminRoute } from "./admin/AdminRoute";
import { LoginRoute } from "./admin/LoginRoute";
import { ArticleRoute } from "./public/ArticleRoute";
import { DesktopRoute } from "./public/DesktopRoute";
import { NotFoundRoute } from "./public/NotFoundRoute";
import { ProjectRoute } from "./public/ProjectRoute";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<DesktopRoute />} />
      <Route path="/articles/:slug" element={<ArticleRoute />} />
      <Route path="/projects/:slug" element={<ProjectRoute />} />
      <Route path="/admin/login" element={<LoginRoute />} />
      <Route path="/admin" element={<AdminRoute />} />
      <Route path="*" element={<NotFoundRoute />} />
    </Routes>
  );
}

