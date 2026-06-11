// App 注册表元数据的唯一来源：id、标题、文案、强调色、图标、阶段。
// 仅元数据（不引入 App 组件），供 Dock、window-store、Spotlight 使用。

import { Atom, Briefcase, Clock, FileText, Image, Lightbulb, Link, Mail, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { AccentKey } from "@/shared/constants/theme";

type AppIconComponent = LucideIcon;

// 先固定 id 列表，派生类型；注册表再按这些类型约束，保证 id 字面量与类型同步。
const DOCK_APP_IDS = [
  "about",
  "articles",
  "ideas",
  "projects",
  "gallery",
  "research",
  "timeline",
  "links",
  "contact",
] as const;
export type DockAppId = (typeof DOCK_APP_IDS)[number];
type SystemAppId = "welcome" | "preferences";
export type WindowAppId = DockAppId | SystemAppId;

export interface DockAppDefinition {
  id: DockAppId;
  title: string;
  heading: string;
  label: string;
  kind: "content";
  accent: AccentKey;
  icon: AppIconComponent;
  stage?: string;
}

interface SystemAppDefinition {
  id: SystemAppId;
  title: string;
  heading: string;
  label: string;
  kind: "system";
}

// Dock 中的内容型 App（产品结构，不允许后台随意新增核心 App）。
export const DOCK_APPS: readonly DockAppDefinition[] = [
  { id: "about", title: "About", heading: "About This Pan", label: "关于我", kind: "content", accent: "cyan", icon: User },
  { id: "articles", title: "Articles", heading: "Articles", label: "文章", kind: "content", accent: "blue", icon: FileText },
  { id: "ideas", title: "Ideas", heading: "Ideas", label: "想法", kind: "content", accent: "amber", icon: Lightbulb },
  { id: "projects", title: "Projects", heading: "Projects", label: "项目", kind: "content", accent: "emerald", icon: Briefcase },
  { id: "gallery", title: "Gallery", heading: "Gallery", label: "相册", kind: "content", accent: "rose", icon: Image },
  { id: "research", title: "Research", heading: "Research", label: "研究", kind: "content", accent: "violet", icon: Atom },
  { id: "timeline", title: "Timeline", heading: "Timeline", label: "时间线", kind: "content", accent: "slate", icon: Clock },
  { id: "links", title: "Links", heading: "Links", label: "链接", kind: "content", accent: "lime", icon: Link },
  { id: "contact", title: "Contact", heading: "Contact", label: "联系", kind: "content", accent: "red", icon: Mail },
];

// 系统型 App（无 Dock 入口）：欢迎窗口、系统偏好。
const SYSTEM_APPS: readonly SystemAppDefinition[] = [
  { id: "welcome", title: "Welcome to PanOS", heading: "Welcome to PanOS", label: "欢迎", kind: "system" },
  { id: "preferences", title: "System Preferences", heading: "System Preferences", label: "偏好设置", kind: "system" },
];

export const WINDOW_TITLES = {
  ...Object.fromEntries(DOCK_APPS.map((app) => [app.id, app.title])),
  ...Object.fromEntries(SYSTEM_APPS.map((app) => [app.id, app.title])),
} as Record<WindowAppId, string>;

const DOCK_APP_ID_SET: ReadonlySet<string> = new Set(DOCK_APP_IDS);

// URL `?app=` 深链只允许内容型 App（welcome / preferences 不进 URL）。
export function isDockAppId(value: string): value is DockAppId {
  return DOCK_APP_ID_SET.has(value);
}
