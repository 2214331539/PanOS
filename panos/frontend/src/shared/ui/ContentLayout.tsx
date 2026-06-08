import type { ReactNode } from "react";

import styles from "./ContentLayout.module.css";

// 内容型 App 的布局外壳：可选左侧分类栏 + 主内容区。
export function ContentLayout({
  sidebar,
  sidebarLabel,
  children,
}: {
  sidebar?: ReactNode;
  sidebarLabel?: string;
  children: ReactNode;
}) {
  return (
    <section className={sidebar ? `${styles.contentApp} ${styles.withSidebar}` : styles.contentApp}>
      {sidebar ? (
        <aside className={styles.sidebar} aria-label={sidebarLabel}>
          {sidebar}
        </aside>
      ) : null}
      <div className={styles.main}>{children}</div>
    </section>
  );
}

// 分类栏按钮，供 ContentLayout 的 sidebar 使用。
export function SidebarButton({
  active = false,
  children,
  onClick,
}: {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      className={active ? `${styles.sidebarItem} ${styles.sidebarItemActive}` : styles.sidebarItem}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
