import { lazy, Suspense, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { AdminLayout } from "@/features/admin/AdminLayout";
import { Button } from "@/shared/ui/Button";

import { useArticleCategories } from "../api";
import { type AdminArticleDetail, type ArticleStatus, useAdminArticle, useSaveArticle } from "./api";
import styles from "./ArticleEditorRoute.module.css";

const MarkdownEditor = lazy(() => import("./MarkdownEditor"));

export function ArticleEditorRoute() {
  const { id } = useParams();
  const { data: existing, isLoading } = useAdminArticle(id);

  if (id && isLoading) {
    return (
      <AdminLayout title="编辑文章">
        <p>加载中…</p>
      </AdminLayout>
    );
  }

  // 用 key 在加载到已有文章后重挂载表单，从 existing 初始化各字段（避免在 effect 里 setState）。
  return <EditorForm key={existing?.id ?? "new"} existing={existing} />;
}

function EditorForm({ existing }: { existing?: AdminArticleDetail }) {
  const navigate = useNavigate();
  const { data: categories } = useArticleCategories();
  const save = useSaveArticle();

  const [title, setTitle] = useState(existing?.title ?? "");
  const [slug, setSlug] = useState(existing?.slug ?? "");
  const [excerpt, setExcerpt] = useState(existing?.excerpt ?? "");
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? "");
  const [body, setBody] = useState(existing?.bodyMdx ?? "");
  const [error, setError] = useState<string | null>(null);

  async function submit(status: ArticleStatus) {
    if (!title.trim() || !excerpt.trim()) {
      setError("标题和摘要为必填项");
      return;
    }
    setError(null);
    try {
      await save.mutateAsync({
        id: existing?.id,
        input: {
          title,
          slug: slug || undefined,
          excerpt,
          bodyMdx: body,
          categoryId: categoryId || null,
          status,
        },
      });
      void navigate("/admin/articles");
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    }
  }

  return (
    <AdminLayout title={existing ? "编辑文章" : "写文章"}>
      <div className={styles.form}>
        <label className={styles.field}>
          <span>标题</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="文章标题" />
        </label>

        <div className={styles.row}>
          <label className={styles.field}>
            <span>Slug（留空自动生成）</span>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="my-article" />
          </label>
          <label className={styles.field}>
            <span>分类</span>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">未分类</option>
              {(categories ?? []).map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className={styles.field}>
          <span>摘要</span>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            placeholder="一句话摘要，显示在卡片上"
          />
        </label>

        <div className={styles.field}>
          <span>正文（Markdown，拖入或粘贴图片自动上传）</span>
          <div className={styles.editorWrap}>
            <Suspense fallback={<div className={styles.loading}>编辑器加载中…</div>}>
              <MarkdownEditor markdown={body} onChange={setBody} />
            </Suspense>
          </div>
        </div>

        {error ? <p className={styles.error}>{error}</p> : null}

        <div className={styles.actions}>
          <Button
            variant="ghost"
            onClick={() => {
              void navigate("/admin/articles");
            }}
          >
            取消
          </Button>
          <Button variant="secondary" onClick={() => void submit("draft")} disabled={save.isPending}>
            存草稿
          </Button>
          <Button onClick={() => void submit("published")} disabled={save.isPending}>
            发布
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
