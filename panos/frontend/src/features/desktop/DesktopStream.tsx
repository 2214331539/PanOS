import { Briefcase, FileText, Lightbulb } from "lucide-react";
import { useMemo } from "react";

import { useArticles } from "@/features/articles/api";
import { useGallery } from "@/features/gallery/api";
import { useIdeas } from "@/features/ideas/api";
import { useProjects } from "@/features/projects/api";

import styles from "./DesktopStream.module.css";
import { useWindowStore } from "./window-store";

interface StreamCard {
  key: string;
  kind: "article" | "idea" | "project" | "photo";
  title: string;
  body?: string;
  imageUrl?: string;
  open: () => void;
}

const KIND_META = {
  article: { label: "文章", icon: FileText, className: "article" },
  idea: { label: "想法", icon: Lightbulb, className: "idea" },
  project: { label: "项目", icon: Briefcase, className: "project" },
  photo: { label: "照片", icon: FileText, className: "photo" },
} as const;

// Fisher–Yates 洗牌：内容流每次进入桌面随机排序。
function shuffle<T>(list: T[]): T[] {
  const result = [...list];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// 桌面右侧的内容瀑布流：文章 / 想法 / 项目 / 照片混排，
// 无缝向上循环滚动（hover 暂停），点击直达对应内容。
export function DesktopStream() {
  const openWindow = useWindowStore((state) => state.openWindow);

  const { data: articles } = useArticles();
  const { data: projects } = useProjects();
  const { data: gallery } = useGallery();
  const { data: ideas } = useIdeas();

  const cards = useMemo<StreamCard[]>(() => {
    const list: StreamCard[] = [];
    for (const article of (articles ?? []).slice(0, 4)) {
      list.push({
        key: `article-${article.slug}`,
        kind: "article",
        title: article.title,
        body: article.excerpt,
        open: () => openWindow("articles", { slug: article.slug }),
      });
    }
    for (const idea of (ideas ?? []).slice(0, 4)) {
      list.push({
        key: `idea-${idea.id}`,
        kind: "idea",
        title: idea.title,
        body: idea.summary,
        open: () => openWindow("ideas"),
      });
    }
    for (const project of (projects ?? []).slice(0, 3)) {
      list.push({
        key: `project-${project.slug}`,
        kind: "project",
        title: project.name,
        body: project.tagline,
        open: () => openWindow("projects", { slug: project.slug }),
      });
    }
    for (const photo of (gallery ?? []).slice(0, 4)) {
      list.push({
        key: `photo-${photo.slug}`,
        kind: "photo",
        title: photo.title,
        imageUrl: photo.media.url,
        open: () => openWindow("gallery"),
      });
    }
    return shuffle(list);
    // 数据就绪后洗一次牌；openWindow 引用稳定。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articles, projects, gallery, ideas]);

  if (cards.length < 4) {
    return null;
  }

  // 列表复制一份接在尾部，translateY(-50%) 时正好无缝衔接。
  const looped = [...cards, ...cards];

  return (
    <aside className={styles.stream} aria-label="Desktop content stream">
      <div className={styles.track}>
        {looped.map((card, index) => {
          const meta = KIND_META[card.kind];
          const Icon = meta.icon;
          const isClone = index >= cards.length;
          return (
            <button
              key={`${card.key}-${index}`}
              type="button"
              className={`${styles.card} ${styles[meta.className]}`}
              onClick={card.open}
              tabIndex={isClone ? -1 : 0}
              aria-hidden={isClone || undefined}
              aria-label={isClone ? undefined : `${meta.label}：${card.title}`}
            >
              {card.imageUrl ? (
                <img className={styles.photoImg} src={card.imageUrl} alt="" loading="lazy" />
              ) : null}
              <span className={styles.cardHead}>
                <Icon size={12} aria-hidden="true" />
                {meta.label}
              </span>
              <strong className={styles.cardTitle}>{card.title}</strong>
              {card.body ? <span className={styles.cardBody}>{card.body}</span> : null}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
