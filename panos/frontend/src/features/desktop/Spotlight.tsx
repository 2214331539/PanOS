import * as Dialog from "@radix-ui/react-dialog";
import { Briefcase, FileText, Image, Link as LinkIcon, Search, X } from "lucide-react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { useMemo, useState } from "react";

import { AppIcon } from "@/shared/ui/AppIcon";
import { IconButton } from "@/shared/ui/Button";

import type { DockAppDefinition } from "./config/apps";
import { DOCK_APPS } from "./config/apps";
import type { SearchResult, SearchResultType } from "./search-api";
import { useContentSearch, useDebouncedValue } from "./search-api";
import styles from "./Spotlight.module.css";
import { useSpotlightStore } from "./spotlight-store";
import { useWindowStore } from "./window-store";

type SpotlightEntry =
  | { kind: "app"; key: string; app: DockAppDefinition }
  | { kind: "content"; key: string; result: SearchResult };

const CONTENT_META: Record<
  SearchResultType,
  { label: string; accent: "blue" | "emerald" | "rose" | "lime"; icon: typeof FileText }
> = {
  article: { label: "文章", accent: "blue", icon: FileText },
  project: { label: "项目", accent: "emerald", icon: Briefcase },
  gallery: { label: "照片", accent: "rose", icon: Image },
  link: { label: "链接", accent: "lime", icon: LinkIcon },
};

export function Spotlight() {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const isOpen = useSpotlightStore((state) => state.isOpen);
  const close = useSpotlightStore((state) => state.close);
  const openWindow = useWindowStore((state) => state.openWindow);

  const normalized = query.trim().toLowerCase();
  const debouncedQuery = useDebouncedValue(query.trim(), 200);
  const { data: contentResults } = useContentSearch(isOpen ? debouncedQuery : "");

  // 所有关闭路径都走这里，顺便清空搜索词，下次打开从干净状态开始。
  function handleClose() {
    close();
    setQuery("");
    setActiveIndex(0);
  }

  // 应用匹配（本地） + 内容匹配（/api/search），合成一个键盘可导航的扁平列表。
  const entries = useMemo<SpotlightEntry[]>(() => {
    const apps = normalized
      ? DOCK_APPS.filter(
          (app) =>
            app.title.toLowerCase().includes(normalized) ||
            app.label.toLowerCase().includes(normalized),
        )
      : DOCK_APPS.slice(0, 6);
    const appEntries = apps.map<SpotlightEntry>((app) => ({
      kind: "app",
      key: `app-${app.id}`,
      app,
    }));
    const contentEntries = (normalized ? (contentResults ?? []) : []).map<SpotlightEntry>(
      (result) => ({ kind: "content", key: `${result.type}-${result.id}`, result }),
    );
    return [...appEntries, ...contentEntries];
  }, [normalized, contentResults]);

  function launch(entry: SpotlightEntry) {
    if (entry.kind === "app") {
      openWindow(entry.app.id);
    } else {
      const { result } = entry;
      if (result.type === "article") {
        openWindow("articles", { slug: result.slug });
      } else if (result.type === "project") {
        openWindow("projects", { slug: result.slug });
      } else if (result.type === "gallery") {
        openWindow("gallery");
      } else {
        window.open(result.url, "_blank", "noreferrer");
      }
    }
    handleClose();
  }

  function onInputKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (entries.length ? (index + 1) % entries.length : 0));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) =>
        entries.length ? (index - 1 + entries.length) % entries.length : 0,
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      const target = entries[activeIndex] ?? entries[0];
      if (target) {
        launch(target);
      }
    }
  }

  const safeActiveIndex = Math.min(activeIndex, Math.max(0, entries.length - 1));
  const activeEntry = entries[safeActiveIndex];
  const activeOptionId = activeEntry ? `spotlight-option-${activeEntry.key}` : undefined;

  // 分组标题：第一个 app 条目前显示「应用」，每种内容类型的第一条前显示类型名。
  function groupLabel(index: number): string | null {
    const entry = entries[index];
    const prev = index > 0 ? entries[index - 1] : null;
    if (entry.kind === "app") {
      return !prev || prev.kind !== "app" ? "应用" : null;
    }
    const label = CONTENT_META[entry.result.type].label;
    if (!prev || prev.kind !== "content" || prev.result.type !== entry.result.type) {
      return label;
    }
    return null;
  }

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
              placeholder="搜索应用、文章、项目…"
              role="combobox"
              aria-expanded="true"
              aria-controls="spotlight-results"
              aria-activedescendant={activeOptionId}
            />
            <IconButton label="Close Spotlight" onClick={handleClose}>
              <X size={16} />
            </IconButton>
          </div>
          <div
            className={styles.results}
            id="spotlight-results"
            role="listbox"
            aria-label="搜索结果"
          >
            {entries.length > 0 ? (
              entries.map((entry, index) => {
                const label = groupLabel(index);
                const isActive = index === safeActiveIndex;
                const meta = entry.kind === "content" ? CONTENT_META[entry.result.type] : null;
                const ContentIcon = meta?.icon ?? FileText;
                return (
                  <div key={entry.key}>
                    {label ? <p className={styles.groupLabel}>{label}</p> : null}
                    <button
                      id={`spotlight-option-${entry.key}`}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      className={isActive ? styles.active : undefined}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => launch(entry)}
                    >
                      {entry.kind === "app" ? (
                        <AppIcon accent={entry.app.accent} size="sm">
                          <entry.app.icon aria-hidden="true" size={20} strokeWidth={2.2} />
                        </AppIcon>
                      ) : (
                        <AppIcon accent={meta?.accent ?? "blue"} size="sm">
                          <ContentIcon aria-hidden="true" size={20} strokeWidth={2.2} />
                        </AppIcon>
                      )}
                      {entry.kind === "app" ? (
                        <span>
                          <strong>{entry.app.title}</strong>
                          <small>
                            {entry.app.stage
                              ? `${entry.app.label} · ${entry.app.stage}`
                              : entry.app.label}
                          </small>
                        </span>
                      ) : (
                        <span>
                          <strong>{entry.result.title}</strong>
                          <small>{entry.result.excerpt || meta?.label}</small>
                        </span>
                      )}
                    </button>
                  </div>
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
