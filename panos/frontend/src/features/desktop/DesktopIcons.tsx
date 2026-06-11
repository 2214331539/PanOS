import { Briefcase, FileText } from "lucide-react";
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

// 桌面图标：把精选内容投射为桌面"文件"。macOS 交互——单击选中，双击/Enter 打开。
export function DesktopIcons() {
  const openWindow = useWindowStore((state) => state.openWindow);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const { data: articles } = useArticles();
  const { data: projects } = useProjects();
  const { data: gallery } = useGallery();

  const latestArticle = articles?.[0];
  const featuredProject = projects?.find((project) => project.isFeatured) ?? projects?.[0];
  const latestPhoto = gallery?.[0];

  const items: DesktopIconItem[] = [];
  if (latestArticle) {
    items.push({
      key: `article-${latestArticle.slug}`,
      label: latestArticle.title,
      hint: "最新文章",
      icon: (
        <AppIcon accent="blue">
          <FileText aria-hidden="true" size={24} strokeWidth={2.2} />
        </AppIcon>
      ),
      open: () => openWindow("articles", { slug: latestArticle.slug }),
    });
  }
  if (featuredProject) {
    items.push({
      key: `project-${featuredProject.slug}`,
      label: featuredProject.name,
      hint: "置顶项目",
      icon: (
        <AppIcon accent="emerald">
          <Briefcase aria-hidden="true" size={24} strokeWidth={2.2} />
        </AppIcon>
      ),
      open: () => openWindow("projects", { slug: featuredProject.slug }),
    });
  }
  if (latestPhoto) {
    items.push({
      key: `photo-${latestPhoto.slug}`,
      label: latestPhoto.title,
      hint: "最新照片",
      icon: (
        <img
          className={styles.thumb}
          src={latestPhoto.media.url}
          alt=""
          aria-hidden="true"
          loading="lazy"
        />
      ),
      open: () => openWindow("gallery"),
    });
  }

  if (items.length === 0) {
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
