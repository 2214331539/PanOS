import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { AdminLayout } from "@/features/admin/AdminLayout";
import styles from "@/features/admin/AdminCrud.module.css";
import { apiGet, apiSend } from "@/shared/lib/api/client";
import { Button } from "@/shared/ui/Button";

import type { IdeaStage } from "../api";

interface AdminIdea {
  id: string;
  title: string;
  summary: string;
  status: IdeaStage;
  source: string | null;
  visibility: string;
  updatedAt: string;
}

const STAGE_LABEL: Record<IdeaStage, string> = {
  seed: "Seed",
  growing: "Growing",
  draft: "Draft",
  built: "Built",
};

export function IdeasAdminRoute() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "ideas"],
    queryFn: async () => (await apiGet<AdminIdea[]>("/admin/ideas", { auth: true })).data,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "ideas"] });
    void queryClient.invalidateQueries({ queryKey: ["ideas"] });
  };
  const save = useMutation({
    mutationFn: async ({ id, input }: { id?: string; input: Record<string, unknown> }) =>
      id
        ? apiSend(`/admin/ideas/${id}`, "PATCH", input, { auth: true })
        : apiSend("/admin/ideas", "POST", input, { auth: true }),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: async (id: string) =>
      apiSend(`/admin/ideas/${id}`, "DELETE", undefined, { auth: true }),
    onSuccess: invalidate,
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [stage, setStage] = useState<IdeaStage>("seed");
  const [source, setSource] = useState("");
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setEditingId(null);
    setTitle("");
    setSummary("");
    setStage("seed");
    setSource("");
    setError(null);
  }

  async function submit() {
    if (!title.trim() || !summary.trim()) {
      setError("标题和一句话想法为必填");
      return;
    }
    setError(null);
    try {
      await save.mutateAsync({
        id: editingId ?? undefined,
        input: { title, summary, status: stage, source: source || null },
      });
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    }
  }

  const ideas = data ?? [];

  return (
    <AdminLayout title="想法管理">
      <section className={styles.formCard}>
        <h2 className={styles.formTitle}>{editingId ? "编辑想法" : "种一颗新想法"}</h2>
        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span>标题</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label className={styles.field}>
            <span>阶段</span>
            <select value={stage} onChange={(e) => setStage(e.target.value as IdeaStage)}>
              {(Object.keys(STAGE_LABEL) as IdeaStage[]).map((key) => (
                <option key={key} value={key}>
                  {STAGE_LABEL[key]}
                </option>
              ))}
            </select>
          </label>
          <label className={`${styles.field} ${styles.fullRow}`}>
            <span>一句话想法</span>
            <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={2} />
          </label>
          <label className={`${styles.field} ${styles.fullRow}`}>
            <span>来源（可选）</span>
            <input value={source} onChange={(e) => setSource(e.target.value)} placeholder="散步时 / 读某篇文章…" />
          </label>
          <div className={styles.formActions}>
            {editingId ? (
              <Button variant="ghost" onClick={reset}>
                取消
              </Button>
            ) : null}
            <Button onClick={() => void submit()} disabled={save.isPending}>
              {editingId ? "保存" : "添加"}
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
              <th>想法</th>
              <th>阶段</th>
              <th aria-label="操作" />
            </tr>
          </thead>
          <tbody>
            {ideas.map((idea) => (
              <tr key={idea.id}>
                <td className={styles.titleCell}>
                  {idea.title}
                  <span className={styles.sub}>{idea.summary}</span>
                </td>
                <td>
                  <span className={`${styles.badge} ${idea.status === "built" ? styles.badgeOn : ""}`}>
                    {STAGE_LABEL[idea.status]}
                  </span>
                </td>
                <td className={styles.actions}>
                  <button
                    type="button"
                    className={styles.edit}
                    onClick={() => {
                      setEditingId(idea.id);
                      setTitle(idea.title);
                      setSummary(idea.summary);
                      setStage(idea.status);
                      setSource(idea.source ?? "");
                    }}
                  >
                    编辑
                  </button>
                  <button
                    type="button"
                    className={styles.delete}
                    disabled={remove.isPending}
                    onClick={() => {
                      if (window.confirm(`确定删除「${idea.title}」？`)) {
                        remove.mutate(idea.id);
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
