import type { ReactNode } from "react";

import styles from "./DirectPanel.module.css";

// 直达页（文章/项目详情、404）的居中面板外壳。
export function DirectPanel({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className={styles.shell}>
      <section className={styles.panel}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1>{title}</h1>
        {children}
      </section>
    </main>
  );
}
