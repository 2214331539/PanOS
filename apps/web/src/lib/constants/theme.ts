// 可视主题 token 的唯一来源（与 styles/tokens.css 的 CSS 变量配套）。
// App 图标的强调色渐变集中在此，不再散落于 globals.css 的 .app-icon--* 类。

export type AccentKey =
  | "cyan"
  | "blue"
  | "amber"
  | "emerald"
  | "rose"
  | "violet"
  | "slate"
  | "lime"
  | "red";

export interface AccentToken {
  gradient: string;
}

export const ACCENTS: Record<AccentKey, AccentToken> = {
  cyan: { gradient: "linear-gradient(145deg, #0891b2, #67e8f9)" },
  blue: { gradient: "linear-gradient(145deg, #1d4ed8, #60a5fa)" },
  amber: { gradient: "linear-gradient(145deg, #b45309, #fbbf24)" },
  emerald: { gradient: "linear-gradient(145deg, #047857, #34d399)" },
  rose: { gradient: "linear-gradient(145deg, #be123c, #fb7185)" },
  violet: { gradient: "linear-gradient(145deg, #6d28d9, #c084fc)" },
  slate: { gradient: "linear-gradient(145deg, #334155, #94a3b8)" },
  lime: { gradient: "linear-gradient(145deg, #3f6212, #a3e635)" },
  red: { gradient: "linear-gradient(145deg, #b91c1c, #f87171)" },
};
