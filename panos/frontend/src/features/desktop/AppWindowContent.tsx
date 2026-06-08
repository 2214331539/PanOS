import { type ComponentType, lazy, Suspense } from "react";

import { WelcomeApp } from "@/features/welcome/WelcomeApp";

import styles from "./AppWindowContent.module.css";
import type { WindowAppId } from "./config/apps";

// Welcome 是默认窗口，eager 引入避免首屏闪烁；其余 App 用 React.lazy 代码分割，按需加载。
const AboutApp = lazy(() => import("@/features/about/AboutApp").then((m) => ({ default: m.AboutApp })));
const ArticlesApp = lazy(() =>
  import("@/features/articles/ArticlesApp").then((m) => ({ default: m.ArticlesApp })),
);
const ProjectsApp = lazy(() =>
  import("@/features/projects/ProjectsApp").then((m) => ({ default: m.ProjectsApp })),
);
const GalleryApp = lazy(() =>
  import("@/features/gallery/GalleryApp").then((m) => ({ default: m.GalleryApp })),
);
const LinksApp = lazy(() => import("@/features/links/LinksApp").then((m) => ({ default: m.LinksApp })));
const ContactApp = lazy(() =>
  import("@/features/contact/ContactApp").then((m) => ({ default: m.ContactApp })),
);
const PreferencesApp = lazy(() =>
  import("@/features/preferences/PreferencesApp").then((m) => ({ default: m.PreferencesApp })),
);
const ComingSoonApp = lazy(() =>
  import("@/features/coming-soon/ComingSoonApp").then((m) => ({ default: m.ComingSoonApp })),
);

// id → 组件 的注册表；新增 App 只需在此登记一行。
const REGISTRY: Record<WindowAppId, ComponentType> = {
  welcome: WelcomeApp,
  about: AboutApp,
  articles: ArticlesApp,
  projects: ProjectsApp,
  gallery: GalleryApp,
  links: LinksApp,
  contact: ContactApp,
  preferences: PreferencesApp,
  ideas: () => <ComingSoonApp title="Ideas" stage="V2" />,
  research: () => <ComingSoonApp title="Research" stage="V2" />,
  timeline: () => <ComingSoonApp title="Timeline" stage="V2" />,
};

export function AppWindowContent({ id }: { id: WindowAppId }) {
  const Component = REGISTRY[id];
  return (
    <Suspense fallback={<div className={styles.loading}>Booting PanOS…</div>}>
      <Component />
    </Suspense>
  );
}
