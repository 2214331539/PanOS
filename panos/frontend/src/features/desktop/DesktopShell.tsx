import { AnimatePresence } from "motion/react";
import { useEffect } from "react";
import type { CSSProperties } from "react";
import { useSearchParams } from "react-router";

import { ASSETS } from "@/shared/constants/assets";
import { applyTheme, useThemeStore } from "@/shared/stores/theme-store";
import { AppIcon } from "@/shared/ui/AppIcon";

import { AppWindowContent } from "./AppWindowContent";
import { DOCK_APPS, isDockAppId } from "./config/apps";
import styles from "./DesktopShell.module.css";
import { Dock } from "./Dock";
import { MenuBar } from "./MenuBar";
import { Spotlight } from "./Spotlight";
import { Widgets } from "./Widgets";
import type { PanosWindow } from "./window-store";
import { useWindowStore } from "./window-store";
import { WindowFrame } from "./WindowFrame";
import { useSpotlightStore } from "./spotlight-store";

// 首访自动弹 Welcome，回访保持安静（菜单栏「Restart Intro」可随时找回）。
const INTRO_SEEN_KEY = "panos-intro-seen";

export function DesktopShell() {
  const windows = useWindowStore((state) => state.windows);
  const activeWindowId = useWindowStore((state) => state.activeWindowId);
  const openWindow = useWindowStore((state) => state.openWindow);
  const mode = useThemeStore((state) => state.mode);
  const openSpotlight = useSpotlightStore((state) => state.open);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    applyTheme(mode);
  }, [mode]);

  // 启动：URL 带 ?app= 时恢复对应窗口（分享 / 刷新场景）；否则首访弹 Welcome。
  useEffect(() => {
    const appParam = searchParams.get("app");
    if (appParam && isDockAppId(appParam)) {
      openWindow(appParam);
      return;
    }
    if (!window.localStorage.getItem(INTRO_SEEN_KEY)) {
      window.localStorage.setItem(INTRO_SEEN_KEY, "1");
      openWindow("welcome");
    }
    // 仅启动时执行一次；后续 URL 由下面的同步 effect 维护。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 激活窗口 → URL 同步，让当前 App 可刷新恢复、可直接分享。
  useEffect(() => {
    setSearchParams(
      (params) => {
        const next = new URLSearchParams(params);
        if (activeWindowId && isDockAppId(activeWindowId)) {
          next.set("app", activeWindowId);
        } else {
          next.delete("app");
        }
        return next;
      },
      { replace: true },
    );
  }, [activeWindowId, setSearchParams]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openSpotlight();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openSpotlight]);

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
          {DOCK_APPS.map((app) => {
            const Icon = app.icon;
            return (
              <button key={app.id} type="button" onClick={() => openWindow(app.id)}>
                <span className={styles.mobileHomeIcon}>
                  <AppIcon accent={app.accent}>
                    <Icon aria-hidden="true" size={22} strokeWidth={2.2} />
                  </AppIcon>
                  {app.stage ? <span className={styles.mobileHomeStage}>{app.stage}</span> : null}
                </span>
                <span>{app.title}</span>
              </button>
            );
          })}
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

      <Dock hideOnMobile={visibleWindows.length > 0} />
      <Spotlight />
    </main>
  );
}
