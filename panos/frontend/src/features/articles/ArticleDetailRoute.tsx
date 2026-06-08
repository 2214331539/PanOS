import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";

import { applyTheme, useThemeStore } from "@/shared/stores/theme-store";

import { ArticleReader } from "./ArticleReader";
import styles from "./ArticleDetailRoute.module.css";

// 文章详情直达页（/articles/:slug），独立全屏渲染，复用 ArticleReader。
export function ArticleDetailRoute() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const mode = useThemeStore((state) => state.mode);

  useEffect(() => {
    applyTheme(mode);
  }, [mode]);

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <ArticleReader
          slug={slug ?? ""}
          onNavigate={(next) => {
            void navigate(`/articles/${next}`);
          }}
          onBack={() => {
            void navigate("/");
          }}
          backLabel="返回 PanOS 桌面"
        />
      </div>
    </main>
  );
}
