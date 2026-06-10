import { type FormEvent, useState } from "react";

import { useAuthStore } from "@/shared/stores/auth-store";
import { Button } from "@/shared/ui/Button";

import { login } from "./api";
import styles from "./LoginForm.module.css";

// 账号密码登录表单，供菜单栏弹窗与 /admin/login 整页复用。
export function LoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const signIn = useAuthStore((state) => state.signIn);
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const token = await login(username, password);
      signIn(token);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setLoading(false);
    }
  }

  return (
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
  );
}
