import { HelpCircle, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

import styles from "./HelpBubble.module.css";

const SHORTCUTS: { keys: string; action: string }[] = [
  { keys: "⌘K / Ctrl+K", action: "Spotlight 搜索全站内容" },
  { keys: "双击桌面图标", action: "打开对应内容" },
  { keys: "拖拽标题栏", action: "移动窗口" },
  { keys: "双击标题栏", action: "最大化 / 还原窗口" },
  { keys: "🔴 🟡 🟢", action: "关闭 / 最小化 / 缩放窗口" },
  { keys: "右键桌面", action: "桌面菜单（换壁纸 / 切换外观）" },
  { keys: "Esc", action: "关闭弹层" },
];

// 右下角问号悬浮球：快捷键与玩法说明（替代桌面正中的文字提示）。
export function HelpBubble() {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className={styles.root}>
      <AnimatePresence>
        {open ? (
          <>
            <button
              type="button"
              className={styles.backdrop}
              aria-label="关闭快捷键说明"
              onClick={() => setOpen(false)}
            />
            <motion.section
              className={styles.panel}
              role="dialog"
              aria-label="快捷键说明"
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={
                reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.95, y: 8, transition: { duration: 0.12 } }
              }
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
            >
              <header className={styles.panelHead}>
                <h2>玩转 PanOS</h2>
                <button
                  type="button"
                  className={styles.close}
                  aria-label="关闭"
                  onClick={() => setOpen(false)}
                >
                  <X size={14} />
                </button>
              </header>
              <ul className={styles.list}>
                {SHORTCUTS.map((item) => (
                  <li key={item.keys}>
                    <kbd>{item.keys}</kbd>
                    <span>{item.action}</span>
                  </li>
                ))}
              </ul>
            </motion.section>
          </>
        ) : null}
      </AnimatePresence>

      <motion.button
        type="button"
        className={styles.bubble}
        aria-label="快捷键说明"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        whileHover={reduceMotion ? undefined : { scale: 1.1 }}
        whileTap={reduceMotion ? undefined : { scale: 0.92 }}
      >
        <HelpCircle size={20} aria-hidden="true" />
      </motion.button>
    </div>
  );
}
