import { ArrowRight, Mail, Newspaper } from "lucide-react";

import { PANOS_PROFILE } from "../../lib/constants/copy";
import { useWindowStore } from "../../stores/window-store";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import shell from "./shared/appShell.module.css";
import styles from "./WelcomeApp.module.css";

export function WelcomeApp() {
  const openWindow = useWindowStore((state) => state.openWindow);
  const closeWindow = useWindowStore((state) => state.closeWindow);

  return (
    <section className={styles.welcome}>
      <p className={shell.eyebrow}>Welcome to PanOS</p>
      <h1 className={shell.heading}>小潘同学的个人操作系统</h1>
      <p className={styles.lead}>I build AI agents, web products, and strange little ideas.</p>
      <div className={shell.inlineRow}>
        {PANOS_PROFILE.roles.map((role) => (
          <Badge key={role} tone="blue">
            {role}
          </Badge>
        ))}
      </div>
      <div className={shell.actions}>
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
      </div>
    </section>
  );
}

