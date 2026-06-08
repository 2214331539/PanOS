import { Link, useParams } from "react-router";

import { Button } from "../../components/ui/button";
import styles from "./DirectRoute.module.css";

export function ProjectRoute() {
  const { slug } = useParams();

  return (
    <main className={styles.shell}>
      <section className={styles.panel}>
        <p className={styles.eyebrow}>PanOS Project</p>
        <h1>{slug ?? "Project"}</h1>
        <p>
          项目详情直达路由已经接入。后续会按照文档从
          <code> /api/projects/[slug]</code> 加载项目背景、功能、截图和链接。
        </p>
        <Button asChild>
          <Link to="/">返回 PanOS 桌面</Link>
        </Button>
      </section>
    </main>
  );
}

