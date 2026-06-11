import { ChevronLeft, ChevronRight, Plus, Trash2, X } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";

import { useAuthStore } from "@/shared/stores/auth-store";
import { Button } from "@/shared/ui/Button";

import {
  useCalendarEvents,
  useCreateCalendarEvent,
  useDeleteCalendarEvent,
} from "./calendar-api";
import styles from "./CalendarOverlay.module.css";

const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];

function toMonthKey(year: number, monthIndex: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
}

function toDateKey(year: number, monthIndex: number, day: number): string {
  return `${toMonthKey(year, monthIndex)}-${String(day).padStart(2, "0")}`;
}

// 时钟 Widget 点击后放大成的月历面板（macOS 式共享元素缩放，layoutId 与 Widget 对应）。
export function CalendarOverlay({ onClose }: { onClose: () => void }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [monthIndex, setMonthIndex] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<string>(
    toDateKey(today.getFullYear(), today.getMonth(), today.getDate()),
  );
  const [draft, setDraft] = useState("");

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const monthKey = toMonthKey(year, monthIndex);
  const { data: events } = useCalendarEvents(monthKey);
  const createEvent = useCreateCalendarEvent();
  const deleteEvent = useDeleteCalendarEvent();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, { id: string; title: string }[]>();
    for (const event of events ?? []) {
      const bucket = map.get(event.date) ?? [];
      bucket.push({ id: event.id, title: event.title });
      map.set(event.date, bucket);
    }
    return map;
  }, [events]);

  function shiftMonth(delta: number) {
    const next = new Date(year, monthIndex + delta, 1);
    setYear(next.getFullYear());
    setMonthIndex(next.getMonth());
  }

  // 周一为一周起始（与 macOS 中文环境一致）。
  const firstWeekday = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const todayKey = toDateKey(today.getFullYear(), today.getMonth(), today.getDate());
  const selectedEvents = eventsByDay.get(selectedDay) ?? [];

  async function submitDraft() {
    const title = draft.trim();
    if (!title || !selectedDay) return;
    await createEvent.mutateAsync({ date: selectedDay, title });
    setDraft("");
  }

  return (
    <div className={styles.backdropWrap}>
      <motion.button
        type="button"
        className={styles.backdrop}
        aria-label="关闭日历"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={onClose}
      />
      <motion.section
        layoutId="panos-calendar"
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label="日历与计划"
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
      >
        <header className={styles.header}>
          <div className={styles.monthNav}>
            <button type="button" aria-label="上个月" onClick={() => shiftMonth(-1)}>
              <ChevronLeft size={16} />
            </button>
            <h2>
              {year} 年 {monthIndex + 1} 月
            </h2>
            <button type="button" aria-label="下个月" onClick={() => shiftMonth(1)}>
              <ChevronRight size={16} />
            </button>
          </div>
          <button type="button" className={styles.close} aria-label="关闭日历" onClick={onClose}>
            <X size={16} />
          </button>
        </header>

        <div className={styles.weekdays} aria-hidden="true">
          {WEEKDAYS.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>

        <div className={styles.grid}>
          {Array.from({ length: firstWeekday }, (_, i) => (
            <span key={`pad-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dateKey = toDateKey(year, monthIndex, day);
            const hasEvents = eventsByDay.has(dateKey);
            const classNames = [styles.day];
            if (dateKey === todayKey) classNames.push(styles.today);
            if (dateKey === selectedDay) classNames.push(styles.selected);
            return (
              <button
                key={dateKey}
                type="button"
                className={classNames.join(" ")}
                aria-label={`${monthIndex + 1} 月 ${day} 日${hasEvents ? "（有计划）" : ""}`}
                onClick={() => setSelectedDay(dateKey)}
              >
                {day}
                {hasEvents ? <span className={styles.dot} aria-hidden="true" /> : null}
              </button>
            );
          })}
        </div>

        <div className={styles.agenda}>
          <h3>{selectedDay.slice(5).replace("-", " 月 ")} 日的计划</h3>
          {selectedEvents.length === 0 ? (
            <p className={styles.empty}>这一天还没有计划。</p>
          ) : (
            <ul>
              {selectedEvents.map((event) => (
                <li key={event.id}>
                  <span>{event.title}</span>
                  {isAuthenticated ? (
                    <button
                      type="button"
                      className={styles.remove}
                      aria-label={`删除计划 ${event.title}`}
                      disabled={deleteEvent.isPending}
                      onClick={() => deleteEvent.mutate(event.id)}
                    >
                      <Trash2 size={13} />
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          )}

          {isAuthenticated ? (
            <form
              className={styles.draftRow}
              onSubmit={(event) => {
                event.preventDefault();
                void submitDraft();
              }}
            >
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="添加计划…"
                maxLength={120}
                aria-label="新计划内容"
              />
              <Button type="submit" size="sm" disabled={createEvent.isPending || !draft.trim()}>
                <Plus size={14} />
                添加
              </Button>
            </form>
          ) : null}
        </div>
      </motion.section>
    </div>
  );
}
