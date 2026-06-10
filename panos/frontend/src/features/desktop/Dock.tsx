import { motion, useReducedMotion } from "motion/react";

import { AppIcon } from "@/shared/ui/AppIcon";
import { cn } from "@/shared/lib/utils/classnames";
import { Tooltip } from "@/shared/ui/Tooltip";

import type { DockAppDefinition } from "./config/apps";
import { DOCK_APPS } from "./config/apps";
import styles from "./Dock.module.css";
import { useWindowStore } from "./window-store";

// hover 驱动的放大：天然一次只命中一个图标；幅度克制（1.35x + 上浮 6px）。
const ICON_VARIANTS = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.35, y: -6 },
  tap: { scale: 1.12, y: -2 },
};
const HOVER_SPRING = { type: "spring", stiffness: 380, damping: 24, mass: 0.5 } as const;

function DockItem({
  app,
  isOpen,
  animate,
  onActivate,
}: {
  app: DockAppDefinition;
  isOpen: boolean;
  animate: boolean;
  onActivate: () => void;
}) {
  const Icon = app.icon;

  return (
    <Tooltip label={`${app.title}${app.stage ? ` · ${app.stage}` : ""}`}>
      <motion.button
        className={styles.item}
        type="button"
        aria-label={`Open ${app.title}`}
        onClick={onActivate}
        initial="rest"
        whileHover={animate ? "hover" : undefined}
        whileTap={animate ? "tap" : undefined}
      >
        <motion.span className={styles.iconWrap} variants={ICON_VARIANTS} transition={HOVER_SPRING}>
          <AppIcon accent={app.accent} className={styles.icon}>
            <Icon aria-hidden="true" size={25} strokeWidth={2.2} />
          </AppIcon>
          {app.stage ? <span className={styles.stage}>{app.stage}</span> : null}
        </motion.span>
        {isOpen ? <span className={styles.dot} aria-hidden="true" /> : null}
      </motion.button>
    </Tooltip>
  );
}

// hideOnMobile：移动端窗口全屏打开时收起 Dock（iOS 式——关掉 App 回主屏再切换），
// 避免悬浮 Dock 挡住窗口底部的按钮；桌面端不受影响。
export function Dock({ hideOnMobile = false }: { hideOnMobile?: boolean }) {
  const windows = useWindowStore((state) => state.windows);
  const openWindow = useWindowStore((state) => state.openWindow);
  const focusWindow = useWindowStore((state) => state.focusWindow);
  const reduceMotion = useReducedMotion();

  return (
    <motion.nav
      className={cn(styles.dock, hideOnMobile && styles.hideOnMobile)}
      aria-label="PanOS Dock"
      initial={reduceMotion ? false : { y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 26, delay: 0.1 }}
    >
      {DOCK_APPS.map((app) => {
        const isOpen = Boolean(windows[app.id]?.isOpen);
        return (
          <DockItem
            key={app.id}
            app={app}
            isOpen={isOpen}
            animate={!reduceMotion}
            onActivate={() => (isOpen ? focusWindow(app.id) : openWindow(app.id))}
          />
        );
      })}
    </motion.nav>
  );
}
