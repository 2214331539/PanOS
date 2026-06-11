import { Eye } from "lucide-react";
import { useEffect, useState } from "react";

import { useViewSummary } from "@/shared/lib/api/views";

import type { DesktopWidget } from "./widgets-api";
import { useGithubContributions, useWidgets } from "./widgets-api";
import styles from "./Widgets.module.css";

function ClockWidget() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section className={styles.widget}>
      <p className={styles.clockTime}>
        {now.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
      </p>
      <p className={styles.clockDate}>
        {now.toLocaleDateString("zh-CN", { month: "long", day: "numeric", weekday: "long" })}
      </p>
    </section>
  );
}

function NowWidget({ widget }: { widget: DesktopWidget }) {
  const lines = Array.isArray(widget.payload.lines) ? (widget.payload.lines as string[]) : [];
  return (
    <section className={styles.widget}>
      <h2>{widget.title}</h2>
      {lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </section>
  );
}

// 最近 12 周贡献缩略热力图（7 行 × 12 列，列为周）。
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
    <section className={styles.widget}>
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
    </section>
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

function renderWidget(widget: DesktopWidget) {
  switch (widget.type) {
    case "clock":
      return <ClockWidget key={widget.id} />;
    case "now":
      return <NowWidget key={widget.id} widget={widget} />;
    case "github":
      return <GithubWidget key={widget.id} widget={widget} />;
    case "visitors":
      return <VisitorsWidget key={widget.id} widget={widget} />;
    default:
      // 未知类型（后台新增但前端未实现）直接跳过，不破坏桌面。
      return null;
  }
}

export function Widgets() {
  const { data: widgets } = useWidgets();

  if (!widgets || widgets.length === 0) {
    return null;
  }

  return (
    <aside className={styles.widgets} aria-label="PanOS widgets">
      {widgets.map(renderWidget)}
    </aside>
  );
}
