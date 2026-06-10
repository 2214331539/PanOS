import { ExternalLink, Link2 } from "lucide-react";

import { AppHeader } from "@/shared/ui/AppHeader";
import { Button } from "@/shared/ui/Button";
import { EmptyState } from "@/shared/ui/EmptyState";

import { useLinks } from "./api";
import styles from "./LinksApp.module.css";

export function LinksApp() {
  const { data: links, isLoading } = useLinks();
  const list = links ?? [];

  return (
    <section>
      <AppHeader eyebrow="Links" title="社交账号控制面板" />
      {isLoading ? (
        <p className={styles.hint}>加载中…</p>
      ) : list.length === 0 ? (
        <EmptyState
          icon={<Link2 size={30} />}
          title="还没有公开的社交链接。"
          description="它们会由后台 Links 模块维护。"
        />
      ) : (
        <div className={styles.linksGrid}>
          {list.map((link) => (
            <article className={styles.linkCard} key={link.id}>
              <div className={styles.linkCardIcon} aria-hidden="true">
                {link.platform.slice(0, 1)}
              </div>
              <div>
                <h2>{link.platform}</h2>
                <p>{link.description}</p>
              </div>
              <Button asChild variant="secondary">
                <a href={link.url} target="_blank" rel="noreferrer">
                  <ExternalLink size={15} />
                  Open
                </a>
              </Button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
