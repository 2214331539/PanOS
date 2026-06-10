import { AppIcon } from "@/shared/ui/AppIcon";
import { cn } from "@/shared/lib/utils/classnames";
import { Tooltip } from "@/shared/ui/Tooltip";

import { DOCK_APPS } from "./config/apps";
import styles from "./Dock.module.css";
import { useWindowStore } from "./window-store";

// hideOnMobile：移动端窗口全屏打开时收起 Dock（iOS 式——关掉 App 回主屏再切换），
// 避免悬浮 Dock 挡住窗口底部的按钮；桌面端不受影响。
export function Dock({ hideOnMobile = false }: { hideOnMobile?: boolean }) {
  const windows = useWindowStore((state) => state.windows);
  const openWindow = useWindowStore((state) => state.openWindow);
  const focusWindow = useWindowStore((state) => state.focusWindow);

  return (
    <nav
      className={cn(styles.dock, hideOnMobile && styles.hideOnMobile)}
      aria-label="PanOS Dock"
    >
      {DOCK_APPS.map((app) => {
        const Icon = app.icon;
        const windowState = windows[app.id];
        const isOpen = Boolean(windowState?.isOpen);

        return (
          <Tooltip key={app.id} label={`${app.title}${app.stage ? ` · ${app.stage}` : ""}`}>
            <button
              className={styles.item}
              type="button"
              aria-label={`Open ${app.title}`}
              onClick={() => (isOpen ? focusWindow(app.id) : openWindow(app.id))}
            >
              <AppIcon accent={app.accent} className={styles.icon}>
                <Icon aria-hidden="true" size={25} strokeWidth={2.2} />
              </AppIcon>
              {app.stage ? <span className={styles.stage}>{app.stage}</span> : null}
              <span className={styles.label}>{app.title}</span>
              {isOpen ? <span className={styles.dot} aria-hidden="true" /> : null}
            </button>
          </Tooltip>
        );
      })}
    </nav>
  );
}
