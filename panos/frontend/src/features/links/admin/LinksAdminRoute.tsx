import { useState } from "react";

import { AdminLayout } from "@/features/admin/AdminLayout";
import { Button } from "@/shared/ui/Button";

import { type AdminLinkItem, useAdminLinks, useDeleteLink, useSaveLink } from "./api";
import styles from "./LinksAdminRoute.module.css";

interface FormState {
  platform: string;
  description: string;
  url: string;
  isPrimary: boolean;
}

const EMPTY_FORM: FormState = { platform: "", description: "", url: "", isPrimary: false };

export function LinksAdminRoute() {
  const { data, isLoading } = useAdminLinks();
  const save = useSaveLink();
  const deleteLink = useDeleteLink();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  const links = data ?? [];

  function startEdit(link: AdminLinkItem) {
    setEditingId(link.id);
    setForm({
      platform: link.platform,
      description: link.description,
      url: link.url,
      isPrimary: link.isPrimary,
    });
  }

  function reset() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
  }

  async function submit() {
    if (!form.platform.trim() || !form.url.trim() || !form.description.trim()) {
      setError("平台、描述和链接地址都是必填项");
      return;
    }
    setError(null);
    try {
      await save.mutateAsync({ id: editingId ?? undefined, input: form });
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    }
  }

  return (
    <AdminLayout title="社交链接管理">
      <section className={styles.formCard}>
        <h2 className={styles.formTitle}>{editingId ? "编辑链接" : "新增链接"}</h2>
        <div className={styles.formGrid}>
          <input
            value={form.platform}
            onChange={(e) => setForm({ ...form, platform: e.target.value })}
            placeholder="平台（如 GitHub）"
            aria-label="平台"
          />
          <input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="描述"
            aria-label="描述"
          />
          <input
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="https://…"
            aria-label="链接地址"
          />
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={form.isPrimary}
              onChange={(e) => setForm({ ...form, isPrimary: e.target.checked })}
            />
            主推
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
      ) : links.length === 0 ? (
        <p className={styles.hint}>还没有链接，添加第一个吧。</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>平台</th>
              <th>链接</th>
              <th>状态</th>
              <th aria-label="操作" />
            </tr>
          </thead>
          <tbody>
            {links.map((link) => (
              <tr key={link.id}>
                <td className={styles.titleCell}>
                  {link.platform}
                  {link.isPrimary ? <span className={styles.primary}>主推</span> : null}
                  <span className={styles.desc}>{link.description}</span>
                </td>
                <td className={styles.urlCell}>
                  <a href={link.url} target="_blank" rel="noreferrer">
                    {link.url}
                  </a>
                </td>
                <td>
                  <button
                    type="button"
                    className={link.isActive ? styles.activeBadge : styles.inactiveBadge}
                    disabled={save.isPending}
                    title="点击切换显示/隐藏"
                    onClick={() =>
                      save.mutate({
                        id: link.id,
                        input: {
                          platform: link.platform,
                          description: link.description,
                          url: link.url,
                          isActive: !link.isActive,
                        },
                      })
                    }
                  >
                    {link.isActive ? "显示中" : "已隐藏"}
                  </button>
                </td>
                <td className={styles.actions}>
                  <button type="button" className={styles.edit} onClick={() => startEdit(link)}>
                    编辑
                  </button>
                  <button
                    type="button"
                    className={styles.delete}
                    disabled={deleteLink.isPending}
                    onClick={() => {
                      if (window.confirm(`确定删除「${link.platform}」？`)) {
                        deleteLink.mutate(link.id);
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
