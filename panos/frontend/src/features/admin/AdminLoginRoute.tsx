import { LockKeyhole } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router";

import { useAuthStore } from "@/shared/stores/auth-store";
import { Button } from "@/shared/ui/Button";

import { login } from "./api";
import styles from "./AdminAuth.module.css";

export function AdminLoginRoute() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const signIn = useAuthStore((state) => state.signIn);

  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/admin/articles" replace />;
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const token = await login(username, password);
      signIn(token);
      void navigate("/admin/articles");
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.shell}>
      <section className={styles.panel}>
        <div className={styles.icon} aria-hidden="true">
          <LockKeyhole size={24} />
        </div>
        <p className={styles.eyebrow}>PanOS Admin</p>
        <h1>内容管理后台</h1>
        <p>用账号密码登录，撰写和管理你的文章。</p>
        <form className={styles.form} onSubmit={(event) => void submit(event)}>
          <label>
            账号
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
            />
          </label>
          <label>
            密码
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
          </label>
          {error ? <p className={styles.error}>{error}</p> : null}
          <Button type="submit" disabled={loading}>
            {loading ? "登录中…" : "登录"}
          </Button>
        </form>
      </section>
    </main>
  );
}
