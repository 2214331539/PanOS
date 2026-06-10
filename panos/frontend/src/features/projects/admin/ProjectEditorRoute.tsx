import { Trash2 } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { AdminLayout } from "@/features/admin/AdminLayout";
import { Button } from "@/shared/ui/Button";

import { type ProjectLink, type ProjectStatus, useProjectCategories } from "../api";
import { type AdminProjectDetail, useAdminProject, useSaveProject } from "./api";
import styles from "./ProjectEditorRoute.module.css";

const MarkdownEditor = lazy(() => import("@/features/articles/admin/MarkdownEditor"));

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: "concept", label: "概念" },
  { value: "prototype", label: "原型" },
  { value: "building", label: "开发中" },
  { value: "launched", label: "已上线" },
  { value: "paused", label: "暂停" },
  { value: "archived", label: "已归档" },
];

export function ProjectEditorRoute() {
  const { id } = useParams();
  const { data: existing, isLoading } = useAdminProject(id);

  if (id && isLoading) {
    return (
      <AdminLayout title="编辑项目">
        <p>加载中…</p>
      </AdminLayout>
    );
  }

  // 用 key 在加载到已有项目后重挂载表单，从 existing 初始化各字段。
  return <EditorForm key={existing?.id ?? "new"} existing={existing} />;
}

function EditorForm({ existing }: { existing?: AdminProjectDetail }) {
  const navigate = useNavigate();
  const { data: categories } = useProjectCategories();
  const save = useSaveProject();

  const [name, setName] = useState(existing?.name ?? "");
  const [slug, setSlug] = useState(existing?.slug ?? "");
  const [tagline, setTagline] = useState(existing?.tagline ?? "");
  const [summary, setSummary] = useState(existing?.summary ?? "");
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? "");
  const [status, setStatus] = useState<ProjectStatus>(existing?.status ?? "concept");
  const [visibility, setVisibility] = useState(existing?.visibility ?? "public");
  const [techStack, setTechStack] = useState((existing?.techStack ?? []).join(", "));
  const [links, setLinks] = useState<ProjectLink[]>(existing?.links ?? []);
  const [background, setBackground] = useState(existing?.backgroundMdx ?? "");
  const [error, setError] = useState<string | null>(null);

  function updateLink(index: number, patch: Partial<ProjectLink>) {
    setLinks((prev) => prev.map((link, i) => (i === index ? { ...link, ...patch } : link)));
  }

  async function submit() {
    if (!name.trim() || !tagline.trim()) {
      setError("名称和一句话介绍为必填项");
      return;
    }
    setError(null);
    try {
      await save.mutateAsync({
        id: existing?.id,
        input: {
          name,
          slug: slug || undefined,
          tagline,
          summary: summary || null,
          categoryId: categoryId || null,
          status,
          visibility,
          techStack: techStack
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          backgroundMdx: background || null,
          links: links.filter((link) => link.label.trim() && link.url.trim()),
        },
      });
      void navigate("/admin/projects");
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    }
  }

  return (
    <AdminLayout title={existing ? "编辑项目" : "新建项目"}>
      <div className={styles.form}>
        <div className={styles.row}>
          <label className={styles.field}>
            <span>项目名称</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="PanOS" />
          </label>
          <label className={styles.field}>
            <span>Slug（留空自动生成）</span>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="panos" />
          </label>
        </div>

        <label className={styles.field}>
          <span>一句话介绍</span>
          <input
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="浏览器里的个人操作系统"
          />
        </label>

        <label className={styles.field}>
          <span>列表摘要（可选）</span>
          <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={2} />
        </label>

        <div className={styles.row3}>
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
          <label className={styles.field}>
            <span>项目状态</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span>可见性</span>
            <select value={visibility} onChange={(e) => setVisibility(e.target.value)}>
              <option value="public">公开</option>
              <option value="unlisted">不公开列出</option>
              <option value="private">私密</option>
            </select>
          </label>
        </div>

        <label className={styles.field}>
          <span>技术栈（逗号分隔）</span>
          <input
            value={techStack}
            onChange={(e) => setTechStack(e.target.value)}
            placeholder="React, TypeScript, FastAPI"
          />
        </label>

        <div className={styles.field}>
          <span>相关链接</span>
          <div className={styles.linkRows}>
            {links.map((link, index) => (
              <div className={styles.linkRow} key={index}>
                <select
                  value={link.type}
                  onChange={(e) => updateLink(index, { type: e.target.value })}
                  aria-label="链接类型"
                >
                  <option value="github">GitHub</option>
                  <option value="demo">Demo</option>
                  <option value="article">文章</option>
                  <option value="video">视频</option>
                  <option value="docs">文档</option>
                </select>
                <input
                  value={link.label}
                  onChange={(e) => updateLink(index, { label: e.target.value })}
                  placeholder="显示名"
                  aria-label="链接显示名"
                />
                <input
                  value={link.url}
                  onChange={(e) => updateLink(index, { url: e.target.value })}
                  placeholder="https://…"
                  aria-label="链接地址"
                />
                <button
                  type="button"
                  className={styles.removeLink}
                  aria-label="移除链接"
                  onClick={() => setLinks((prev) => prev.filter((_, i) => i !== index))}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setLinks((prev) => [...prev, { type: "github", label: "", url: "" }])
              }
            >
              + 添加链接
            </Button>
          </div>
        </div>

        <div className={styles.field}>
          <span>项目背景（Markdown）</span>
          <div className={styles.editorWrap}>
            <Suspense fallback={<div className={styles.loading}>编辑器加载中…</div>}>
              <MarkdownEditor markdown={background} onChange={setBackground} />
            </Suspense>
          </div>
        </div>

        {error ? <p className={styles.error}>{error}</p> : null}

        <div className={styles.actions}>
          <Button
            variant="ghost"
            onClick={() => {
              void navigate("/admin/projects");
            }}
          >
            取消
          </Button>
          <Button onClick={() => void submit()} disabled={save.isPending}>
            保存
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
