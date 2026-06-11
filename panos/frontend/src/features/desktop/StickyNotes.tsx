import type { PointerEvent as ReactPointerEvent } from "react";
import { useRef, useState } from "react";

import { useWidgets } from "./widgets-api";
import styles from "./StickyNotes.module.css";

interface DragState {
  pointerId: number;
  startX: number;
  startY: number;
  baseX: number;
  baseY: number;
}

// 经典 mac Stickies：贴在桌面上的黄色便签（widgets 表 type=sticky 驱动，可拖拽）。
function StickyNote({ text, rotate, index }: { text: string; rotate: number; index: number }) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const drag = useRef<DragState | null>(null);

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      baseX: offset.x,
      baseY: offset.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const state = drag.current;
    if (!state || state.pointerId !== event.pointerId) return;
    setOffset({
      x: state.baseX + (event.clientX - state.startX),
      y: state.baseY + (event.clientY - state.startY),
    });
  }

  function onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  return (
    <div
      className={styles.note}
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rotate}deg)`,
        top: 84 + index * 36,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      role="note"
    >
      {text.split("\n").map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  );
}

export function StickyNotes() {
  const { data: widgets } = useWidgets();
  const stickies = (widgets ?? []).filter((widget) => widget.type === "sticky");

  if (stickies.length === 0) {
    return null;
  }

  return (
    <div className={styles.layer} aria-label="Sticky notes">
      {stickies.map((widget, index) => {
        const text = typeof widget.payload.text === "string" ? widget.payload.text : widget.title;
        const rotate =
          typeof widget.payload.rotate === "number"
            ? widget.payload.rotate
            : index % 2 === 0
              ? -2
              : 1.6;
        return <StickyNote key={widget.id} text={text} rotate={rotate} index={index} />;
      })}
    </div>
  );
}
