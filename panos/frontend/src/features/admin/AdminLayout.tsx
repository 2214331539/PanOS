import type { ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router";

import { useAuthStore } from "@/shared/stores/auth-store";

import styles from "./AdminLayout.module.css";

const NAV_ITEMS = [
  { to: "/admin/articles", label: "文章" },
  { to: "/admin/projects", label: "项目" },
  { to: "/admin/gallery", label: "图库" },
  { to: "/admin/links", label: "链接" },
  { to: "/admin/widgets", label: "Widget" },
];

export function AdminLayout({ title, children }: { title: string; children: ReactNode }) {
  const signOut = useAuthStore((state) => state.signOut);
  const navigate = useNavigate();

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <div className={styles.left}>
          <Link to="/admin/articles" className={styles.brand}>
            PanOS 后台
          </Link>
          <nav className={styles.nav} aria-label="后台导航">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
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
