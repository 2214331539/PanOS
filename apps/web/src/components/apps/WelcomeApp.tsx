import { ArrowRight, Mail, Newspaper } from "lucide-react";

import { PANOS_PROFILE } from "../../lib/constants/panos-copy";
import { useWindowStore } from "../../stores/window-store";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

export function WelcomeApp() {
  const openWindow = useWindowStore((state) => state.openWindow);
  const closeWindow = useWindowStore((state) => state.closeWindow);

  return (
    <section className="welcome-app">
      <p className="window-eyebrow">Welcome to PanOS</p>
      <h1>小潘同学的个人操作系统</h1>
      <p className="welcome-app__lead">I build AI agents, web products, and strange little ideas.</p>
      <div className="welcome-app__roles">
        {PANOS_PROFILE.roles.map((role) => (
          <Badge key={role} tone="blue">
            {role}
          </Badge>
        ))}
      </div>
      <div className="welcome-app__actions">
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

