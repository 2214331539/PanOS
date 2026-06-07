import { Image } from "lucide-react";

import { GALLERY_CATEGORIES } from "../../../lib/constants/panos-copy";
import { Badge } from "../../ui/badge";

export function GalleryApp() {
  return (
    <section className="content-app">
      <div className="content-main">
        <p className="window-eyebrow">Gallery</p>
        <h1>图片作品、设计图和项目截图</h1>
        <div className="category-row">
          {GALLERY_CATEGORIES.map((category) => (
            <Badge key={category}>{category}</Badge>
          ))}
        </div>
        <div className="gallery-grid" aria-label="Gallery placeholders">
          {Array.from({ length: 6 }, (_, index) => (
            <div className="gallery-tile" key={index}>
              <Image size={24} />
            </div>
          ))}
        </div>
        <p className="window-note">Lightbox 会在 Gallery API 接入后启用，图片信息侧栏会从数据库读取。</p>
      </div>
    </section>
  );
}

