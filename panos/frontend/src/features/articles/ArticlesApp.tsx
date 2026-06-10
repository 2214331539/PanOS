import { FileText, PenLine } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

import { useAuthStore } from "@/shared/stores/auth-store";
import { AppHeader } from "@/shared/ui/AppHeader";
import { Button } from "@/shared/ui/Button";
import { ContentLayout, SidebarButton } from "@/shared/ui/ContentLayout";
import { EmptyState } from "@/shared/ui/EmptyState";

import { type ArticleCard as ArticleCardData, useArticleCategories, useArticles } from "./api";
import { ArticleCard } from "./ArticleCard";
import { ArticleReader } from "./ArticleReader";
import styles from "./ArticlesApp.module.css";

type View = "category" | "time";

interface MonthGroup {
  label: string;
  items: ArticleCardData[];
}

function groupByMonth(articles: ArticleCardData[]): MonthGroup[] {
  const groups = new Map<string, ArticleCardData[]>();
  for (const article of articles) {
    const label = article.publishedAt
      ? `${article.publishedAt.slice(0, 4)} · ${article.publishedAt.slice(5, 7)}`
      : "未发布";
    const bucket = groups.get(label) ?? [];
    bucket.push(article);
    groups.set(label, bucket);
  }
  return [...groups.entries()].map(([label, items]) => ({ label, items }));
}

export function ArticlesApp() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [view, setView] = useState<View>("category");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const { data: categories } = useArticleCategories();
  const { data: articles, isLoading } = useArticles(
    view === "category" && activeCategory ? activeCategory : undefined,
  );

  if (selectedSlug) {
    return (
      <ArticleReader
        slug={selectedSlug}
        onNavigate={setSelectedSlug}
        onBack={() => setSelectedSlug(null)}
      />
    );
  }

  const list = articles ?? [];
  const isEmpty = !isLoading && list.length === 0;

  const renderCards = (items: ArticleCardData[]) => (
    <div className={styles.grid}>
      {items.map((article) => (
        <ArticleCard key={article.id} article={article} onOpen={setSelectedSlug} />
      ))}
    </div>
  );

  const action = (
    <div className={styles.tools}>
      <div className={styles.toggle} role="group" aria-label="分类方式">
        <button
          type="button"
          aria-pressed={view === "category"}
          className={view === "category" ? styles.toggleActive : styles.toggleBtn}
          onClick={() => setView("category")}
        >
          按分类
        </button>
        <button
          type="button"
          aria-pressed={view === "time"}
          className={view === "time" ? styles.toggleActive : styles.toggleBtn}
          onClick={() => setView("time")}
        >
          按时间
        </button>
      </div>
      {isAuthenticated ? (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            void navigate("/admin/articles");
          }}
        >
          <PenLine size={15} />
          写文章
        </Button>
      ) : null}
    </div>
  );

  const main = (
    <>
      <AppHeader eyebrow="Articles" title="正式文章与技术笔记" action={action} />
      {isLoading ? (
        <p className={styles.hint}>加载中…</p>
      ) : isEmpty ? (
        <EmptyState
          icon={<FileText size={30} />}
          title="这里还没有内容。"
          description="但一个新的想法可能很快会被放进来。点右上角「写文章」开始第一篇。"
        />
      ) : view === "time" ? (
        <div className={styles.timeline}>
          {groupByMonth(list).map((group) => (
            <section key={group.label}>
              <h2 className={styles.monthLabel}>{group.label}</h2>
              {renderCards(group.items)}
            </section>
          ))}
        </div>
      ) : (
        renderCards(list)
      )}
    </>
  );

  if (view === "time") {
    return <ContentLayout>{main}</ContentLayout>;
  }

  const sidebar = (
    <>
      <SidebarButton active={activeCategory === null} onClick={() => setActiveCategory(null)}>
        All Articles
      </SidebarButton>
      {(categories ?? []).map((category) => (
        <SidebarButton
          key={category.id}
          active={activeCategory === category.slug}
          onClick={() => setActiveCategory(category.slug)}
        >
          {category.name}
        </SidebarButton>
      ))}
    </>
  );

  return (
    <ContentLayout sidebar={sidebar} sidebarLabel="Article categories">
      {main}
    </ContentLayout>
  );
}
