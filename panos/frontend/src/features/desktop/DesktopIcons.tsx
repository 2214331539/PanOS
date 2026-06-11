import { Briefcase, FileText, User } from "lucide-react";
import { useState } from "react";

import { useArticles } from "@/features/articles/api";
import { useGallery } from "@/features/gallery/api";
import { useProjects } from "@/features/projects/api";
import { AppIcon } from "@/shared/ui/AppIcon";
import { cn } from "@/shared/lib/utils/classnames";

import styles from "./DesktopIcons.module.css";
import { useWindowStore } from "./window-store";

interface DesktopIconItem {
  key: string;
  label: string;
  hint: string;
  icon: React.ReactNode;
  open: () => void;
}

// 桌面图标：精选内容投影为桌面"文件"，从右上角往下排（macOS 默认位）。
// 单击选中，双击 / Enter 打开。上限约 9 个——桌面是精选，不是文件堆。
export function DesktopIcons() {
  const openWindow = useWindowStore((state) => state.openWindow);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const { data: articles } = useArticles();
  const { data: projects } = useProjects();
  const { data: gallery } = useGallery();

  const items: DesktopIconItem[] = [];

  for (const article of (articles ?? []).slice(0, 3)) {
    items.push({
      key: `article-${article.slug}`,
      label: `${article.title}.md`,
      hint: "文章",
      icon: (
        <AppIcon accent="blue">
          <FileText aria-hidden="true" size={24} strokeWidth={2.2} />
        </AppIcon>
      ),
      open: () => openWindow("articles", { slug: article.slug }),
    });
  }

  const sortedProjects = [...(projects ?? [])].sort(
    (a, b) => Number(b.isFeatured) - Number(a.isFeatured),
  );
  for (const project of sortedProjects.slice(0, 2)) {
    items.push({
      key: `project-${project.slug}`,
      label: project.name,
      hint: "项目",
      icon: (
        <AppIcon accent="emerald">
          <Briefcase aria-hidden="true" size={24} strokeWidth={2.2} />
        </AppIcon>
      ),
      open: () => openWindow("projects", { slug: project.slug }),
    });
  }

  for (const photo of (gallery ?? []).slice(0, 3)) {
    items.push({
      key: `photo-${photo.slug}`,
      label: `${photo.title}.jpg`,
      hint: "照片",
      icon: (
        <img
          className={styles.thumb}
          src={photo.media.url}
          alt=""
          aria-hidden="true"
          loading="lazy"
        />
      ),
      open: () => openWindow("gallery"),
    });
  }

  items.push({
    key: "about-resume",
    label: "关于我.pdf",
    hint: "关于",
    icon: (
      <AppIcon accent="cyan">
        <User aria-hidden="true" size={24} strokeWidth={2.2} />
      </AppIcon>
    ),
    open: () => openWindow("about"),
  });

  if (items.length <= 1) {
    return null;
  }

  return (
    <div className={styles.icons} aria-label="Desktop shortcuts" role="group">
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          className={cn(styles.icon, selectedKey === item.key && styles.selected)}
          title={`${item.hint} · 双击打开`}
          aria-label={`${item.hint}：${item.label}`}
          onClick={() => setSelectedKey(item.key)}
          onDoubleClick={item.open}
          onKeyDown={(event) => {
            if (event.key === "Enter") item.open();
          }}
          onBlur={() => setSelectedKey((key) => (key === item.key ? null : key))}
        >
          <span className={styles.glyph}>{item.icon}</span>
          <span className={styles.label}>{item.label}</span>
        </button>
      ))}
    </div>
  );
}
