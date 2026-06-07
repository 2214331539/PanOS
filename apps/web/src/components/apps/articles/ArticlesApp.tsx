import { FileText, Share2 } from "lucide-react";

import { ARTICLE_CATEGORIES } from "../../../lib/constants/panos-copy";
import { Button } from "../../ui/button";

export function ArticlesApp() {
  return (
    <section className="content-app content-app--with-sidebar">
      <aside className="content-sidebar" aria-label="Article categories">
        {ARTICLE_CATEGORIES.map((category, index) => (
          <button key={category} className={index === 0 ? "content-sidebar__item is-active" : "content-sidebar__item"}>
            {category}
          </button>
        ))}
      </aside>
      <div className="content-main">
        <div className="content-main__toolbar">
          <div>
            <p className="window-eyebrow">Articles</p>
            <h1>正式文章与技术笔记</h1>
          </div>
          <Button variant="ghost" disabled>
            <Share2 size={16} />
            Share
          </Button>
        </div>
        <div className="empty-state">
          <FileText size={30} />
          <h2>这里还没有内容。</h2>
          <p>但一个新的想法可能很快会被放进来。Phase 4 接入 API 后会显示文章卡片流。</p>
        </div>
      </div>
    </section>
  );
}

