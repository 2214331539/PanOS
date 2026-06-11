import { ImagePlus } from "lucide-react";
import { useRef, useState } from "react";

import { AdminLayout } from "@/features/admin/AdminLayout";
import { Button } from "@/shared/ui/Button";

import { useCategories } from "@/shared/lib/api/categories";
import {
  useAdminGallery,
  useCreateGalleryItem,
  useDeleteGalleryItem,
  useUpdateGalleryItem,
} from "./api";
import styles from "./GalleryAdminRoute.module.css";

export function GalleryAdminRoute() {
  const { data, isLoading } = useAdminGallery();
  const { data: categories } = useCategories("gallery");
  const createItem = useCreateGalleryItem();
  const updateItem = useUpdateGalleryItem();
  const deleteItem = useDeleteGalleryItem();

  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const items = data ?? [];

  async function submit() {
    if (!file) {
      setError("请先选择图片文件");
      return;
    }
    if (!title.trim()) {
      setError("标题为必填项");
      return;
    }
    setError(null);
    try {
      await createItem.mutateAsync({
        file,
        input: {
          title,
          description: description || null,
          categoryId: categoryId || null,
        },
      });
      setFile(null);
      setTitle("");
      setDescription("");
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败");
    }
  }

  return (
    <AdminLayout title="图库管理">
      <section className={styles.uploadCard}>
        <h2 className={styles.uploadTitle}>
          <ImagePlus size={16} />
          上传新图片
        </h2>
        <div className={styles.uploadForm}>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={(e) => {
              const next = e.target.files?.[0] ?? null;
              setFile(next);
              if (next && !title) setTitle(next.name.replace(/\.[^.]+$/, ""));
            }}
          />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="标题"
            aria-label="标题"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="描述（可选）"
            aria-label="描述"
          />
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            aria-label="分类"
          >
            <option value="">未分类</option>
            {(categories ?? []).map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <Button onClick={() => void submit()} disabled={createItem.isPending}>
            {createItem.isPending ? "上传中…" : "上传并发布"}
          </Button>
        </div>
        {error ? <p className={styles.error}>{error}</p> : null}
      </section>

      {isLoading ? (
        <p className={styles.hint}>加载中…</p>
      ) : items.length === 0 ? (
        <p className={styles.hint}>图库还是空的，上传第一张图片吧。</p>
      ) : (
        <div className={styles.grid}>
          {items.map((item) => (
            <article key={item.id} className={styles.card}>
              {item.mediaUrl ? (
                <img className={styles.thumb} src={item.mediaUrl} alt={item.title} />
              ) : (
                <div className={styles.thumbFallback} />
              )}
              <div className={styles.cardBody}>
                <strong className={styles.cardTitle}>{item.title}</strong>
                <span className={styles.cardMeta}>
                  {item.status === "published" ? "已发布" : "草稿"} · {item.updatedAt.slice(0, 10)}
                </span>
                <div className={styles.cardActions}>
                  <button
                    type="button"
                    className={styles.action}
                    disabled={updateItem.isPending}
                    onClick={() =>
                      updateItem.mutate({
                        id: item.id,
                        input: { status: item.status === "published" ? "draft" : "published" },
                      })
                    }
                  >
                    {item.status === "published" ? "下架" : "发布"}
                  </button>
                  <button
                    type="button"
                    className={`${styles.action} ${styles.danger}`}
                    disabled={deleteItem.isPending}
                    onClick={() => {
                      if (window.confirm(`确定删除「${item.title}」？此操作不可撤销。`)) {
                        deleteItem.mutate(item.id);
                      }
                    }}
                  >
                    删除
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
