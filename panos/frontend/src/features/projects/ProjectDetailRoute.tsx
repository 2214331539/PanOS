import { Link, useParams } from "react-router";

import { Button } from "@/shared/ui/Button";
import { DirectPanel } from "@/shared/ui/DirectPanel";

export function ProjectDetailRoute() {
  const { slug } = useParams();

  return (
    <DirectPanel eyebrow="PanOS Project" title={slug ?? "Project"}>
      <p>
        项目详情直达路由已经接入。后续会按照文档从
        <code> /api/projects/[slug]</code> 加载项目背景、功能、截图和链接。
      </p>
      <Button asChild>
        <Link to="/">返回 PanOS 桌面</Link>
      </Button>
    </DirectPanel>
  );
}
