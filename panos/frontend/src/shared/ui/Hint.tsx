import type { ReactNode } from "react";

import styles from "./Hint.module.css";

// 内容区底部的次要说明文字。
export function Hint({ children }: { children: ReactNode }) {
  return <p className={styles.note}>{children}</p>;
}
