import type { ReactNode } from "react";

import { ACCENTS, type AccentKey } from "@/shared/constants/theme";

import styles from "./AppIcon.module.css";

// 共享的 App 图标底座：强调色渐变来自 shared/constants/theme，避免在多处重复写法。
export function AppIcon({
  accent,
  size = "md",
  className,
  children,
}: {
  accent: AccentKey;
  size?: "md" | "sm";
  className?: string;
  children?: ReactNode;
}) {
  const classes = [styles.appIcon, size === "sm" ? styles.sm : null, className]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} style={{ background: ACCENTS[accent].gradient }} aria-hidden="true">
      {children}
    </span>
  );
}
