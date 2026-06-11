import { STATUS_LABEL, type ProjectCard as ProjectCardData } from "./api";
import styles from "./ProjectCard.module.css";

export function ProjectCard({
  project,
  onOpen,
}: {
  project: ProjectCardData;
  onOpen: (slug: string) => void;
}) {
  return (
    <button type="button" className={styles.card} onClick={() => onOpen(project.slug)}>
      {project.cover ? (
        <img
          className={styles.cover}
          src={project.cover.url}
          alt={project.cover.alt ?? project.name}
        />
      ) : (
        <div className={styles.coverFallback} aria-hidden="true">
          {project.name.slice(0, 1)}
        </div>
      )}
      <div className={styles.body}>
        <div className={styles.meta}>
          <span className={`${styles.status} ${styles[project.status]}`}>
            {STATUS_LABEL[project.status]}
          </span>
          {project.category ? <span>{project.category.name}</span> : null}
        </div>
        <h3 className={styles.name}>{project.name}</h3>
        <p className={styles.tagline}>{project.tagline}</p>
        {project.techStack.length > 0 ? (
          <div className={styles.stack}>
            {project.techStack.map((tech) => (
              <span key={tech} className={styles.tech}>
                {tech}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </button>
  );
}
