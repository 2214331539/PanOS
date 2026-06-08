import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";

import { AppIcon } from "@/shared/ui/AppIcon";
import { IconButton } from "@/shared/ui/Button";

import { DOCK_APPS } from "./config/apps";
import styles from "./Spotlight.module.css";
import { useSpotlightStore } from "./spotlight-store";
import { useWindowStore } from "./window-store";

export function Spotlight() {
  const [query, setQuery] = useState("");
  const isOpen = useSpotlightStore((state) => state.isOpen);
  const close = useSpotlightStore((state) => state.close);
  const openWindow = useWindowStore((state) => state.openWindow);

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

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.spotlight} role="dialog" aria-modal="true" aria-label="Spotlight search">
      <button className={styles.backdrop} type="button" aria-label="Close Spotlight" onClick={close} />
      <section className={styles.panel}>
        <div className={styles.inputRow}>
          <Search size={20} aria-hidden="true" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search PanOS"
          />
          <IconButton label="Close Spotlight" onClick={close}>
            <X size={16} />
          </IconButton>
        </div>
        <div className={styles.results}>
          {results.length > 0 ? (
            results.map((app) => (
              <button
                key={app.id}
                type="button"
                onClick={() => {
                  openWindow(app.id);
                  close();
                }}
              >
                <AppIcon accent={app.accent} size="sm" />
                <span>
                  <strong>{app.title}</strong>
                  <small>{app.stage ? `${app.label} · ${app.stage}` : app.label}</small>
                </span>
              </button>
            ))
          ) : (
            <p className={styles.empty}>没有找到匹配内容。换个关键词试试。</p>
          )}
        </div>
      </section>
    </div>
  );
}
