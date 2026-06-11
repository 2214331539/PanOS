import { Lightbulb } from "lucide-react";

import { AppHeader } from "@/shared/ui/AppHeader";
import { ContentLayout } from "@/shared/ui/ContentLayout";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Hint } from "@/shared/ui/Hint";

import type { Idea, IdeaStage } from "./api";
import { useIdeas } from "./api";
import styles from "./IdeasApp.module.css";

// 想法生命周期：Seed → Growing → Draft → Built（数字花园的四个阶段）。
const STAGES: { stage: IdeaStage; label: string; hint: string }[] = [
  { stage: "seed", label: "Seed", hint: "刚冒出来的念头" },
  { stage: "growing", label: "Growing", hint: "正在生长" },
  { stage: "draft", label: "Draft", hint: "已成草稿" },
  { stage: "built", label: "Built", hint: "做出来了" },
];

function IdeaCard({ idea }: { idea: Idea }) {
  return (
    <article className={styles.card}>
      <h3>{idea.title}</h3>
      <p>{idea.summary}</p>
      {idea.source ? <span className={styles.source}>来自：{idea.source}</span> : null}
    </article>
  );
}

export function IdeasApp() {
  const { data: ideas, isLoading } = useIdeas();
  const list = ideas ?? [];

  return (
    <ContentLayout>
      <AppHeader eyebrow="Ideas" title="想法花园：从念头到现实" />
      {isLoading ? (
        <p className={styles.hint}>加载中…</p>
      ) : list.length === 0 ? (
        <EmptyState
          icon={<Lightbulb size={30} />}
          title="花园还空着。"
          description="第一颗种子很快会被种下来。"
        />
      ) : (
        <div className={styles.stages}>
          {STAGES.map(({ stage, label, hint }) => {
            const items = list.filter((idea) => idea.status === stage);
            if (items.length === 0) return null;
            return (
              <section key={stage} className={styles.stageColumn}>
                <header className={styles.stageHeader}>
                  <span className={`${styles.stageBadge} ${styles[stage]}`}>{label}</span>
                  <span className={styles.stageHint}>
                    {hint} · {items.length}
                  </span>
                </header>
                <div className={styles.cards}>
                  {items.map((idea) => (
                    <IdeaCard key={idea.id} idea={idea} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
      <Hint>想法按生命周期生长：Seed → Growing → Draft → Built。</Hint>
    </ContentLayout>
  );
}
