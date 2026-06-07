export const DOCK_APPS = [
  {
    id: "about",
    title: "About",
    heading: "About This Pan",
    label: "关于我",
    accent: "cyan",
  },
  {
    id: "articles",
    title: "Articles",
    heading: "Articles",
    label: "文章",
    accent: "blue",
  },
  {
    id: "ideas",
    title: "Ideas",
    heading: "Ideas",
    label: "想法",
    accent: "amber",
    stage: "V2",
  },
  {
    id: "projects",
    title: "Projects",
    heading: "Projects",
    label: "项目",
    accent: "emerald",
  },
  {
    id: "gallery",
    title: "Gallery",
    heading: "Gallery",
    label: "相册",
    accent: "rose",
  },
  {
    id: "research",
    title: "Research",
    heading: "Research",
    label: "研究",
    accent: "violet",
    stage: "V2",
  },
  {
    id: "timeline",
    title: "Timeline",
    heading: "Timeline",
    label: "时间线",
    accent: "slate",
    stage: "V2",
  },
  {
    id: "links",
    title: "Links",
    heading: "Links",
    label: "链接",
    accent: "lime",
  },
  {
    id: "contact",
    title: "Contact",
    heading: "Contact",
    label: "联系",
    accent: "red",
  },
] as const;

export type DockAppId = (typeof DOCK_APPS)[number]["id"];
export type WindowAppId = DockAppId | "welcome" | "preferences";

export const WINDOW_TITLES: Record<WindowAppId, string> = {
  welcome: "Welcome to PanOS",
  preferences: "System Preferences",
  about: "About This Pan",
  articles: "Articles",
  ideas: "Ideas",
  projects: "Projects",
  gallery: "Gallery",
  research: "Research",
  timeline: "Timeline",
  links: "Links",
  contact: "Contact",
};

