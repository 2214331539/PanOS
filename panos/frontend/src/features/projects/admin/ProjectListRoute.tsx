import { Plus } from "lucide-react";
import { Link } from "react-router";

import { AdminLayout } from "@/features/admin/AdminLayout";
import { Button } from "@/shared/ui/Button";

import { STATUS_LABEL, type ProjectStatus } from "../api";
import { useAdminProjects, useDeleteProject } from "./api";
import styles from "./ProjectListRoute.module.css";

const STATUS_CLASS: Record<ProjectStatus, string> = {
  concept: styles.muted2,
  prototype: styles.warning,
  building: styles.info,
  launched: styles.success,
  paused: styles.muted2,
  archived: styles.muted2,
};

export function ProjectListRoute() {
  const { data, isLoading } = useAdminProjects();
  const deleteProject = useDeleteProject();
  const projects = data ?? [];

  return (
    <AdminLayout title="项目管理">
      <div className={styles.bar}>
        <span className={styles.count}>{projects.length} 个</span>
        <Button asChild>
          <Link to="/admin/projects/new">
            <Plus size={15} />
            新建项目
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <p className={styles.hint}>加载中…</p>
      ) : projects.length === 0 ? (
        <p className={styles.hint}>还没有项目，点「新建项目」开始第一个。</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>名称</th>
              <th>状态</th>
              <th>可见性</th>
              <th>更新时间</th>
              <th aria-label="操作" />
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id}>
                <td className={styles.titleCell}>
                  {project.name}
                  <span className={styles.slug}>/{project.slug}</span>
                </td>
                <td>
                  <span className={`${styles.badge} ${STATUS_CLASS[project.status]}`}>
                    {STATUS_LABEL[project.status]}
                  </span>
                </td>
                <td className={styles.muted}>{project.visibility}</td>
                <td className={styles.muted}>{project.updatedAt.slice(0, 10)}</td>
                <td className={styles.actions}>
                  <Link to={`/admin/projects/${project.id}/edit`} className={styles.edit}>
                    编辑
                  </Link>
                  <button
                    type="button"
                    className={styles.delete}
                    disabled={deleteProject.isPending}
                    onClick={() => {
                      if (window.confirm(`确定删除项目「${project.name}」？此操作不可撤销。`)) {
                        deleteProject.mutate(project.id);
                      }
                    }}
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AdminLayout>
  );
}
