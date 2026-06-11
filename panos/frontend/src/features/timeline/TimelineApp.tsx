import { Atom, Briefcase, Clapperboard, Clock, PenLine, Sprout } from "lucide-react";
import { useMemo, useState } from "react";

import { AppHeader } from "@/shared/ui/AppHeader";
import { ContentLayout, SidebarButton } from "@/shared/ui/ContentLayout";
import { EmptyState } from "@/shared/ui/EmptyState";

import type { TimelineEvent, TimelineType } from "./api";
import { useTimeline } from "./api";
import styles from "./TimelineApp.module.css";

const TYPE_META: Record<TimelineType, { label: string; icon: typeof Atom; className: string }> = {
  research: { label: "研究", icon: Atom, className: "research" },
  project: { label: "项目", icon: Briefcase, className: "project" },
  writing: { label: "写作", icon: PenLine, className: "writing" },
  content: { label: "内容", icon: Clapperboard, className: "content" },
  life: { label: "生活", icon: Sprout, className: "life" },
};

interface MonthGroup {
  label: string;
  items: TimelineEvent[];
}

function groupByMonth(events: TimelineEvent[]): MonthGroup[] {
  const groups = new Map<string, TimelineEvent[]>();
  for (const event of events) {
    const label = `${event.date.slice(0, 4)} 年 ${Number(event.date.slice(5, 7))} 月`;
    const bucket = groups.get(label) ?? [];
    bucket.push(event);
    groups.set(label, bucket);
  }
  return [...groups.entries()].map(([label, items]) => ({ label, items }));
}

export function TimelineApp() {
  const [activeType, setActiveType] = useState<TimelineType | null>(null);
  const { data: events, isLoading } = useTimeline(activeType ?? undefined);
  const groups = useMemo(() => groupByMonth(events ?? []), [events]);

  const sidebar = (
    <>
      <SidebarButton active={activeType === null} onClick={() => setActiveType(null)}>
        全部动态
      </SidebarButton>
      {(Object.keys(TYPE_META) as TimelineType[]).map((type) => (
        <SidebarButton
          key={type}
          active={activeType === type}
          onClick={() => setActiveType(type)}
        >
          {TYPE_META[type].label}
        </SidebarButton>
      ))}
    </>
  );

  return (
    <ContentLayout sidebar={sidebar} sidebarLabel="Timeline types">
      <AppHeader eyebrow="Timeline" title="时间线：我最近在做什么" />
      {isLoading ? (
        <p className={styles.hint}>加载中…</p>
      ) : groups.length === 0 ? (
        <EmptyState
          icon={<Clock size={30} />}
          title="这条时间线还是空的。"
          description="动态会随着研究、写作和创作不断生长。"
        />
      ) : (
        <div className={styles.timeline}>
          {groups.map((group) => (
            <section key={group.label} className={styles.month}>
              <h2 className={styles.monthLabel}>{group.label}</h2>
              <ul className={styles.events}>
                {group.items.map((event) => {
                  const meta = TYPE_META[event.type];
                  const Icon = meta.icon;
                  return (
                    <li key={event.id} className={styles.event}>
                      <span className={`${styles.marker} ${styles[meta.className]}`}>
                        <Icon size={13} aria-hidden="true" />
                      </span>
                      <div className={styles.eventBody}>
                        <div className={styles.eventHead}>
                          <strong>
                            {event.url ? (
                              <a href={event.url} target="_blank" rel="noreferrer">
                                {event.title}
                              </a>
                            ) : (
                              event.title
                            )}
                          </strong>
                          <time className={styles.date}>{event.date.slice(5)}</time>
                        </div>
                        {event.description ? <p>{event.description}</p> : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </ContentLayout>
  );
}
