import { Link } from "react-router";

import { Button } from "@/shared/ui/Button";

import styles from "./AdminAuth.module.css";

export function AdminDashboardRoute() {
  return (
    <main className={styles.shell}>
      <section className={styles.panel}>
        <p className={styles.eyebrow}>Protected</p>
        <h1>后台 Dashboard 空壳</h1>
        <p>这里会在 Phase 5 接入 Supabase 登录保护、内容统计和待处理留言。</p>
        <Button asChild variant="secondary">
          <Link to="/admin/login">前往登录页</Link>
        </Button>
      </section>
    </main>
  );
}
