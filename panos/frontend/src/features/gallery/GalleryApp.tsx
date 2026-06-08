import { Image } from "lucide-react";

import { AppHeader } from "@/shared/ui/AppHeader";
import { BadgeRow } from "@/shared/ui/BadgeRow";
import { ContentLayout } from "@/shared/ui/ContentLayout";
import { Hint } from "@/shared/ui/Hint";

import { GALLERY_CATEGORIES } from "./data";
import styles from "./GalleryApp.module.css";

export function GalleryApp() {
  return (
    <ContentLayout>
      <AppHeader eyebrow="Gallery" title="图片作品、设计图和项目截图" />
      <BadgeRow items={GALLERY_CATEGORIES} />
      <div className={styles.galleryGrid} aria-label="Gallery placeholders">
        {Array.from({ length: 6 }, (_, index) => (
          <div className={styles.galleryTile} key={index}>
            <Image size={24} />
          </div>
        ))}
      </div>
      <Hint>Lightbox 会在 Gallery API 接入后启用，图片信息侧栏会从数据库读取。</Hint>
    </ContentLayout>
  );
}
