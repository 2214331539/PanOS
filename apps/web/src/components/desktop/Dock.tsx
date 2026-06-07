import { Atom, Briefcase, Clock, FileText, Image, Lightbulb, Link, Mail, User } from "lucide-react";
import type { ComponentType, SVGProps } from "react";

import { DOCK_APPS, type DockAppId } from "../../lib/constants/dock-apps";
import { useWindowStore } from "../../stores/window-store";
import { Tooltip } from "../ui/tooltip";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const APP_ICONS: Record<DockAppId, IconComponent> = {
  about: User,
  articles: FileText,
  ideas: Lightbulb,
  projects: Briefcase,
  gallery: Image,
  research: Atom,
  timeline: Clock,
  links: Link,
  contact: Mail,
};

export function Dock() {
  const windows = useWindowStore((state) => state.windows);
  const openWindow = useWindowStore((state) => state.openWindow);
  const focusWindow = useWindowStore((state) => state.focusWindow);

  return (
    <nav className="dock" aria-label="PanOS Dock">
      {DOCK_APPS.map((app) => {
        const Icon = APP_ICONS[app.id];
        const windowState = windows[app.id];
        const isOpen = Boolean(windowState?.isOpen);

        return (
          <Tooltip key={app.id} label={`${app.title}${app.stage ? ` · ${app.stage}` : ""}`}>
            <button
              className="dock__item"
              type="button"
              aria-label={`Open ${app.title}`}
              onClick={() => (isOpen ? focusWindow(app.id) : openWindow(app.id))}
            >
              <span className={`dock__icon app-icon app-icon--${app.accent}`}>
                <Icon aria-hidden="true" size={25} strokeWidth={2.2} />
              </span>
              <span className="dock__label">{app.title}</span>
              {isOpen ? <span className="dock__dot" aria-hidden="true" /> : null}
            </button>
          </Tooltip>
        );
      })}
    </nav>
  );
}

