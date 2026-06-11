import { Image, Info, LayoutGrid, Moon } from "lucide-react";
import { useEffect } from "react";

import { useThemeStore } from "@/shared/stores/theme-store";

import styles from "./DesktopContextMenu.module.css";
import { useWindowStore } from "./window-store";

export interface ContextMenuPosition {
  x: number;
  y: number;
}

// 桌面空白处右键的 mac 风格上下文菜单（自绘，不引新依赖）。
export function DesktopContextMenu({
  position,
  onClose,
}: {
  position: ContextMenuPosition;
  onClose: () => void;
}) {
  const openWindow = useWindowStore((state) => state.openWindow);
  const cycleMode = useThemeStore((state) => state.cycleMode);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function run(action: () => void) {
    action();
    onClose();
  }

  return (
    <>
      <button type="button" className={styles.backdrop} aria-label="关闭菜单" onClick={onClose} />
      <ul
        className={styles.menu}
        style={{ left: position.x, top: position.y }}
        role="menu"
        aria-label="桌面菜单"
      >
        <li>
          <button type="button" role="menuitem" onClick={() => run(() => openWindow("preferences"))}>
            <Image size={14} />
            更换壁纸…
          </button>
        </li>
        <li>
          <button type="button" role="menuitem" onClick={() => run(cycleMode)}>
            <Moon size={14} />
            切换外观
          </button>
        </li>
        <li>
          <button type="button" role="menuitem" onClick={onClose}>
            <LayoutGrid size={14} />
            整理桌面图标
          </button>
        </li>
        <li className={styles.sep} aria-hidden="true" />
        <li>
          <button type="button" role="menuitem" onClick={() => run(() => openWindow("about"))}>
            <Info size={14} />
            关于 PanOS
          </button>
        </li>
      </ul>
    </>
  );
}
