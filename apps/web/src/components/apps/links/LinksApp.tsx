import { ExternalLink } from "lucide-react";

import { SOCIAL_LINKS } from "../../../lib/constants/panos-copy";
import { Button } from "../../ui/button";

export function LinksApp() {
  return (
    <section className="links-app">
      <p className="window-eyebrow">Links</p>
      <h1>社交账号控制面板</h1>
      <div className="links-grid">
        {SOCIAL_LINKS.map((link) => (
          <article className="link-card" key={link.slug}>
            <div className="link-card__icon" aria-hidden="true">
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
      <p className="window-note">真实 URL 会由后台 Links 模块维护，前端不会写死社交账号地址。</p>
    </section>
  );
}

