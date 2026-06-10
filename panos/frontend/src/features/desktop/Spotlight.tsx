import * as Dialog from "@radix-ui/react-dialog";
import { Search, X } from "lucide-react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { useMemo, useState } from "react";

import { AppIcon } from "@/shared/ui/AppIcon";
import { IconButton } from "@/shared/ui/Button";

import type { DockAppId } from "./config/apps";
import { DOCK_APPS } from "./config/apps";
import styles from "./Spotlight.module.css";
import { useSpotlightStore } from "./spotlight-store";
import { useWindowStore } from "./window-store";

export function Spotlight() {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const isOpen = useSpotlightStore((state) => state.isOpen);
  const close = useSpotlightStore((state) => state.close);
  const openWindow = useWindowStore((state) => state.openWindow);

  // 所有关闭路径都走这里，顺便清空搜索词，下次打开从干净状态开始。
  function handleClose() {
    close();
    setQuery("");
    setActiveIndex(0);
  }

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return DOCK_APPS.slice(0, 6);
    }

    return DOCK_APPS.filter((app) => {
      return (
        app.title.toLowerCase().includes(normalized) ||
        app.label.toLowerCase().includes(normalized)
      );
    });
  }, [query]);

  function launch(id: DockAppId) {
    openWindow(id);
    handleClose();
  }

  function onInputKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (results.length ? (index + 1) % results.length : 0));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (results.length ? (index - 1 + results.length) % results.length : 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const target = results[activeIndex] ?? results[0];
      if (target) {
        launch(target.id);
      }
    }
  }

  const activeOptionId = results[activeIndex] ? `spotlight-option-${results[activeIndex].id}` : undefined;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => (open ? undefined : handleClose())}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.backdrop} />
        <Dialog.Content className={styles.panel} aria-describedby={undefined}>
          <Dialog.Title className={styles.srOnly}>Spotlight search</Dialog.Title>
          <div className={styles.inputRow}>
            <Search size={20} aria-hidden="true" />
            <input
              autoFocus
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={onInputKeyDown}
              placeholder="Search PanOS"
              role="combobox"
              aria-expanded="true"
              aria-controls="spotlight-results"
              aria-activedescendant={activeOptionId}
            />
            <IconButton label="Close Spotlight" onClick={handleClose}>
              <X size={16} />
            </IconButton>
          </div>
          <div className={styles.results} id="spotlight-results" role="listbox" aria-label="搜索结果">
            {results.length > 0 ? (
              results.map((app, index) => {
                const Icon = app.icon;
                return (
                  <button
                    key={app.id}
                    id={`spotlight-option-${app.id}`}
                    type="button"
                    role="option"
                    aria-selected={index === activeIndex}
                    className={index === activeIndex ? styles.active : undefined}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => launch(app.id)}
                  >
                    <AppIcon accent={app.accent} size="sm">
                      <Icon aria-hidden="true" size={20} strokeWidth={2.2} />
                    </AppIcon>
                    <span>
                      <strong>{app.title}</strong>
                      <small>{app.stage ? `${app.label} · ${app.stage}` : app.label}</small>
                    </span>
                  </button>
                );
              })
            ) : (
              <p className={styles.empty}>没有找到匹配内容。换个关键词试试。</p>
            )}
          </div>
          <p className={styles.footer} aria-hidden="true">
            ↑↓ 选择 · Enter 打开 · Esc 关闭
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
