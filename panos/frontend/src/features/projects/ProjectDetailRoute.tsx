import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";

import { applyTheme, useThemeStore } from "@/shared/stores/theme-store";

import { ProjectReader } from "./ProjectReader";
import styles from "./ProjectDetailRoute.module.css";

// 项目详情直达页（/projects/:slug），独立全屏渲染，复用 ProjectReader。
export function ProjectDetailRoute() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const mode = useThemeStore((state) => state.mode);

  useEffect(() => {
    applyTheme(mode);
  }, [mode]);

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <ProjectReader
          slug={slug ?? ""}
          onBack={() => {
            void navigate("/");
          }}
          backLabel="返回 PanOS 桌面"
        />
      </div>
    </main>
  );
}
