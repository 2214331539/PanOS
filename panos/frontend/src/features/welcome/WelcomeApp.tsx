import { ArrowRight, Mail, Newspaper } from "lucide-react";

import { useArticles } from "@/features/articles/api";
import { useWindowStore } from "@/features/desktop/window-store";
import { PANOS_PROFILE } from "@/shared/constants/profile";
import { ActionRow } from "@/shared/ui/ActionRow";
import { AppHeader } from "@/shared/ui/AppHeader";
import { BadgeRow } from "@/shared/ui/BadgeRow";
import { Button } from "@/shared/ui/Button";
import { Hint } from "@/shared/ui/Hint";

import styles from "./WelcomeApp.module.css";

function daysAgo(iso: string | null): string | null {
  if (!iso) return null;
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "今天";
  if (days === 1) return "昨天";
  return `${days} 天前`;
}

export function WelcomeApp() {
  const openWindow = useWindowStore((state) => state.openWindow);
  const closeWindow = useWindowStore((state) => state.closeWindow);
  const { data: articles } = useArticles();
  const latest = articles?.[0];
  const updatedAgo = daysAgo(latest?.publishedAt ?? null);

  function openLatest() {
    if (!latest) return;
    closeWindow("welcome");
    openWindow("articles", { slug: latest.slug });
  }

  return (
    <section className={styles.welcome}>
      <AppHeader eyebrow="Welcome to PanOS" title="小潘同学的个人操作系统" />
      <p className={styles.lead}>I build AI agents, web products, and strange little ideas.</p>
      <BadgeRow items={PANOS_PROFILE.roles} tone="blue" />

      {latest ? (
        <button type="button" className={styles.featured} onClick={openLatest}>
          <span className={styles.featuredEyebrow}>
            最新文章{updatedAgo ? ` · 更新于${updatedAgo}` : ""}
          </span>
          <strong className={styles.featuredTitle}>{latest.title}</strong>
          <span className={styles.featuredExcerpt}>{latest.excerpt}</span>
          <span className={styles.featuredCta}>
            阅读全文 <ArrowRight size={13} aria-hidden="true" />
          </span>
        </button>
      ) : null}

      <ActionRow>
        <Button onClick={openLatest} disabled={!latest}>
          <Newspaper size={16} />
          查看最新文章
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            closeWindow("welcome");
            openWindow("about");
          }}
        >
          <ArrowRight size={16} />
          开始探索
        </Button>
        <Button variant="ghost" onClick={() => openWindow("contact")}>
          <Mail size={16} />
          联系我
        </Button>
      </ActionRow>
      <Hint>小提示：桌面端按 ⌘K（或 Ctrl+K）可随时打开 Spotlight，快速跳转到任意应用。</Hint>
    </section>
  );
}
