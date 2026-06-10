import { useQuery } from "@tanstack/react-query";

import { apiGet } from "@/shared/lib/api/client";

export interface Cover {
  url: string;
  alt: string | null;
}

export interface CategoryRef {
  name: string;
  slug: string;
}

export interface ProjectLink {
  type: string;
  label: string;
  url: string;
}

export type ProjectStatus =
  | "concept"
  | "prototype"
  | "building"
  | "launched"
  | "paused"
  | "archived";

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  concept: "概念",
  prototype: "原型",
  building: "开发中",
  launched: "已上线",
  paused: "暂停",
  archived: "已归档",
};

export interface ProjectCard {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  summary: string | null;
  cover: Cover | null;
  category: CategoryRef | null;
  status: ProjectStatus;
  techStack: string[];
  isFeatured: boolean;
  links: ProjectLink[];
  publishedAt: string | null;
}

export interface ProjectDetail extends ProjectCard {
  backgroundMdx: string | null;
  features: unknown;
  architectureMdx: string | null;
  processMdx: string | null;
  roadmapMdx: string | null;
}

export function useProjects(category?: string) {
  return useQuery({
    queryKey: ["projects", category ?? "all"],
    queryFn: async () => {
      const qs = category ? `?category=${encodeURIComponent(category)}` : "";
      return (await apiGet<ProjectCard[]>(`/projects${qs}`)).data;
    },
  });
}

export function useProject(slug: string) {
  return useQuery({
    queryKey: ["project", slug],
    queryFn: async () => (await apiGet<ProjectDetail>(`/projects/${slug}`)).data,
    enabled: Boolean(slug),
  });
}
