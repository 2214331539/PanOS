import { Briefcase } from "lucide-react";
import { useState } from "react";

import { AppHeader } from "@/shared/ui/AppHeader";
import { ContentLayout, SidebarButton } from "@/shared/ui/ContentLayout";
import { EmptyState } from "@/shared/ui/EmptyState";

import { useProjectCategories, useProjects } from "./api";
import { ProjectCard } from "./ProjectCard";
import { ProjectReader } from "./ProjectReader";
import styles from "./ProjectsApp.module.css";

export function ProjectsApp() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const { data: categories } = useProjectCategories();
  const { data: projects, isLoading } = useProjects(activeCategory ?? undefined);

  if (selectedSlug) {
    return (
      <ContentLayout>
        <ProjectReader slug={selectedSlug} onBack={() => setSelectedSlug(null)} />
      </ContentLayout>
    );
  }

  const list = projects ?? [];

  const sidebar = (
    <>
      <SidebarButton active={activeCategory === null} onClick={() => setActiveCategory(null)}>
        All Projects
      </SidebarButton>
      {(categories ?? []).map((category) => (
        <SidebarButton
          key={category.id}
          active={activeCategory === category.slug}
          onClick={() => setActiveCategory(category.slug)}
        >
          {category.name}
        </SidebarButton>
      ))}
    </>
  );

  return (
    <ContentLayout sidebar={sidebar} sidebarLabel="Project categories">
      <AppHeader eyebrow="Projects" title="项目作品与产品实验" />
      {isLoading ? (
        <p className={styles.hint}>加载中…</p>
      ) : list.length === 0 ? (
        <EmptyState
          icon={<Briefcase size={30} />}
          title="这里还没有项目。"
          description="第一个正在构建的东西很快会出现在这里。"
        />
      ) : (
        <div className={styles.grid}>
          {list.map((project) => (
            <ProjectCard key={project.id} project={project} onOpen={setSelectedSlug} />
          ))}
        </div>
      )}
    </ContentLayout>
  );
}
