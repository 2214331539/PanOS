import { Briefcase, ExternalLink } from "lucide-react";

import { AppHeader } from "@/shared/ui/AppHeader";
import { BadgeRow } from "@/shared/ui/BadgeRow";
import { Button } from "@/shared/ui/Button";
import { ContentLayout } from "@/shared/ui/ContentLayout";
import { EmptyState } from "@/shared/ui/EmptyState";

import { PROJECT_CATEGORIES } from "./data";

export function ProjectsApp() {
  return (
    <ContentLayout>
      <AppHeader
        eyebrow="Projects"
        title="项目作品与产品实验"
        action={
          <Button variant="ghost" disabled>
            <ExternalLink size={16} />
            Demo
          </Button>
        }
      />
      <BadgeRow items={PROJECT_CATEGORIES} />
      <EmptyState
        inline
        icon={<Briefcase size={30} />}
        title="项目卡片系统已准备。"
        description="后续会从 Projects API 展示封面、状态、技术栈、Demo、GitHub 和详情页。"
      />
    </ContentLayout>
  );
}
