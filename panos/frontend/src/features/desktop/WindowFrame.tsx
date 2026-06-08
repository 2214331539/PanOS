import { motion } from "motion/react";
import type { PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { useRef } from "react";

import { Tooltip } from "@/shared/ui/Tooltip";

import styles from "./WindowFrame.module.css";
import type { PanosWindow } from "./window-store";
import { useWindowStore } from "./window-store";

interface DragState {
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
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

  const drag = useRef<DragState | null>(null);

  function onTitlePointerDown(event: ReactPointerEvent<HTMLElement>) {
    // 点到窗口控制按钮（关闭/最小化/最大化）时不拖拽。
    if ((event.target as HTMLElement).closest("button")) {
      return;
    }
    // 最大化态与移动端不允许拖拽。
    if (windowState.isMaximized) {
      return;
    }
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      return;
    }

    focusWindow(windowState.id);
    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: windowState.x,
      originY: windowState.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onTitlePointerMove(event: ReactPointerEvent<HTMLElement>) {
    const state = drag.current;
    if (!state || state.pointerId !== event.pointerId) {
      return;
    }
    moveWindow(
      windowState.id,
      state.originX + (event.clientX - state.startX),
      state.originY + (event.clientY - state.startY),
    );
  }

  function endDrag(event: ReactPointerEvent<HTMLElement>) {
    if (!drag.current) {
      return;
    }
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  return (
    <motion.article
      className={windowState.isMaximized ? `${styles.frame} ${styles.maximized}` : styles.frame}
      style={{ left: windowState.x, top: windowState.y, zIndex: windowState.zIndex }}
      initial={{ opacity: 0, scale: 0.96, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: 10 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      onMouseDown={() => focusWindow(windowState.id)}
      aria-label={windowState.title}
    >
      <header
        className={styles.titlebar}
        onPointerDown={onTitlePointerDown}
        onPointerMove={onTitlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
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
          <Tooltip label="Maximize">
            <button
              className={`${styles.control} ${styles.controlMaximize}`}
              type="button"
              aria-label={`Maximize ${windowState.title}`}
              onClick={() => toggleMaximize(windowState.id)}
            />
          </Tooltip>
        </div>
        <h2>{windowState.title}</h2>
      </header>
      <div className={styles.content}>{children}</div>
    </motion.article>
  );
}
