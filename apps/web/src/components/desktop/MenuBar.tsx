import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Info, Mail, Monitor, RotateCcw, Search, Settings, SunMedium } from "lucide-react";
import { useEffect, useState } from "react";

import { WINDOW_TITLES } from "../../lib/constants/dock-apps";
import { useSpotlightStore } from "../../stores/spotlight-store";
import { useThemeStore } from "../../stores/theme-store";
import { useWindowStore } from "../../stores/window-store";
import { IconButton } from "../ui/button";
import { Tooltip } from "../ui/tooltip";

function formatClock(date: Date) {
  return date.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MenuBar() {
  const [clock, setClock] = useState(() => formatClock(new Date()));
  const activeWindowId = useWindowStore((state) => state.activeWindowId);
  const openWindow = useWindowStore((state) => state.openWindow);
  const restartIntro = useWindowStore((state) => state.restartIntro);
  const openSpotlight = useSpotlightStore((state) => state.open);
  const cycleMode = useThemeStore((state) => state.cycleMode);
  const mode = useThemeStore((state) => state.mode);

  useEffect(() => {
    const id = window.setInterval(() => setClock(formatClock(new Date())), 30_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <header className="menu-bar">
      <div className="menu-bar__left">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger className="menu-bar__brand">
            <span aria-hidden="true">◆</span>
            PanOS
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className="menu-dropdown" align="start" sideOffset={8}>
              <DropdownMenu.Item className="menu-dropdown__item" onSelect={() => openWindow("about")}>
                <Info size={15} />
                About PanOS
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className="menu-dropdown__item"
                onSelect={() => openWindow("preferences")}
              >
                <Settings size={15} />
                System Preferences
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className="menu-dropdown__item"
                onSelect={() => openWindow("contact")}
              >
                <Mail size={15} />
                Contact Me
              </DropdownMenu.Item>
              <DropdownMenu.Item className="menu-dropdown__item" onSelect={restartIntro}>
                <RotateCcw size={15} />
                Restart Intro
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
        <span className="menu-bar__active">{activeWindowId ? WINDOW_TITLES[activeWindowId] : "Desktop"}</span>
      </div>

      <div className="menu-bar__right">
        <Tooltip label="Open Spotlight">
          <IconButton label="Open Spotlight" onClick={openSpotlight}>
            <Search size={16} />
          </IconButton>
        </Tooltip>
        <Tooltip label={`Theme: ${mode}`}>
          <IconButton label="Cycle theme" onClick={cycleMode}>
            {mode === "system" ? <Monitor size={16} /> : <SunMedium size={16} />}
          </IconButton>
        </Tooltip>
        <time className="menu-bar__clock">{clock}</time>
      </div>
    </header>
  );
}

