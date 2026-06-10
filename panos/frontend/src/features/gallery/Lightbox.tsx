import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect } from "react";

import type { GalleryItem } from "./api";
import styles from "./Lightbox.module.css";

export function Lightbox({
  items,
  index,
  onNavigate,
  onClose,
}: {
  items: GalleryItem[];
  index: number;
  onNavigate: (index: number) => void;
  onClose: () => void;
}) {
  const item = items[index];
  const hasPrev = index > 0;
  const hasNext = index < items.length - 1;

  const handleKey = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft" && hasPrev) onNavigate(index - 1);
      if (event.key === "ArrowRight" && hasNext) onNavigate(index + 1);
    },
    [hasPrev, hasNext, index, onClose, onNavigate],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  if (!item) return null;

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      onClick={onClose}
    >
      <button
        type="button"
        className={styles.close}
        aria-label="关闭"
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
      >
        <X size={20} />
      </button>

      {hasPrev ? (
        <button
          type="button"
          className={`${styles.nav} ${styles.prev}`}
          aria-label="上一张"
          onClick={(event) => {
            event.stopPropagation();
            onNavigate(index - 1);
          }}
        >
          <ChevronLeft size={26} />
        </button>
      ) : null}

      <figure className={styles.figure} onClick={(event) => event.stopPropagation()}>
        <img className={styles.image} src={item.media.url} alt={item.media.alt ?? item.title} />
        <figcaption className={styles.caption}>
          <strong>{item.title}</strong>
          {item.description ? <span>{item.description}</span> : null}
          <span className={styles.meta}>
            {[item.tool, item.shotAt?.slice(0, 10)].filter(Boolean).join(" · ")}
          </span>
        </figcaption>
      </figure>

      {hasNext ? (
        <button
          type="button"
          className={`${styles.nav} ${styles.next}`}
          aria-label="下一张"
          onClick={(event) => {
            event.stopPropagation();
            onNavigate(index + 1);
          }}
        >
          <ChevronRight size={26} />
        </button>
      ) : null}
    </div>
  );
}
