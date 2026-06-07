import { Badge } from "../../ui/badge";

export function ComingSoonApp({ title, stage }: { title: string; stage: string }) {
  return (
    <section className="coming-soon-app">
      <Badge tone="amber">{stage}</Badge>
      <h1>{title}</h1>
      <p>这个 App 在版本规划里已经保留入口。当前 V1 先完成公开桌面、基础内容 App、后台和 API。</p>
    </section>
  );
}

