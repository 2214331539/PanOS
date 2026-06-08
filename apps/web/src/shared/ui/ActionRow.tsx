import type { ReactNode } from "react";

import styles from "./ActionRow.module.css";

// 一组操作按钮的横排容器。
export function ActionRow({ children }: { children: ReactNode }) {
  return <div className={styles.actions}>{children}</div>;
}
