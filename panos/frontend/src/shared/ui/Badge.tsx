import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils/classnames";

import styles from "./Badge.module.css";

export type BadgeTone = "neutral" | "blue" | "green" | "amber" | "red";

// 仅 blue / amber 有专属样式，其余 tone 回落到基础 badge。
const TONE_CLASS: Record<BadgeTone, string | undefined> = {
  neutral: undefined,
  blue: styles.blue,
  green: undefined,
  amber: styles.amber,
  red: undefined,
};

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: BadgeTone;
}) {
  return <span className={cn(styles.badge, TONE_CLASS[tone])}>{children}</span>;
}
