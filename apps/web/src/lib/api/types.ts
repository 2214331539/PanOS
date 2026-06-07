export interface DesktopBootstrap {
  profile: {
    name: string;
    englishName: string;
    subtitle: string;
    currentMode: string;
    roles: string[];
  };
  wallpaper: {
    type: "image" | "video";
    url: string;
    alt: string;
  };
  widgets: Array<{ id: string; type: string; title: string; payload: unknown }>;
  latest: {
    articles: unknown[];
    projects: unknown[];
    timeline: unknown[];
  };
  links: Array<{
    id: string;
    platform: string;
    slug: string;
    description: string;
    url: string;
    iconName?: string | null;
    isPrimary: boolean;
  }>;
}

export interface ApiEnvelope<TData> {
  data: TData;
  meta?: Record<string, unknown>;
}

