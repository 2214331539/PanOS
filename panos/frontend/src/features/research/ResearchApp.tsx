import { ArrowLeft, Atom } from "lucide-react";
import { lazy, Suspense, useState } from "react";

import { AppHeader } from "@/shared/ui/AppHeader";
import { ContentLayout } from "@/shared/ui/ContentLayout";
import { EmptyState } from "@/shared/ui/EmptyState";

import { useResearchList, useResearchNote } from "./api";
import styles from "./ResearchApp.module.css";

const MarkdownBody = lazy(() => import("@/shared/markdown/MarkdownBody"));

function ResearchReader({ slug, onBack }: { slug: string; onBack: () => void }) {
  const { data, isLoading } = useResearchNote(slug);

  if (isLoading || !data) {
    return <p className={styles.hint}>加载中…</p>;
  }

  return (
    <article>
      <button type="button" className={styles.back} onClick={onBack}>
        <ArrowLeft size={15} />
        返回列表
      </button>
      <h1 className={styles.title}>{data.title}</h1>
      <p className={styles.excerpt}>{data.excerpt}</p>
      {data.progress !== null ? (
        <div className={styles.progressRow}>
          <div className={styles.progressTrack} aria-label={`进度 ${data.progress}%`}>
            <div className={styles.progressFill} style={{ width: `${data.progress}%` }} />
          </div>
          <span className={styles.progressText}>{data.progress}%</span>
        </div>
      ) : null}
      <Suspense fallback={<p className={styles.hint}>Loading…</p>}>
        <MarkdownBody content={data.bodyMdx} />
      </Suspense>
    </article>
  );
}

export function ResearchApp() {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const { data: notes, isLoading } = useResearchList();
  const list = notes ?? [];

  if (selectedSlug) {
    return (
      <ContentLayout>
        <ResearchReader slug={selectedSlug} onBack={() => setSelectedSlug(null)} />
      </ContentLayout>
    );
  }

  return (
    <ContentLayout>
      <AppHeader eyebrow="Research" title="研究方向与进行中的探索" />
      {isLoading ? (
        <p className={styles.hint}>加载中…</p>
      ) : list.length === 0 ? (
        <EmptyState
          icon={<Atom size={30} />}
          title="还没有公开的研究笔记。"
          description="正在进行的探索会陆续整理到这里。"
        />
      ) : (
        <div className={styles.list}>
          {list.map((note) => (
            <button
              key={note.id}
              type="button"
              className={styles.card}
              onClick={() => setSelectedSlug(note.slug)}
            >
              <div className={styles.cardHead}>
                <h3>{note.title}</h3>
                {note.startedAt ? (
                  <span className={styles.date}>始于 {note.startedAt.slice(0, 7)}</span>
                ) : null}
              </div>
              <p>{note.excerpt}</p>
              {note.progress !== null ? (
                <div className={styles.progressRow}>
                  <div className={styles.progressTrack} aria-label={`进度 ${note.progress}%`}>
                    <div className={styles.progressFill} style={{ width: `${note.progress}%` }} />
                  </div>
                  <span className={styles.progressText}>{note.progress}%</span>
                </div>
              ) : null}
            </button>
          ))}
        </div>
      )}
    </ContentLayout>
  );
}
