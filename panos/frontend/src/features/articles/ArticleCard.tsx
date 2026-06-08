import type { ArticleCard as ArticleCardData } from "./api";
import styles from "./ArticleCard.module.css";

function formatDate(iso: string | null): string {
  return iso ? iso.slice(0, 10) : "";
}

export function ArticleCard({
  article,
  onOpen,
}: {
  article: ArticleCardData;
  onOpen: (slug: string) => void;
}) {
  return (
    <button type="button" className={styles.card} onClick={() => onOpen(article.slug)}>
      {article.cover ? (
        <img
          className={styles.cover}
          src={article.cover.url}
          alt={article.cover.alt ?? article.title}
        />
      ) : (
        <div className={styles.coverFallback} aria-hidden="true">
          {article.title.slice(0, 1)}
        </div>
      )}
      <div className={styles.body}>
        <div className={styles.meta}>
          {article.category ? <span className={styles.cat}>{article.category.name}</span> : null}
          {article.publishedAt ? <span>{formatDate(article.publishedAt)}</span> : null}
          {article.readingMinutes ? <span>· {article.readingMinutes} min</span> : null}
        </div>
        <h3 className={styles.title}>{article.title}</h3>
        <p className={styles.excerpt}>{article.excerpt}</p>
      </div>
    </button>
  );
}
