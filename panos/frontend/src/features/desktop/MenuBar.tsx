import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Info, LogIn, LogOut, Mail, Monitor, Moon, RotateCcw, Search, Settings, SunMedium } from "lucide-react";
import { useEffect, useState } from "react";

import { LoginDialog } from "@/features/auth/LoginDialog";
import { useAuthStore } from "@/shared/stores/auth-store";
import type { ThemeMode } from "@/shared/stores/theme-store";
import { useThemeStore } from "@/shared/stores/theme-store";
import { IconButton } from "@/shared/ui/Button";
import { Tooltip } from "@/shared/ui/Tooltip";

import { WINDOW_TITLES } from "./config/apps";
import styles from "./MenuBar.module.css";
import { useSpotlightStore } from "./spotlight-store";
import { useWindowStore } from "./window-store";

function formatClock(date: Date) {
  return date.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// 三态循环按钮的可预期性：tooltip 同时告知当前模式与下一次点击的去向。
const THEME_LABELS: Record<ThemeMode, string> = {
  system: "跟随系统",
  light: "浅色",
  dark: "深色",
};
const NEXT_THEME: Record<ThemeMode, ThemeMode> = {
  system: "light",
  light: "dark",
  dark: "system",
};

export function MenuBar() {
  const [clock, setClock] = useState(() => formatClock(new Date()));
  const activeWindowId = useWindowStore((state) => state.activeWindowId);
  const openWindow = useWindowStore((state) => state.openWindow);
  const restartIntro = useWindowStore((state) => state.restartIntro);
  const openSpotlight = useSpotlightStore((state) => state.open);
  const cycleMode = useThemeStore((state) => state.cycleMode);
  const mode = useThemeStore((state) => state.mode);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const signOut = useAuthStore((state) => state.signOut);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => setClock(formatClock(new Date())), 30_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <header className={styles.menuBar}>
      <div className={styles.left}>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger className={styles.brand}>
            <span aria-hidden="true">◆</span>
            PanOS
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className={styles.dropdown} align="start" sideOffset={8}>
              <DropdownMenu.Item className={styles.dropdownItem} onSelect={() => openWindow("about")}>
                <Info size={15} />
                About PanOS
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className={styles.dropdownItem}
                onSelect={() => openWindow("preferences")}
              >
                <Settings size={15} />
                System Preferences
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className={styles.dropdownItem}
                onSelect={() => openWindow("contact")}
              >
                <Mail size={15} />
                Contact Me
              </DropdownMenu.Item>
              <DropdownMenu.Separator className={styles.dropdownSep} />
              {isAuthenticated ? (
                <DropdownMenu.Item className={styles.dropdownItem} onSelect={signOut}>
                  <LogOut size={15} />
                  退出登录
                </DropdownMenu.Item>
              ) : (
                <DropdownMenu.Item
                  className={styles.dropdownItem}
                  onSelect={() => setLoginOpen(true)}
                >
                  <LogIn size={15} />
                  登录
                </DropdownMenu.Item>
              )}
              <DropdownMenu.Item className={styles.dropdownItem} onSelect={restartIntro}>
                <RotateCcw size={15} />
                Restart Intro
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
        <span className={styles.active}>{activeWindowId ? WINDOW_TITLES[activeWindowId] : "Desktop"}</span>
      </div>

      <div className={styles.right}>
        <Tooltip label="Spotlight 搜索（⌘K）">
          <IconButton label="Open Spotlight" onClick={openSpotlight}>
            <Search size={16} />
          </IconButton>
        </Tooltip>
        <Tooltip label={`主题：${THEME_LABELS[mode]}（点击切到${THEME_LABELS[NEXT_THEME[mode]]}）`}>
          <IconButton label="Cycle theme" onClick={cycleMode}>
            {mode === "system" ? <Monitor size={16} /> : mode === "dark" ? <Moon size={16} /> : <SunMedium size={16} />}
          </IconButton>
        </Tooltip>
        <time className={styles.clock}>{clock}</time>
      </div>

      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
    </header>
  );
}
