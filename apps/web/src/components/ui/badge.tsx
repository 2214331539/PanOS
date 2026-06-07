import type { ReactNode } from "react";

import { cn } from "../../lib/utils/classnames";

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "blue" | "green" | "amber" | "red";
}) {
  return <span className={cn("badge", `badge--${tone}`)}>{children}</span>;
}

