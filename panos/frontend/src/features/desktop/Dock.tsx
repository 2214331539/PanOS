import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import type { MotionValue } from "motion/react";
import { useRef } from "react";

import { AppIcon } from "@/shared/ui/AppIcon";
import { cn } from "@/shared/lib/utils/classnames";
import { Tooltip } from "@/shared/ui/Tooltip";

import type { DockAppDefinition } from "./config/apps";
import { DOCK_APPS } from "./config/apps";
import styles from "./Dock.module.css";
import { useWindowStore } from "./window-store";

// macOS 式鱼眼放大：图标缩放随「光标 - 图标中心」距离衰减，弹簧跟手。
// 半径只覆盖到紧邻图标（间距约 68px），余弦衰减让相邻图标只轻微跟随、
// 再远的完全不动，避免“一片图标同时放大”。
const MAGNIFY_RANGE = 88;
const MAGNIFY_SCALE = 1.5;
const SPRING = { stiffness: 420, damping: 28, mass: 0.35 };

function magnification(distance: number): number {
  const offset = Math.abs(distance);
  if (offset >= MAGNIFY_RANGE) {
    return 1;
  }
  // 余弦窗：中心 = MAGNIFY_SCALE，边缘平滑落回 1，肩部衰减比线性快得多。
  const falloff = 0.5 + 0.5 * Math.cos((offset / MAGNIFY_RANGE) * Math.PI);
  return 1 + (MAGNIFY_SCALE - 1) * falloff;
}

function DockItem({
  app,
  isOpen,
  mouseX,
  magnify,
  onActivate,
}: {
  app: DockAppDefinition;
  isOpen: boolean;
  mouseX: MotionValue<number>;
  magnify: boolean;
  onActivate: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const Icon = app.icon;

  const distance = useTransform(mouseX, (x) => {
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds) return Number.POSITIVE_INFINITY;
    return x - (bounds.left + bounds.width / 2);
  });
  const targetScale = useTransform(distance, magnification);
  const scale = useSpring(targetScale, SPRING);
  // 放大同时上浮，模拟从 Dock「探出来」的感觉。
  const lift = useTransform(scale, (value) => -(value - 1) * 22);

  return (
    <Tooltip label={`${app.title}${app.stage ? ` · ${app.stage}` : ""}`}>
      <button
        ref={ref}
        className={styles.item}
        type="button"
        aria-label={`Open ${app.title}`}
        onClick={onActivate}
      >
        <motion.span
          className={styles.iconWrap}
          style={magnify ? { scale, y: lift } : undefined}
          whileTap={magnify ? { scale: MAGNIFY_SCALE * 0.92 } : undefined}
        >
          <AppIcon accent={app.accent} className={styles.icon}>
            <Icon aria-hidden="true" size={25} strokeWidth={2.2} />
          </AppIcon>
          {app.stage ? <span className={styles.stage}>{app.stage}</span> : null}
        </motion.span>
        {isOpen ? <span className={styles.dot} aria-hidden="true" /> : null}
      </button>
    </Tooltip>
  );
}

// hideOnMobile：移动端窗口全屏打开时收起 Dock（iOS 式——关掉 App 回主屏再切换），
// 避免悬浮 Dock 挡住窗口底部的按钮；桌面端不受影响。
export function Dock({ hideOnMobile = false }: { hideOnMobile?: boolean }) {
  const windows = useWindowStore((state) => state.windows);
  const openWindow = useWindowStore((state) => state.openWindow);
  const focusWindow = useWindowStore((state) => state.focusWindow);

  const mouseX = useMotionValue(Number.POSITIVE_INFINITY);
  const reduceMotion = useReducedMotion();
  const magnify = !reduceMotion;

  return (
    <motion.nav
      className={cn(styles.dock, hideOnMobile && styles.hideOnMobile)}
      aria-label="PanOS Dock"
      onMouseMove={(event) => mouseX.set(event.clientX)}
      onMouseLeave={() => mouseX.set(Number.POSITIVE_INFINITY)}
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
            mouseX={mouseX}
            magnify={magnify}
            onActivate={() => (isOpen ? focusWindow(app.id) : openWindow(app.id))}
          />
        );
      })}
    </motion.nav>
  );
}
