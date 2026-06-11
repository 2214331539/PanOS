import { useState } from "react";

import { AdminLayout } from "@/features/admin/AdminLayout";
import { Button } from "@/shared/ui/Button";

import { type AdminWidgetItem, useAdminWidgets, useDeleteWidget, useSaveWidget } from "./api";
import styles from "./WidgetsAdminRoute.module.css";

// 前端已实现的 widget 渲染类型；其他类型可保存但桌面端会跳过。
const KNOWN_TYPES = ["clock", "now", "github", "visitors"];

export function WidgetsAdminRoute() {
  const { data, isLoading } = useAdminWidgets();
  const save = useSaveWidget();
  const deleteWidget = useDeleteWidget();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [type, setType] = useState("now");
  const [title, setTitle] = useState("");
  const [payloadText, setPayloadText] = useState("{}");
  const [error, setError] = useState<string | null>(null);

  const widgets = data ?? [];

  function startEdit(widget: AdminWidgetItem) {
    setEditingId(widget.id);
    setType(widget.type);
    setTitle(widget.title);
    setPayloadText(JSON.stringify(widget.payload, null, 2));
    setError(null);
  }

  function reset() {
    setEditingId(null);
    setType("now");
    setTitle("");
    setPayloadText("{}");
    setError(null);
  }

  async function submit() {
    if (!title.trim()) {
      setError("标题为必填项");
      return;
    }
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(payloadText) as Record<string, unknown>;
    } catch {
      setError("Payload 不是合法的 JSON");
      return;
    }
    setError(null);
    try {
      await save.mutateAsync({ id: editingId ?? undefined, input: { type, title, payload } });
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    }
  }

  return (
    <AdminLayout title="桌面 Widget 管理">
      <section className={styles.formCard}>
        <h2 className={styles.formTitle}>{editingId ? "编辑 Widget" : "新增 Widget"}</h2>
        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span>类型</span>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              {KNOWN_TYPES.map((known) => (
                <option key={known} value={known}>
                  {known}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span>标题</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Now" />
          </label>
          <label className={`${styles.field} ${styles.fullRow}`}>
            <span>Payload（JSON，如 {'{"lines": ["..."]}'} / {'{"username": "..."}'}）</span>
            <textarea
              value={payloadText}
              onChange={(e) => setPayloadText(e.target.value)}
              rows={4}
              spellCheck={false}
            />
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
      ) : widgets.length === 0 ? (
        <p className={styles.hint}>还没有 Widget。</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>标题</th>
              <th>类型</th>
              <th>状态</th>
              <th aria-label="操作" />
            </tr>
          </thead>
          <tbody>
            {widgets.map((widget) => (
              <tr key={widget.id}>
                <td className={styles.titleCell}>{widget.title}</td>
                <td className={styles.muted}>
                  <code>{widget.type}</code>
                </td>
                <td>
                  <button
                    type="button"
                    className={widget.isEnabled ? styles.activeBadge : styles.inactiveBadge}
                    disabled={save.isPending}
                    title="点击切换显示/隐藏"
                    onClick={() =>
                      save.mutate({ id: widget.id, input: { isEnabled: !widget.isEnabled } })
                    }
                  >
                    {widget.isEnabled ? "显示中" : "已隐藏"}
                  </button>
                </td>
                <td className={styles.actions}>
                  <button type="button" className={styles.edit} onClick={() => startEdit(widget)}>
                    编辑
                  </button>
                  <button
                    type="button"
                    className={styles.delete}
                    disabled={deleteWidget.isPending}
                    onClick={() => {
                      if (window.confirm(`确定删除「${widget.title}」？`)) {
                        deleteWidget.mutate(widget.id);
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
