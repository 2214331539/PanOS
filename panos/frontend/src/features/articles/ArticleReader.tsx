import { ArrowLeft, Check, Clock, Link2 } from "lucide-react";
import { lazy, Suspense, useState } from "react";

import { EmptyState } from "@/shared/ui/EmptyState";

import { useArticle } from "./api";
import styles from "./ArticleReader.module.css";

const MarkdownBody = lazy(() => import("@/shared/markdown/MarkdownBody"));

function formatDate(iso: string | null): string {
  return iso ? iso.slice(0, 10) : "";
}

export function ArticleReader({
  slug,
  onNavigate,
  onBack,
  backLabel = "返回列表",
}: {
  slug: string;
  onNavigate: (slug: string) => void;
  onBack?: () => void;
  backLabel?: string;
}) {
  const { data, isLoading, isError } = useArticle(slug);
  const [copied, setCopied] = useState(false);

  function share() {
    const url = `${window.location.origin}/articles/${slug}`;
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
        title="这篇文章不存在"
        description="也许它还只是一个没被写下来的想法。"
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
        {data.category ? <span className={styles.cat}>{data.category.name}</span> : null}
        {data.publishedAt ? <span>{formatDate(data.publishedAt)}</span> : null}
        {data.readingMinutes ? (
          <span>
            <Clock size={13} style={{ verticalAlign: "-2px" }} /> {data.readingMinutes} min
          </span>
        ) : null}
      </div>
      <h1 className={styles.title}>{data.title}</h1>
      <p className={styles.excerpt}>{data.excerpt}</p>

      <Suspense fallback={<div className={styles.loading}>Loading…</div>}>
        <MarkdownBody content={data.bodyMdx} />
      </Suspense>

      {data.previous || data.next ? (
        <>
          <hr className={styles.divider} />
          <nav className={styles.pager}>
            {data.previous ? (
              <button
                type="button"
                className={styles.pagerItem}
                onClick={() => onNavigate(data.previous!.slug)}
              >
                <span className={styles.pagerLabel}>← 上一篇</span>
                {data.previous.title}
              </button>
            ) : (
              <span />
            )}
            {data.next ? (
              <button
                type="button"
                className={`${styles.pagerItem} ${styles.next}`}
                onClick={() => onNavigate(data.next!.slug)}
              >
                <span className={styles.pagerLabel}>下一篇 →</span>
                {data.next.title}
              </button>
            ) : (
              <span />
            )}
          </nav>
        </>
      ) : null}
    </article>
  );
}
