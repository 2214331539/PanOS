import { AnimatePresence } from "motion/react";
import { useEffect } from "react";
import type { CSSProperties } from "react";

import { ASSETS } from "@/shared/constants/assets";
import { applyTheme, useThemeStore } from "@/shared/stores/theme-store";
import { AppIcon } from "@/shared/ui/AppIcon";

import { AppWindowContent } from "./AppWindowContent";
import { DOCK_APPS } from "./config/apps";
import styles from "./DesktopShell.module.css";
import { Dock } from "./Dock";
import { MenuBar } from "./MenuBar";
import { Spotlight } from "./Spotlight";
import { Widgets } from "./Widgets";
import type { PanosWindow } from "./window-store";
import { useWindowStore } from "./window-store";
import { WindowFrame } from "./WindowFrame";
import { useSpotlightStore } from "./spotlight-store";

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
    .filter((windowState): windowState is PanosWindow =>
      Boolean(windowState?.isOpen) && !windowState.isMinimized,
    )
    .sort((left, right) => left.zIndex - right.zIndex);

  const shellStyle = {
    "--panos-wallpaper": `url("${ASSETS.wallpaper.url}")`,
  } as CSSProperties;

  return (
    <main className={styles.desktopShell} aria-label="PanOS desktop" style={shellStyle}>
      <div className={styles.wallpaper} aria-hidden="true" />
      <MenuBar />
      <Widgets />

      <section className={styles.mobileHome} aria-label="PanOS apps">
        <div className={styles.mobileHomeHero}>
          <p>Welcome to PanOS</p>
          <h1>小潘同学的个人操作系统</h1>
        </div>
        <div className={styles.mobileHomeGrid}>
          {DOCK_APPS.map((app) => (
            <button key={app.id} type="button" onClick={() => openWindow(app.id)}>
              <AppIcon accent={app.accent} />
              <span>{app.title}</span>
            </button>
          ))}
        </div>
      </section>

      <section className={styles.windowLayer} aria-label="Open PanOS windows">
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
