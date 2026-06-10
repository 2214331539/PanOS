import { ArrowLeft, Check, ExternalLink, Link2 } from "lucide-react";
import { lazy, Suspense, useState } from "react";

import { Button } from "@/shared/ui/Button";
import { EmptyState } from "@/shared/ui/EmptyState";

import { STATUS_LABEL, useProject } from "./api";
import styles from "./ProjectReader.module.css";

const ArticleBody = lazy(() => import("@/features/articles/ArticleBody"));

const SECTION_TITLES: [key: "backgroundMdx" | "architectureMdx" | "processMdx" | "roadmapMdx", title: string][] = [
  ["backgroundMdx", "项目背景"],
  ["architectureMdx", "技术架构"],
  ["processMdx", "开发过程"],
  ["roadmapMdx", "未来计划"],
];

export function ProjectReader({
  slug,
  onBack,
  backLabel = "返回列表",
}: {
  slug: string;
  onBack?: () => void;
  backLabel?: string;
}) {
  const { data, isLoading, isError } = useProject(slug);
  const [copied, setCopied] = useState(false);

  function share() {
    const url = `${window.location.origin}/projects/${slug}`;
    void navigator.clipboard?.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  if (isLoading) {
    return <div className={styles.loading}>Booting PanOS…</div>;
  }

  if (isError || !data) {
    return (
      <EmptyState
        icon={<Link2 size={30} />}
        title="这个项目不存在"
        description="也许它还停留在某个想法清单里。"
      />
    );
  }

  return (
    <article className={styles.reader}>
      <div className={styles.topbar}>
        {onBack ? (
          <button type="button" className={styles.back} onClick={onBack}>
            <ArrowLeft size={15} />
            {backLabel}
          </button>
        ) : (
          <span />
        )}
        <button type="button" className={styles.share} onClick={share}>
          {copied ? <Check size={15} /> : <Link2 size={15} />}
          {copied ? "已复制链接" : "分享"}
        </button>
      </div>

      <div className={styles.metaRow}>
        <span className={styles.status}>{STATUS_LABEL[data.status]}</span>
        {data.category ? <span>{data.category.name}</span> : null}
      </div>
      <h1 className={styles.title}>{data.name}</h1>
      <p className={styles.tagline}>{data.tagline}</p>

      {data.techStack.length > 0 ? (
        <div className={styles.stack}>
          {data.techStack.map((tech) => (
            <span key={tech} className={styles.tech}>
              {tech}
            </span>
          ))}
        </div>
      ) : null}

      {data.links.length > 0 ? (
        <div className={styles.links}>
          {data.links.map((link) => (
            <Button key={link.url} asChild variant="secondary" size="sm">
              <a href={link.url} target="_blank" rel="noreferrer">
                <ExternalLink size={14} />
                {link.label}
              </a>
            </Button>
          ))}
        </div>
      ) : null}

      {data.cover ? (
        <img className={styles.cover} src={data.cover.url} alt={data.cover.alt ?? data.name} />
      ) : null}

      <Suspense fallback={<div className={styles.loading}>Loading…</div>}>
        {SECTION_TITLES.map(([key, title]) =>
          data[key] ? (
            <section key={key}>
              <h2 className={styles.sectionTitle}>{title}</h2>
              <ArticleBody content={data[key]} />
            </section>
          ) : null,
        )}
      </Suspense>
    </article>
  );
}
