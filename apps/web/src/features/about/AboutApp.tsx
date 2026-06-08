import { Mail, Newspaper, PanelsTopLeft } from "lucide-react";

import { useWindowStore } from "@/features/desktop/window-store";
import { PANOS_PROFILE } from "@/shared/constants/profile";
import { ActionRow } from "@/shared/ui/ActionRow";
import { AppHeader } from "@/shared/ui/AppHeader";
import { BadgeRow } from "@/shared/ui/BadgeRow";
import { Button } from "@/shared/ui/Button";

import styles from "./AboutApp.module.css";

export function AboutApp() {
  const openWindow = useWindowStore((state) => state.openWindow);

  return (
    <section className={styles.about}>
      <div className={styles.identity}>
        <div className={styles.avatar} aria-hidden="true">
          P
        </div>
        <div>
          <AppHeader eyebrow="Model Name" title={PANOS_PROFILE.englishName} />
          <p>{PANOS_PROFILE.intro}</p>
        </div>
      </div>

      <BadgeRow items={PANOS_PROFILE.roles} />

      <div className={styles.systemInfo}>
        <div>
          <span>Chip</span>
          <strong>AI / Product / Web</strong>
        </div>
        <div>
          <span>Memory</span>
          <strong>Ideas, Projects, Notes</strong>
        </div>
        <div>
          <span>Current Version</span>
          <strong>2026</strong>
        </div>
        <div>
          <span>Status</span>
          <strong>{PANOS_PROFILE.currentMode}</strong>
        </div>
      </div>

      <div className={styles.focusList}>
        <h2>Current Focus</h2>
        <ul>
          {PANOS_PROFILE.focus.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <ActionRow>
        <Button onClick={() => openWindow("projects")}>
          <PanelsTopLeft size={16} />
          View Projects
        </Button>
        <Button variant="secondary" onClick={() => openWindow("articles")}>
          <Newspaper size={16} />
          Read Articles
        </Button>
        <Button variant="ghost" onClick={() => openWindow("contact")}>
          <Mail size={16} />
          Contact
        </Button>
      </ActionRow>
    </section>
  );
}
