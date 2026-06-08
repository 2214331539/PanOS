import { Link, useParams } from "react-router";

import { Button } from "@/shared/ui/Button";
import { DirectPanel } from "@/shared/ui/DirectPanel";

export function ArticleDetailRoute() {
  const { slug } = useParams();

  return (
    <DirectPanel eyebrow="PanOS Article" title={slug ?? "Article"}>
      <p>
        文章详情直达路由已经接入。等 Phase 4 的公开 API 完成后，这里会从
        <code> /api/articles/[slug]</code> 读取正式 MDX 内容。
      </p>
      <Button asChild>
        <Link to="/">返回 PanOS 桌面</Link>
      </Button>
    </DirectPanel>
  );
}
