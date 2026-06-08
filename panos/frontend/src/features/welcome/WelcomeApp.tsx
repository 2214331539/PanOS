import { ArrowRight, Mail, Newspaper } from "lucide-react";

import { useWindowStore } from "@/features/desktop/window-store";
import { PANOS_PROFILE } from "@/shared/constants/profile";
import { ActionRow } from "@/shared/ui/ActionRow";
import { AppHeader } from "@/shared/ui/AppHeader";
import { BadgeRow } from "@/shared/ui/BadgeRow";
import { Button } from "@/shared/ui/Button";

import styles from "./WelcomeApp.module.css";

export function WelcomeApp() {
  const openWindow = useWindowStore((state) => state.openWindow);
  const closeWindow = useWindowStore((state) => state.closeWindow);

  return (
    <section className={styles.welcome}>
      <AppHeader eyebrow="Welcome to PanOS" title="小潘同学的个人操作系统" />
      <p className={styles.lead}>I build AI agents, web products, and strange little ideas.</p>
      <BadgeRow items={PANOS_PROFILE.roles} tone="blue" />
      <ActionRow>
        <Button
          onClick={() => {
            closeWindow("welcome");
            openWindow("about");
          }}
        >
          <ArrowRight size={16} />
          开始探索
        </Button>
        <Button variant="secondary" onClick={() => openWindow("articles")}>
          <Newspaper size={16} />
          查看最新文章
        </Button>
        <Button variant="ghost" onClick={() => openWindow("contact")}>
          <Mail size={16} />
          联系我
        </Button>
      </ActionRow>
    </section>
  );
}
