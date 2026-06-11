import { ArrowUpRight, Eye } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

import { useViewSummary } from "@/shared/lib/api/views";

import { useCalendarEvents } from "./calendar-api";
import { CalendarOverlay } from "./CalendarOverlay";
import type { DesktopWidget } from "./widgets-api";
import { useGithubContributions, useWidgets } from "./widgets-api";
import styles from "./Widgets.module.css";

// 时钟 Widget：点击放大为月历（macOS 式共享元素缩放）。
function ClockWidget({ onExpand }: { onExpand: () => void }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <motion.button
      type="button"
      layoutId="panos-calendar"
      className={`${styles.widget} ${styles.clickable} ${styles.span2}`}
      onClick={onExpand}
      whileTap={{ scale: 0.97 }}
      aria-label="打开日历查看计划"
      title="点击查看日历计划"
    >
      <p className={styles.clockTime}>
        {now.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
      </p>
      <p className={styles.clockDate}>
        {now.toLocaleDateString("zh-CN", { month: "long", day: "numeric", weekday: "long" })}
      </p>
      <span className={styles.expandHint} aria-hidden="true">
        <ArrowUpRight size={13} />
      </span>
    </motion.button>
  );
}

function NowWidget({ widget }: { widget: DesktopWidget }) {
  const lines = Array.isArray(widget.payload.lines) ? (widget.payload.lines as string[]) : [];
  return (
    <section className={`${styles.widget} ${styles.span2}`}>
      <h2>{widget.title}</h2>
      {lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </section>
  );
}

// 最近 12 周贡献缩略热力图（7 行 × 12 列，列为周）。整卡可点，跳转 GitHub 主页。
const HEATMAP_DAYS = 7 * 12;

function GithubWidget({ widget }: { widget: DesktopWidget }) {
  const username = typeof widget.payload.username === "string" ? widget.payload.username : null;
  const { data: contributions } = useGithubContributions(username);

  if (!username || !contributions || contributions.length === 0) {
    return null;
  }
  const recent = contributions.slice(-HEATMAP_DAYS);
  const total = recent.reduce((sum, day) => sum + day.count, 0);

  return (
    <motion.a
      href={`https://github.com/${username}`}
      target="_blank"
      rel="noreferrer"
      className={`${styles.widget} ${styles.clickable} ${styles.span2}`}
      whileTap={{ scale: 0.97 }}
      aria-label={`打开 GitHub 主页 @${username}`}
      title={`打开 github.com/${username}`}
    >
      <h2>{widget.title}</h2>
      <div className={styles.heatmap} aria-label={`最近 12 周 ${total} 次贡献`}>
        {recent.map((day) => (
          <span
            key={day.date}
            className={styles.heatCell}
            data-level={day.level}
            title={`${day.date} · ${day.count}`}
          />
        ))}
      </div>
      <p className={styles.widgetMeta}>最近 12 周 {total} 次提交 · @{username}</p>
      <span className={styles.expandHint} aria-hidden="true">
        <ArrowUpRight size={13} />
      </span>
    </motion.a>
  );
}

// 月历小部件：当月缩略 + 事件圆点，点击放大为完整日历（复用 CalendarOverlay）。
function MiniCalendarWidget({ onExpand }: { onExpand: () => void }) {
  const today = new Date();
  const monthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const { data: events } = useCalendarEvents(monthKey);
  const eventDays = new Set((events ?? []).map((event) => Number(event.date.slice(8, 10))));

  const firstWeekday = (new Date(today.getFullYear(), today.getMonth(), 1).getDay() + 6) % 7;
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  return (
    <motion.button
      type="button"
      className={`${styles.widget} ${styles.clickable}`}
      onClick={onExpand}
      whileTap={{ scale: 0.97 }}
      aria-label="打开月历"
      title="点击查看完整日历"
    >
      <h2>{today.getMonth() + 1} 月</h2>
      <div className={styles.miniGrid} aria-hidden="true">
        {Array.from({ length: firstWeekday }, (_, i) => (
          <span key={`pad-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const isToday = day === today.getDate();
          return (
            <span
              key={day}
              className={`${styles.miniDay} ${isToday ? styles.miniToday : ""} ${eventDays.has(day) ? styles.miniHasEvent : ""}`}
            >
              {day}
            </span>
          );
        })}
      </div>
    </motion.button>
  );
}

function VisitorsWidget({ widget }: { widget: DesktopWidget }) {
  const { data: summary } = useViewSummary();
  if (!summary) {
    return null;
  }
  return (
    <section className={styles.widget}>
      <h2>{widget.title}</h2>
      <p className={styles.visitorCount}>
        <Eye size={15} aria-hidden="true" />
        {summary.total.toLocaleString()} 次浏览
      </p>
      <p className={styles.widgetMeta}>今日 {summary.today.toLocaleString()}</p>
    </section>
  );
}

export function Widgets() {
  const { data: widgets } = useWidgets();
  const [calendarOpen, setCalendarOpen] = useState(false);

  if (!widgets || widgets.length === 0) {
    return null;
  }

  return (
    <>
      <aside className={styles.widgets} aria-label="PanOS widgets">
        {widgets.map((widget) => {
          switch (widget.type) {
            case "clock":
              // 放大时卸载 Widget 本体，让共享 layoutId 完成 morph。
              return calendarOpen ? null : (
                <ClockWidget key={widget.id} onExpand={() => setCalendarOpen(true)} />
              );
            case "now":
              return <NowWidget key={widget.id} widget={widget} />;
            case "github":
              return <GithubWidget key={widget.id} widget={widget} />;
            case "visitors":
              return <VisitorsWidget key={widget.id} widget={widget} />;
            case "calendar":
              return <MiniCalendarWidget key={widget.id} onExpand={() => setCalendarOpen(true)} />;
            case "sticky":
              // 便签不进 Widget 棋盘，由 StickyNotes 贴在桌面上。
              return null;
            default:
              // 未知类型（后台新增但前端未实现）直接跳过，不破坏桌面。
              return null;
          }
        })}
      </aside>
      <AnimatePresence>
        {calendarOpen ? <CalendarOverlay onClose={() => setCalendarOpen(false)} /> : null}
      </AnimatePresence>
    </>
  );
}
