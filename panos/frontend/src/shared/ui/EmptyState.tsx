import type { ReactNode } from "react";

import styles from "./EmptyState.module.css";

// 空状态占位：图标 + 标题 + 说明。inline 用于内容区内嵌（更矮）。
export function EmptyState({
  icon,
  title,
  description,
  inline = false,
}: {
  icon: ReactNode;
  title: string;
  description: ReactNode;
  inline?: boolean;
}) {
  return (
    <div className={inline ? `${styles.emptyState} ${styles.inline}` : styles.emptyState}>
      {icon}
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}
