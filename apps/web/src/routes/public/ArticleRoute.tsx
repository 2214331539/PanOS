import { Link, useParams } from "react-router";

import { Button } from "../../components/ui/button";

export function ArticleRoute() {
  const { slug } = useParams();

  return (
    <main className="direct-route">
      <section className="direct-route__panel">
        <p className="direct-route__eyebrow">PanOS Article</p>
        <h1>{slug ?? "Article"}</h1>
        <p>
          文章详情直达路由已经接入。等 Phase 4 的公开 API 完成后，这里会从
          <code> /api/articles/[slug]</code> 读取正式 MDX 内容。
        </p>
        <Button asChild>
          <Link to="/">返回 PanOS 桌面</Link>
        </Button>
      </section>
    </main>
  );
}

