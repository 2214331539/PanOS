import { LockKeyhole } from "lucide-react";
import { Navigate, useNavigate } from "react-router";

import { LoginForm } from "@/features/auth/LoginForm";
import { useAuthStore } from "@/shared/stores/auth-store";

import styles from "./AdminAuth.module.css";

// /admin/login 整页登录（深链兜底；首页登录走菜单栏弹窗）。
export function AdminLoginRoute() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/admin/articles" replace />;
  }

  return (
    <main className={styles.shell}>
      <section className={styles.panel}>
        <div className={styles.icon} aria-hidden="true">
          <LockKeyhole size={24} />
        </div>
        <p className={styles.eyebrow}>PanOS Admin</p>
        <h1>内容管理后台</h1>
        <p>用账号密码登录，撰写和管理你的内容。</p>
        <LoginForm
          onSuccess={() => {
            void navigate("/admin/articles");
          }}
        />
      </section>
    </main>
  );
}
