import { Image } from "lucide-react";
import { useState } from "react";

import { AppHeader } from "@/shared/ui/AppHeader";
import { ContentLayout, SidebarButton } from "@/shared/ui/ContentLayout";
import { EmptyState } from "@/shared/ui/EmptyState";

import { useCategories } from "@/shared/lib/api/categories";

import { useGallery } from "./api";
import { Lightbox } from "./Lightbox";
import styles from "./GalleryApp.module.css";

export function GalleryApp() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const { data: categories } = useCategories("gallery");
  const { data: items, isLoading } = useGallery(activeCategory ?? undefined);
  const list = items ?? [];

  const sidebar = (
    <>
      <SidebarButton active={activeCategory === null} onClick={() => setActiveCategory(null)}>
        All Photos
      </SidebarButton>
      {(categories ?? []).map((category) => (
        <SidebarButton
          key={category.id}
          active={activeCategory === category.slug}
          onClick={() => setActiveCategory(category.slug)}
        >
          {category.name}
        </SidebarButton>
      ))}
    </>
  );

  return (
    <ContentLayout sidebar={sidebar} sidebarLabel="Gallery categories">
      <AppHeader eyebrow="Gallery" title="图片作品、设计图和项目截图" />
      {isLoading ? (
        <p className={styles.hint}>加载中…</p>
      ) : list.length === 0 ? (
        <EmptyState
          icon={<Image size={30} />}
          title="这里还没有图片。"
          description="第一批作品很快会被放进来。"
        />
      ) : (
        <div className={styles.galleryGrid} aria-label="Gallery">
          {list.map((item, index) => (
            <button
              type="button"
              key={item.id}
              className={styles.galleryTile}
              onClick={() => setLightboxIndex(index)}
            >
              <img
                className={styles.thumb}
                src={item.media.url}
                alt={item.media.alt ?? item.title}
                loading="lazy"
              />
              <span className={styles.tileTitle}>{item.title}</span>
            </button>
          ))}
        </div>
      )}
      {lightboxIndex !== null ? (
        <Lightbox
          items={list}
          index={lightboxIndex}
          onNavigate={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      ) : null}
    </ContentLayout>
  );
}
