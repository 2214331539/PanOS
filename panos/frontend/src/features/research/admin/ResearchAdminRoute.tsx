import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { AdminLayout } from "@/features/admin/AdminLayout";
import styles from "@/features/admin/AdminCrud.module.css";
import { apiGet, apiSend } from "@/shared/lib/api/client";
import { Button } from "@/shared/ui/Button";

interface AdminResearch {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  progress: number | null;
  status: "draft" | "published" | "archived";
  updatedAt: string;
}

interface ResearchDetail extends AdminResearch {
  bodyMdx: string;
}

export function ResearchAdminRoute() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "research"],
    queryFn: async () => (await apiGet<AdminResearch[]>("/admin/research", { auth: true })).data,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "research"] });
    void queryClient.invalidateQueries({ queryKey: ["research"] });
  };
  const save = useMutation({
    mutationFn: async ({ id, input }: { id?: string; input: Record<string, unknown> }) =>
      id
        ? apiSend(`/admin/research/${id}`, "PATCH", input, { auth: true })
        : apiSend("/admin/research", "POST", input, { auth: true }),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: async (id: string) =>
      apiSend(`/admin/research/${id}`, "DELETE", undefined, { auth: true }),
    onSuccess: invalidate,
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [progress, setProgress] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setEditingId(null);
    setTitle("");
    setExcerpt("");
    setProgress("");
    setBody("");
    setError(null);
  }

  async function startEdit(note: AdminResearch) {
    setEditingId(note.id);
    setTitle(note.title);
    setExcerpt(note.excerpt);
    setProgress(note.progress === null ? "" : String(note.progress));
    // 列表接口不带正文，编辑时从公开详情取（草稿则留空，由站长重新粘贴）。
    try {
      const detail = await apiGet<ResearchDetail>(`/research/${note.slug}`);
      setBody(detail.data.bodyMdx);
    } catch {
      setBody("");
    }
  }

  async function submit(status: "draft" | "published") {
    if (!title.trim() || !excerpt.trim()) {
      setError("标题和摘要为必填");
      return;
    }
    const progressValue = progress === "" ? null : Number(progress);
    if (progressValue !== null && (Number.isNaN(progressValue) || progressValue < 0 || progressValue > 100)) {
      setError("进度需为 0~100 的数字");
      return;
    }
    setError(null);
    try {
      await save.mutateAsync({
        id: editingId ?? undefined,
        input: { title, excerpt, bodyMdx: body, progress: progressValue, status },
      });
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    }
  }

  const notes = data ?? [];

  return (
    <AdminLayout title="研究笔记管理">
      <section className={styles.formCard}>
        <h2 className={styles.formTitle}>{editingId ? "编辑研究笔记" : "新建研究笔记"}</h2>
        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span>标题</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label className={styles.field}>
            <span>进度（0~100，可空）</span>
            <input
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
              inputMode="numeric"
              placeholder="60"
            />
          </label>
          <label className={`${styles.field} ${styles.fullRow}`}>
            <span>摘要</span>
            <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} />
          </label>
          <label className={`${styles.field} ${styles.fullRow} ${styles.mono}`}>
            <span>正文（Markdown）</span>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={8} />
          </label>
          <div className={styles.formActions}>
            {editingId ? (
              <Button variant="ghost" onClick={reset}>
                取消
              </Button>
            ) : null}
            <Button variant="secondary" onClick={() => void submit("draft")} disabled={save.isPending}>
              存草稿
            </Button>
            <Button onClick={() => void submit("published")} disabled={save.isPending}>
              发布
            </Button>
          </div>
        </div>
        {error ? <p className={styles.error}>{error}</p> : null}
      </section>

      {isLoading ? (
        <p className={styles.hint}>加载中…</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>标题</th>
              <th>进度</th>
              <th>状态</th>
              <th aria-label="操作" />
            </tr>
          </thead>
          <tbody>
            {notes.map((note) => (
              <tr key={note.id}>
                <td className={styles.titleCell}>
                  {note.title}
                  <span className={styles.sub}>/{note.slug}</span>
                </td>
                <td className={styles.muted}>
                  {note.progress === null ? "—" : `${note.progress}%`}
                </td>
                <td>
                  <span
                    className={`${styles.badge} ${note.status === "published" ? styles.badgeOn : ""}`}
                  >
                    {note.status === "published" ? "已发布" : note.status === "draft" ? "草稿" : "已归档"}
                  </span>
                </td>
                <td className={styles.actions}>
                  <button type="button" className={styles.edit} onClick={() => void startEdit(note)}>
                    编辑
                  </button>
                  <button
                    type="button"
                    className={styles.delete}
                    disabled={remove.isPending}
                    onClick={() => {
                      if (window.confirm(`确定删除「${note.title}」？`)) {
                        remove.mutate(note.id);
                      }
                    }}
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AdminLayout>
  );
}
