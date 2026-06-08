import { ExternalLink } from "lucide-react";

import { AppHeader } from "@/shared/ui/AppHeader";
import { Button } from "@/shared/ui/Button";
import { Hint } from "@/shared/ui/Hint";

import { SOCIAL_LINKS } from "./data";
import styles from "./LinksApp.module.css";

export function LinksApp() {
  return (
    <section>
      <AppHeader eyebrow="Links" title="社交账号控制面板" />
      <div className={styles.linksGrid}>
        {SOCIAL_LINKS.map((link) => (
          <article className={styles.linkCard} key={link.slug}>
            <div className={styles.linkCardIcon} aria-hidden="true">
              {link.platform.slice(0, 1)}
            </div>
            <div>
              <h2>{link.platform}</h2>
              <p>{link.description}</p>
            </div>
            <Button variant="secondary" disabled>
              <ExternalLink size={15} />
              Open
            </Button>
          </article>
        ))}
      </div>
      <Hint>真实 URL 会由后台 Links 模块维护，前端不会写死社交账号地址。</Hint>
    </section>
  );
}
