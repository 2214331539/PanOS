import { FileText, Share2 } from "lucide-react";

import { ARTICLE_CATEGORIES } from "../../../lib/constants/copy";
import { Button } from "../../ui/button";
import shell from "../shared/appShell.module.css";

export function ArticlesApp() {
  return (
    <section className={`${shell.contentApp} ${shell.withSidebar}`}>
      <aside className={shell.sidebar} aria-label="Article categories">
        {ARTICLE_CATEGORIES.map((category, index) => (
          <button
            key={category}
            className={index === 0 ? `${shell.sidebarItem} ${shell.sidebarItemActive}` : shell.sidebarItem}
          >
            {category}
          </button>
        ))}
      </aside>
      <div className={shell.main}>
        <div className={shell.toolbar}>
          <div>
            <p className={shell.eyebrow}>Articles</p>
            <h1 className={shell.heading}>正式文章与技术笔记</h1>
          </div>
          <Button variant="ghost" disabled>
            <Share2 size={16} />
            Share
          </Button>
        </div>
        <div className={shell.emptyState}>
          <FileText size={30} />
          <h2>这里还没有内容。</h2>
          <p>但一个新的想法可能很快会被放进来。Phase 4 接入 API 后会显示文章卡片流。</p>
        </div>
      </div>
    </section>
  );
}

