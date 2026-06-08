import { Badge } from "../../ui/badge";
import shell from "../shared/appShell.module.css";
import styles from "./ComingSoonApp.module.css";

export function ComingSoonApp({ title, stage }: { title: string; stage: string }) {
  return (
    <section className={styles.comingSoon}>
      <Badge tone="amber">{stage}</Badge>
      <h1 className={shell.heading}>{title}</h1>
      <p>这个 App 在版本规划里已经保留入口。当前 V1 先完成公开桌面、基础内容 App、后台和 API。</p>
    </section>
  );
}

