import type { WindowAppId } from "../../lib/constants/dock-apps";
import { AboutApp } from "./about/AboutApp";
import { ArticlesApp } from "./articles/ArticlesApp";
import { ComingSoonApp } from "./coming-soon/ComingSoonApp";
import { ContactApp } from "./contact/ContactApp";
import { GalleryApp } from "./gallery/GalleryApp";
import { LinksApp } from "./links/LinksApp";
import { PreferencesApp } from "./PreferencesApp";
import { ProjectsApp } from "./projects/ProjectsApp";
import { WelcomeApp } from "./WelcomeApp";

export function AppWindowContent({ id }: { id: WindowAppId }) {
  switch (id) {
    case "welcome":
      return <WelcomeApp />;
    case "preferences":
      return <PreferencesApp />;
    case "about":
      return <AboutApp />;
    case "articles":
      return <ArticlesApp />;
    case "projects":
      return <ProjectsApp />;
    case "gallery":
      return <GalleryApp />;
    case "links":
      return <LinksApp />;
    case "contact":
      return <ContactApp />;
    case "ideas":
      return <ComingSoonApp title="Ideas" stage="V2" />;
    case "research":
      return <ComingSoonApp title="Research" stage="V2" />;
    case "timeline":
      return <ComingSoonApp title="Timeline" stage="V2" />;
  }
}

