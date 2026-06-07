import { AnimatePresence } from "motion/react";
import { useEffect } from "react";

import { AppWindowContent } from "../apps/AppWindowContent";
import { DOCK_APPS } from "../../lib/constants/dock-apps";
import { applyTheme, useThemeStore } from "../../stores/theme-store";
import { useWindowStore } from "../../stores/window-store";
import { useSpotlightStore } from "../../stores/spotlight-store";
import { Dock } from "./Dock";
import { MenuBar } from "./MenuBar";
import { Spotlight } from "./Spotlight";
import { Widgets } from "./Widgets";
import { WindowFrame } from "./WindowFrame";

export function DesktopShell() {
  const windows = useWindowStore((state) => state.windows);
  const openWindow = useWindowStore((state) => state.openWindow);
  const mode = useThemeStore((state) => state.mode);
  const openSpotlight = useSpotlightStore((state) => state.open);
  const closeSpotlight = useSpotlightStore((state) => state.close);

  useEffect(() => {
    applyTheme(mode);
  }, [mode]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openSpotlight();
      }

      if (event.key === "Escape") {
        closeSpotlight();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeSpotlight, openSpotlight]);

  const visibleWindows = Object.values(windows)
    .filter((windowState) => windowState?.isOpen && !windowState.isMinimized)
    .sort((left, right) => left.zIndex - right.zIndex);

  return (
    <main className="desktop-shell" aria-label="PanOS desktop">
      <div className="desktop-wallpaper" aria-hidden="true" />
      <MenuBar />
      <Widgets />

      <section className="mobile-home" aria-label="PanOS apps">
        <div className="mobile-home__hero">
          <p>Welcome to PanOS</p>
          <h1>小潘同学的个人操作系统</h1>
        </div>
        <div className="mobile-home__grid">
          {DOCK_APPS.map((app) => (
            <button key={app.id} type="button" onClick={() => openWindow(app.id)}>
              <span className={`app-icon app-icon--${app.accent}`} />
              <span>{app.title}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="window-layer" aria-label="Open PanOS windows">
        <AnimatePresence>
          {visibleWindows.map((windowState) => (
            <WindowFrame key={windowState.id} windowState={windowState}>
              <AppWindowContent id={windowState.id} />
            </WindowFrame>
          ))}
        </AnimatePresence>
      </section>

      <Dock />
      <Spotlight />
    </main>
  );
}

