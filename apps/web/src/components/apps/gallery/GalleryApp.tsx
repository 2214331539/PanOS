import { Image } from "lucide-react";

import { GALLERY_CATEGORIES } from "../../../lib/constants/copy";
import { Badge } from "../../ui/badge";
import shell from "../shared/appShell.module.css";
import styles from "./GalleryApp.module.css";

export function GalleryApp() {
  return (
    <section className={shell.contentApp}>
      <div className={shell.main}>
        <p className={shell.eyebrow}>Gallery</p>
        <h1 className={shell.heading}>图片作品、设计图和项目截图</h1>
        <div className={shell.inlineRow}>
          {GALLERY_CATEGORIES.map((category) => (
            <Badge key={category}>{category}</Badge>
          ))}
        </div>
        <div className={styles.galleryGrid} aria-label="Gallery placeholders">
          {Array.from({ length: 6 }, (_, index) => (
            <div className={styles.galleryTile} key={index}>
              <Image size={24} />
            </div>
          ))}
        </div>
        <p className={shell.note}>Lightbox 会在 Gallery API 接入后启用，图片信息侧栏会从数据库读取。</p>
      </div>
    </section>
  );
}

