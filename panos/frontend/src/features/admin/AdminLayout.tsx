import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router";

import { useAuthStore } from "@/shared/stores/auth-store";

import styles from "./AdminLayout.module.css";

export function AdminLayout({ title, children }: { title: string; children: ReactNode }) {
  const signOut = useAuthStore((state) => state.signOut);
  const navigate = useNavigate();

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <Link to="/admin/articles" className={styles.brand}>
          PanOS 后台 · Articles
        </Link>
        <div className={styles.right}>
          <Link to="/" className={styles.link}>
            查看站点
          </Link>
          <button
            type="button"
            className={styles.logout}
            onClick={() => {
              signOut();
              void navigate("/admin/login");
            }}
          >
            退出登录
          </button>
        </div>
      </header>
      <main className={styles.main}>
        <h1 className={styles.pageTitle}>{title}</h1>
        {children}
      </main>
    </div>
  );
}
