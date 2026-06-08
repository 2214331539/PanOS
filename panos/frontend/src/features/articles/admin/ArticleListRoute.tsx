import { Plus } from "lucide-react";
import { Link } from "react-router";

import { AdminLayout } from "@/features/admin/AdminLayout";
import { Button } from "@/shared/ui/Button";

import { type ArticleStatus, useAdminArticles } from "./api";
import styles from "./ArticleListRoute.module.css";

const STATUS_LABEL: Record<ArticleStatus, string> = {
  draft: "草稿",
  published: "已发布",
  archived: "已归档",
};

const STATUS_CLASS: Record<ArticleStatus, string> = {
  draft: styles.draft,
  published: styles.published,
  archived: styles.archived,
};

export function ArticleListRoute() {
  const { data, isLoading } = useAdminArticles();
  const articles = data ?? [];

  return (
    <AdminLayout title="文章管理">
      <div className={styles.bar}>
        <span className={styles.count}>{articles.length} 篇</span>
        <Button asChild>
          <Link to="/admin/articles/new">
            <Plus size={15} />
            新建文章
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <p className={styles.hint}>加载中…</p>
      ) : articles.length === 0 ? (
        <p className={styles.hint}>还没有文章，点「新建文章」开始第一篇。</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>标题</th>
              <th>状态</th>
              <th>更新时间</th>
              <th aria-label="操作" />
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.id}>
                <td className={styles.titleCell}>
                  {article.title}
                  <span className={styles.slug}>/{article.slug}</span>
                </td>
                <td>
                  <span className={`${styles.badge} ${STATUS_CLASS[article.status]}`}>
                    {STATUS_LABEL[article.status]}
                  </span>
                </td>
                <td className={styles.muted}>{article.updatedAt.slice(0, 10)}</td>
                <td>
                  <Link to={`/admin/articles/${article.id}/edit`} className={styles.edit}>
                    编辑
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AdminLayout>
  );
}
