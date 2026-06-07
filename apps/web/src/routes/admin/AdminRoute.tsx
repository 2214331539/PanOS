import { Link } from "react-router";

import { Button } from "../../components/ui/button";

export function AdminRoute() {
  return (
    <main className="admin-shell">
      <section className="admin-login">
        <p className="admin-login__eyebrow">Protected</p>
        <h1>后台 Dashboard 空壳</h1>
        <p>这里会在 Phase 5 接入 Supabase 登录保护、内容统计和待处理留言。</p>
        <Button asChild variant="secondary">
          <Link to="/admin/login">前往登录页</Link>
        </Button>
      </section>
    </main>
  );
}

