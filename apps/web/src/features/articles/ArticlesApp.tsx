import { FileText, Share2 } from "lucide-react";

import { AppHeader } from "@/shared/ui/AppHeader";
import { Button } from "@/shared/ui/Button";
import { ContentLayout, SidebarButton } from "@/shared/ui/ContentLayout";
import { EmptyState } from "@/shared/ui/EmptyState";

import { ARTICLE_CATEGORIES } from "./data";

export function ArticlesApp() {
  return (
    <ContentLayout
      sidebarLabel="Article categories"
      sidebar={ARTICLE_CATEGORIES.map((category, index) => (
        <SidebarButton key={category} active={index === 0}>
          {category}
        </SidebarButton>
      ))}
    >
      <AppHeader
        eyebrow="Articles"
        title="正式文章与技术笔记"
        action={
          <Button variant="ghost" disabled>
            <Share2 size={16} />
            Share
          </Button>
        }
      />
      <EmptyState
        icon={<FileText size={30} />}
        title="这里还没有内容。"
        description="但一个新的想法可能很快会被放进来。Phase 4 接入 API 后会显示文章卡片流。"
      />
    </ContentLayout>
  );
}
