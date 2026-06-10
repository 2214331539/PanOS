import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiGet, apiSend } from "@/shared/lib/api/client";

import type { ProjectLink, ProjectStatus } from "../api";

export interface AdminProjectListItem {
  id: string;
  slug: string;
  name: string;
  status: ProjectStatus;
  visibility: string;
  isFeatured: boolean;
  sortOrder: number;
  updatedAt: string;
  publishedAt: string | null;
}

export interface AdminProjectDetail {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  summary: string | null;
  categoryId: string | null;
  coverMediaId: string | null;
  status: ProjectStatus;
  visibility: string;
  techStack: string[];
  backgroundMdx: string | null;
  features: unknown;
  architectureMdx: string | null;
  processMdx: string | null;
  roadmapMdx: string | null;
  isFeatured: boolean;
  sortOrder: number;
  links: ProjectLink[];
  publishedAt: string | null;
}

export interface ProjectInput {
  name: string;
  slug?: string;
  tagline: string;
  summary?: string | null;
  categoryId?: string | null;
  coverMediaId?: string | null;
  status?: ProjectStatus;
  visibility?: string;
  techStack?: string[];
  backgroundMdx?: string | null;
  architectureMdx?: string | null;
  processMdx?: string | null;
  roadmapMdx?: string | null;
  isFeatured?: boolean;
  sortOrder?: number;
  links?: ProjectLink[];
}

export function useAdminProjects() {
  return useQuery({
    queryKey: ["admin", "projects"],
    queryFn: async () =>
      (await apiGet<AdminProjectListItem[]>("/admin/projects", { auth: true })).data,
  });
}

export function useAdminProject(id: string | undefined) {
  return useQuery({
    queryKey: ["admin", "project", id],
    queryFn: async () =>
      (await apiGet<AdminProjectDetail>(`/admin/projects/${id}`, { auth: true })).data,
    enabled: Boolean(id),
  });
}

export function useSaveProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id?: string; input: ProjectInput }) => {
      const res = id
        ? await apiSend<AdminProjectDetail>(`/admin/projects/${id}`, "PATCH", input, {
            auth: true,
          })
        : await apiSend<AdminProjectDetail>("/admin/projects", "POST", input, { auth: true });
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "projects"] });
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiSend(`/admin/projects/${id}`, "DELETE", undefined, { auth: true });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "projects"] });
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
