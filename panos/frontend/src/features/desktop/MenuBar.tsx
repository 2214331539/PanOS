import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  BatteryCharging,
  Check,
  Info,
  Keyboard,
  Link2,
  LogIn,
  LogOut,
  Mail,
  Monitor,
  Moon,
  RotateCcw,
  Search,
  Settings,
  SunMedium,
  Wifi,
} from "lucide-react";
import type { ReactNode } from "react";
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

const THEME_LABELS: Record<ThemeMode, string> = {
  system: "跟随系统",
  light: "浅色",
  dark: "深色",
};

// 探索电量彩蛋：随访客在站内停留的分钟数充电（20% 起步，每分钟 +2%）。
const BATTERY_SESSION_KEY = "panos-visit-start";

function useExplorationBattery(): number {
  const [percent, setPercent] = useState(20);

  useEffect(() => {
    const stored = window.sessionStorage.getItem(BATTERY_SESSION_KEY);
    const start = stored ? Number(stored) : Date.now();
    if (!stored) {
      window.sessionStorage.setItem(BATTERY_SESSION_KEY, String(start));
    }
    const update = () => {
      const minutes = (Date.now() - start) / 60_000;
      setPercent(Math.min(100, Math.round(20 + minutes * 2)));
    };
    update();
    const id = window.setInterval(update, 30_000);
    return () => window.clearInterval(id);
  }, []);

  return percent;
}

// 顶部菜单（文件 / 显示 / 窗口 / 帮助）的统一外壳。
function TopMenu({ label, children }: { label: string; children: ReactNode }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className={styles.menuTrigger}>{label}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className={styles.dropdown} align="start" sideOffset={8}>
          {children}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export function MenuBar() {
  const [clock, setClock] = useState(() => formatClock(new Date()));
  const windows = useWindowStore((state) => state.windows);
  const activeWindowId = useWindowStore((state) => state.activeWindowId);
  const openWindow = useWindowStore((state) => state.openWindow);
  const closeWindow = useWindowStore((state) => state.closeWindow);
  const minimizeWindow = useWindowStore((state) => state.minimizeWindow);
  const focusWindow = useWindowStore((state) => state.focusWindow);
  const restartIntro = useWindowStore((state) => state.restartIntro);
  const openSpotlight = useSpotlightStore((state) => state.open);
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const signOut = useAuthStore((state) => state.signOut);
  const [loginOpen, setLoginOpen] = useState(false);
  const battery = useExplorationBattery();

  useEffect(() => {
    const id = window.setInterval(() => setClock(formatClock(new Date())), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const openedWindows = Object.values(windows).filter((win) => win?.isOpen);

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

        <nav className={styles.menus} aria-label="PanOS 菜单">
          <TopMenu label="文件">
            <DropdownMenu.Item
              className={styles.dropdownItem}
              onSelect={() => openWindow("contact")}
            >
              <Mail size={15} />
              新建留言
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className={styles.dropdownItem}
              onSelect={() => void navigator.clipboard?.writeText(window.location.href)}
            >
              <Link2 size={15} />
              复制当前链接
            </DropdownMenu.Item>
          </TopMenu>

          <TopMenu label="显示">
            {(Object.keys(THEME_LABELS) as ThemeMode[]).map((themeMode) => (
              <DropdownMenu.Item
                key={themeMode}
                className={styles.dropdownItem}
                onSelect={() => setMode(themeMode)}
              >
                <span className={styles.checkSlot}>
                  {mode === themeMode ? <Check size={14} /> : null}
                </span>
                {THEME_LABELS[themeMode]}外观
              </DropdownMenu.Item>
            ))}
            <DropdownMenu.Separator className={styles.dropdownSep} />
            <DropdownMenu.Item
              className={styles.dropdownItem}
              onSelect={() => openWindow("preferences")}
            >
              <Settings size={15} />
              更换壁纸…
            </DropdownMenu.Item>
          </TopMenu>

          <TopMenu label="窗口">
            <DropdownMenu.Item
              className={styles.dropdownItem}
              disabled={openedWindows.length === 0}
              onSelect={() => openedWindows.forEach((win) => win && minimizeWindow(win.id))}
            >
              全部最小化
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className={styles.dropdownItem}
              disabled={openedWindows.length === 0}
              onSelect={() => openedWindows.forEach((win) => win && closeWindow(win.id))}
            >
              关闭所有窗口
            </DropdownMenu.Item>
            <DropdownMenu.Separator className={styles.dropdownSep} />
            {openedWindows.length === 0 ? (
              <DropdownMenu.Item className={styles.dropdownItem} disabled>
                （没有打开的窗口）
              </DropdownMenu.Item>
            ) : (
              openedWindows.map(
                (win) =>
                  win && (
                    <DropdownMenu.Item
                      key={win.id}
                      className={styles.dropdownItem}
                      onSelect={() => focusWindow(win.id)}
                    >
                      <span className={styles.checkSlot}>
                        {activeWindowId === win.id ? <Check size={14} /> : null}
                      </span>
                      {WINDOW_TITLES[win.id]}
                    </DropdownMenu.Item>
                  ),
              )
            )}
          </TopMenu>

          <TopMenu label="帮助">
            <DropdownMenu.Item className={styles.dropdownItem} onSelect={openSpotlight}>
              <Keyboard size={15} />
              Spotlight 搜索
              <span className={styles.shortcut}>⌘K</span>
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className={styles.dropdownItem}
              onSelect={() => openWindow("about")}
            >
              <Info size={15} />
              关于这台 Pan
            </DropdownMenu.Item>
          </TopMenu>
        </nav>
      </div>

      <div className={styles.right}>
        <Tooltip label="已连接：PanOS 专属网络">
          <span className={styles.statusIcon} aria-label="Wi-Fi 已连接">
            <Wifi size={15} />
          </span>
        </Tooltip>
        <Tooltip label={`探索电量 ${battery}% —— 逛得越久充得越满`}>
          <span className={styles.statusIcon} aria-label={`探索电量 ${battery}%`}>
            <BatteryCharging size={16} />
            <small className={styles.batteryText}>{battery}%</small>
          </span>
        </Tooltip>
        <Tooltip label="Spotlight 搜索（⌘K）">
          <IconButton label="Open Spotlight" onClick={openSpotlight}>
            <Search size={16} />
          </IconButton>
        </Tooltip>
        <Tooltip label={`主题：${THEME_LABELS[mode]}`}>
          <IconButton label="Cycle theme" onClick={() => useThemeStore.getState().cycleMode()}>
            {mode === "system" ? <Monitor size={16} /> : mode === "dark" ? <Moon size={16} /> : <SunMedium size={16} />}
          </IconButton>
        </Tooltip>
        <time className={styles.clock}>{clock}</time>
      </div>

      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
    </header>
  );
}
