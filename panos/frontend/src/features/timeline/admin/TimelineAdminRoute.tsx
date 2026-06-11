import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { AdminLayout } from "@/features/admin/AdminLayout";
import styles from "@/features/admin/AdminCrud.module.css";
import { apiGet, apiSend } from "@/shared/lib/api/client";
import { Button } from "@/shared/ui/Button";

import type { TimelineType } from "../api";

interface AdminTimeline {
  id: string;
  date: string;
  type: TimelineType;
  title: string;
  description: string | null;
  url: string | null;
  updatedAt: string;
}

const TYPE_LABEL: Record<TimelineType, string> = {
  research: "研究",
  project: "项目",
  writing: "写作",
  content: "内容",
  life: "生活",
};

export function TimelineAdminRoute() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "timeline"],
    queryFn: async () => (await apiGet<AdminTimeline[]>("/admin/timeline", { auth: true })).data,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "timeline"] });
    void queryClient.invalidateQueries({ queryKey: ["timeline"] });
  };
  const save = useMutation({
    mutationFn: async ({ id, input }: { id?: string; input: Record<string, unknown> }) =>
      id
        ? apiSend(`/admin/timeline/${id}`, "PATCH", input, { auth: true })
        : apiSend("/admin/timeline", "POST", input, { auth: true }),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: async (id: string) =>
      apiSend(`/admin/timeline/${id}`, "DELETE", undefined, { auth: true }),
    onSuccess: invalidate,
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [type, setType] = useState<TimelineType>("project");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setEditingId(null);
    setDate("");
    setType("project");
    setTitle("");
    setDescription("");
    setUrl("");
    setError(null);
  }

  async function submit() {
    if (!date || !title.trim()) {
      setError("日期和标题为必填");
      return;
    }
    setError(null);
    try {
      await save.mutateAsync({
        id: editingId ?? undefined,
        input: { date, type, title, description: description || null, url: url || null },
      });
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    }
  }

  const events = data ?? [];

  return (
    <AdminLayout title="时间线管理">
      <section className={styles.formCard}>
        <h2 className={styles.formTitle}>{editingId ? "编辑动态" : "记录一条动态"}</h2>
        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span>日期</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label className={styles.field}>
            <span>类型</span>
            <select value={type} onChange={(e) => setType(e.target.value as TimelineType)}>
              {(Object.keys(TYPE_LABEL) as TimelineType[]).map((key) => (
                <option key={key} value={key}>
                  {TYPE_LABEL[key]}
                </option>
              ))}
            </select>
          </label>
          <label className={`${styles.field} ${styles.fullRow}`}>
            <span>标题</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label className={styles.field}>
            <span>描述（可选）</span>
            <input value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <label className={styles.field}>
            <span>链接（可选）</span>
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
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
              <th>动态</th>
              <th>日期</th>
              <th>类型</th>
              <th aria-label="操作" />
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td className={styles.titleCell}>
                  {event.title}
                  {event.description ? <span className={styles.sub}>{event.description}</span> : null}
                </td>
                <td className={styles.muted}>{event.date}</td>
                <td>
                  <span className={styles.badge}>{TYPE_LABEL[event.type]}</span>
                </td>
                <td className={styles.actions}>
                  <button
                    type="button"
                    className={styles.edit}
                    onClick={() => {
                      setEditingId(event.id);
                      setDate(event.date);
                      setType(event.type);
                      setTitle(event.title);
                      setDescription(event.description ?? "");
                      setUrl(event.url ?? "");
                    }}
                  >
                    编辑
                  </button>
                  <button
                    type="button"
                    className={styles.delete}
                    disabled={remove.isPending}
                    onClick={() => {
                      if (window.confirm(`确定删除「${event.title}」？`)) {
                        remove.mutate(event.id);
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
