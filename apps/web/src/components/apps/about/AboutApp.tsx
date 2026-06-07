import { Mail, Newspaper, PanelsTopLeft } from "lucide-react";

import { PANOS_PROFILE } from "../../../lib/constants/panos-copy";
import { useWindowStore } from "../../../stores/window-store";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";

export function AboutApp() {
  const openWindow = useWindowStore((state) => state.openWindow);

  return (
    <section className="about-app">
      <div className="about-app__identity">
        <div className="about-app__avatar" aria-hidden="true">
          P
        </div>
        <div>
          <p className="window-eyebrow">Model Name</p>
          <h1>{PANOS_PROFILE.englishName}</h1>
          <p>{PANOS_PROFILE.intro}</p>
        </div>
      </div>

      <div className="about-app__roles">
        {PANOS_PROFILE.roles.map((role) => (
          <Badge key={role}>{role}</Badge>
        ))}
      </div>

      <div className="system-info">
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

      <div className="focus-list">
        <h2>Current Focus</h2>
        <ul>
          {PANOS_PROFILE.focus.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="app-actions">
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
      </div>
    </section>
  );
}

