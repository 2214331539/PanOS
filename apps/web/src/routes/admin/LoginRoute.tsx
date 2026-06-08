import { LockKeyhole } from "lucide-react";

import { Button } from "../../components/ui/button";
import styles from "./AdminAuth.module.css";

export function LoginRoute() {
  return (
    <main className={styles.shell}>
      <section className={styles.panel}>
        <div className={styles.icon} aria-hidden="true">
          <LockKeyhole size={24} />
        </div>
        <p className={styles.eyebrow}>PanOS Admin</p>
        <h1>内容管理后台</h1>
        <p>Supabase Auth 登录入口已经预留。Phase 5 会接入真实管理员鉴权。</p>
        <form className={styles.form}>
          <label>
            邮箱
            <input type="email" placeholder="admin@example.com" disabled />
          </label>
          <label>
            密码
            <input type="password" placeholder="••••••••" disabled />
          </label>
          <Button type="button" disabled>
            等待鉴权接入
          </Button>
        </form>
      </section>
    </main>
  );
}

