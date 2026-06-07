import { Briefcase, ExternalLink } from "lucide-react";

import { PROJECT_CATEGORIES } from "../../../lib/constants/panos-copy";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";

export function ProjectsApp() {
  return (
    <section className="content-app">
      <div className="content-main">
        <div className="content-main__toolbar">
          <div>
            <p className="window-eyebrow">Projects</p>
            <h1>项目作品与产品实验</h1>
          </div>
          <Button variant="ghost" disabled>
            <ExternalLink size={16} />
            Demo
          </Button>
        </div>
        <div className="category-row">
          {PROJECT_CATEGORIES.map((category) => (
            <Badge key={category}>{category}</Badge>
          ))}
        </div>
        <div className="empty-state empty-state--inline">
          <Briefcase size={30} />
          <h2>项目卡片系统已准备。</h2>
          <p>后续会从 Projects API 展示封面、状态、技术栈、Demo、GitHub 和详情页。</p>
        </div>
      </div>
    </section>
  );
}

