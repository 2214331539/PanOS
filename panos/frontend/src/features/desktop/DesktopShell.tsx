import { AnimatePresence, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useSearchParams } from "react-router";

import { ASSETS } from "@/shared/constants/assets";
import { applyTheme, useThemeStore } from "@/shared/stores/theme-store";
import { AppIcon } from "@/shared/ui/AppIcon";

import { AppWindowContent } from "./AppWindowContent";
import { DOCK_APPS, isDockAppId } from "./config/apps";
import type { ContextMenuPosition } from "./DesktopContextMenu";
import { DesktopContextMenu } from "./DesktopContextMenu";
import { DesktopIcons } from "./DesktopIcons";
import styles from "./DesktopShell.module.css";
import { Dock } from "./Dock";
import { HelpBubble } from "./HelpBubble";
import { MenuBar } from "./MenuBar";
import { Spotlight } from "./Spotlight";
import { StickyNotes } from "./StickyNotes";
import { Widgets } from "./Widgets";
import type { PanosWindow } from "./window-store";
import { useWindowStore } from "./window-store";
import { WindowFrame } from "./WindowFrame";
import { useSpotlightStore } from "./spotlight-store";

// 每个浏览器会话首次打开自动弹 Welcome（sessionStorage：刷新不重复弹，
// 新开会话再弹）；菜单栏「Restart Intro」可随时找回。
const INTRO_SEEN_KEY = "panos-intro-seen";

export function DesktopShell() {
  const windows = useWindowStore((state) => state.windows);
  const activeWindowId = useWindowStore((state) => state.activeWindowId);
  const openWindow = useWindowStore((state) => state.openWindow);
  const mode = useThemeStore((state) => state.mode);
  const openSpotlight = useSpotlightStore((state) => state.open);
  const [searchParams, setSearchParams] = useSearchParams();
  const reduceMotion = useReducedMotion();
  const shellRef = useRef<HTMLElement>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuPosition | null>(null);

  // 桌面空白处右键弹 mac 菜单；交互元素（窗口/按钮/输入框等）保留原生行为。
  function onShellContextMenu(event: React.MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.closest("article, header, nav, aside, button, a, input, textarea, [role='dialog'], [role='note']")) {
      return;
    }
    event.preventDefault();
    setContextMenu({
      x: Math.min(event.clientX, window.innerWidth - 210),
      y: Math.min(event.clientY, window.innerHeight - 190),
    });
  }

  // 壁纸视差：鼠标位置归一化到 [-1, 1] 写入 CSS 变量，壁纸反向小幅平移制造景深。
  function onShellMouseMove(event: React.MouseEvent) {
    if (reduceMotion) return;
    const shell = shellRef.current;
    if (!shell) return;
    shell.style.setProperty("--px", String((event.clientX / window.innerWidth) * 2 - 1));
    shell.style.setProperty("--py", String((event.clientY / window.innerHeight) * 2 - 1));
  }

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
    if (!window.sessionStorage.getItem(INTRO_SEEN_KEY)) {
      window.sessionStorage.setItem(INTRO_SEEN_KEY, "1");
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

  // 最小化的窗口保持挂载（WindowFrame 内部动画到 Dock 收起态），
  // 这样最小化/恢复都有连续动画；Dock 的移动端收起逻辑只看真正可见的窗口。
  const openWindows = Object.values(windows)
    .filter((windowState): windowState is PanosWindow => Boolean(windowState?.isOpen))
    .sort((left, right) => left.zIndex - right.zIndex);
  const visibleCount = openWindows.filter((windowState) => !windowState.isMinimized).length;

  const shellStyle = {
    "--panos-wallpaper": `url("${ASSETS.wallpaper.url}")`,
  } as CSSProperties;

  return (
    <main
      ref={shellRef}
      className={styles.desktopShell}
      aria-label="PanOS desktop"
      style={shellStyle}
      onMouseMove={onShellMouseMove}
      onContextMenu={onShellContextMenu}
    >
      <div className={styles.wallpaper} aria-hidden="true" />
      <div className={styles.grain} aria-hidden="true" />
      <MenuBar />
      <DesktopIcons />
      <Widgets />
      <StickyNotes />

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
          {openWindows.map((windowState) => (
            <WindowFrame key={windowState.id} windowState={windowState}>
              <AppWindowContent id={windowState.id} />
            </WindowFrame>
          ))}
        </AnimatePresence>
      </section>

      <Dock hideOnMobile={visibleCount > 0} />
      <HelpBubble />
      <Spotlight />
      {contextMenu ? (
        <DesktopContextMenu position={contextMenu} onClose={() => setContextMenu(null)} />
      ) : null}
    </main>
  );
}
