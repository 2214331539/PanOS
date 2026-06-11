import { X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { useRef } from "react";

import { cn } from "@/shared/lib/utils/classnames";
import { Tooltip } from "@/shared/ui/Tooltip";

import styles from "./WindowFrame.module.css";
import type { PanosWindow } from "./window-store";
import { clampWindowPosition, useWindowStore } from "./window-store";

interface DragState {
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
  // 拖拽过程中的最新位置；pointerup 时一次性提交到 store。
  lastX: number;
  lastY: number;
}

function isMobileViewport(): boolean {
  return typeof window !== "undefined" && window.innerWidth < 768;
}

// 最小化时窗口顶部要沉到的纵向位移（相对当前 top，落点在 Dock 附近）。
function minimizeSinkY(windowTop: number): number {
  if (typeof window === "undefined") {
    return 480;
  }
  return Math.max(160, window.innerHeight - windowTop - 120);
}

export function WindowFrame({
  children,
  windowState,
}: {
  children: ReactNode;
  windowState: PanosWindow;
}) {
  const closeWindow = useWindowStore((state) => state.closeWindow);
  const minimizeWindow = useWindowStore((state) => state.minimizeWindow);
  const toggleMaximize = useWindowStore((state) => state.toggleMaximize);
  const focusWindow = useWindowStore((state) => state.focusWindow);
  const moveWindow = useWindowStore((state) => state.moveWindow);
  const isActive = useWindowStore((state) => state.activeWindowId === windowState.id);
  const reduceMotion = useReducedMotion();

  const frameRef = useRef<HTMLElement | null>(null);
  const drag = useRef<DragState | null>(null);

  function onTitlePointerDown(event: ReactPointerEvent<HTMLElement>) {
    // 点到窗口控制按钮（关闭/最小化/最大化）时不拖拽。
    if ((event.target as HTMLElement).closest("button")) {
      return;
    }
    // 最大化态与移动端不允许拖拽。
    if (windowState.isMaximized || isMobileViewport()) {
      return;
    }

    focusWindow(windowState.id);
    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: windowState.x,
      originY: windowState.y,
      lastX: windowState.x,
      lastY: windowState.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onTitlePointerMove(event: ReactPointerEvent<HTMLElement>) {
    const state = drag.current;
    if (!state || state.pointerId !== event.pointerId) {
      return;
    }
    // 拖拽中直接写 DOM，避免每次 pointermove 触发整棵窗口树重渲染。
    const { x, y } = clampWindowPosition(
      state.originX + (event.clientX - state.startX),
      state.originY + (event.clientY - state.startY),
    );
    state.lastX = x;
    state.lastY = y;
    const frame = frameRef.current;
    if (frame) {
      frame.style.left = `${x}px`;
      frame.style.top = `${y}px`;
    }
  }

  function endDrag(event: ReactPointerEvent<HTMLElement>) {
    const state = drag.current;
    if (!state) {
      return;
    }
    drag.current = null;
    moveWindow(windowState.id, state.lastX, state.lastY);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function onTitleDoubleClick(event: React.MouseEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest("button") || isMobileViewport()) {
      return;
    }
    toggleMaximize(windowState.id);
  }

  const maximizeLabel = windowState.isMaximized ? "Restore" : "Maximize";

  return (
    <motion.article
      ref={frameRef}
      // layout：最大化/还原时让尺寸与位置以 FLIP 平滑过渡，而不是瞬间跳变。
      layout
      className={cn(
        styles.frame,
        windowState.isMaximized && styles.maximized,
        !isActive && styles.inactive,
      )}
      style={{
        left: windowState.x,
        top: windowState.y,
        zIndex: windowState.zIndex,
        pointerEvents: windowState.isMinimized ? "none" : "auto",
      }}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 28 }}
      // 最小化：缩小沉向 Dock（保持挂载）；恢复时从 Dock 弹回。
      animate={
        windowState.isMinimized
          ? reduceMotion
            ? { opacity: 0 }
            : { opacity: 0, scale: 0.18, y: minimizeSinkY(windowState.y) }
          : { opacity: 1, scale: 1, y: 0 }
      }
      exit={
        reduceMotion
          ? { opacity: 0 }
          : { opacity: 0, scale: 0.94, y: 22, transition: { duration: 0.16, ease: "easeIn" } }
      }
      transition={
        windowState.isMinimized
          ? { duration: 0.34, ease: [0.4, 0, 0.7, 0.2] }
          : { type: "spring", stiffness: 320, damping: 28, mass: 0.8 }
      }
      aria-hidden={windowState.isMinimized || undefined}
      onMouseDown={() => focusWindow(windowState.id)}
      aria-label={windowState.title}
    >
      <header
        className={styles.titlebar}
        onPointerDown={onTitlePointerDown}
        onPointerMove={onTitlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={onTitleDoubleClick}
      >
        <div className={styles.controls}>
          <Tooltip label="Close">
            <button
              className={`${styles.control} ${styles.controlClose}`}
              type="button"
              aria-label={`Close ${windowState.title}`}
              onClick={() => closeWindow(windowState.id)}
            />
          </Tooltip>
          <Tooltip label="Minimize">
            <button
              className={`${styles.control} ${styles.controlMinimize}`}
              type="button"
              aria-label={`Minimize ${windowState.title}`}
              onClick={() => minimizeWindow(windowState.id)}
            />
          </Tooltip>
          <Tooltip label={maximizeLabel}>
            <button
              className={`${styles.control} ${styles.controlMaximize}`}
              type="button"
              aria-label={`${maximizeLabel} ${windowState.title}`}
              onClick={() => toggleMaximize(windowState.id)}
            />
          </Tooltip>
        </div>
        <h2>{windowState.title}</h2>
        <button
          className={styles.mobileClose}
          type="button"
          aria-label={`Close ${windowState.title}`}
          onClick={() => closeWindow(windowState.id)}
        >
          <X size={20} aria-hidden="true" />
        </button>
      </header>
      <div className={styles.content}>{children}</div>
    </motion.article>
  );
}
