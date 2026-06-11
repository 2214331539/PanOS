import type { Page } from "@playwright/test";

// 1x1 透明 PNG，避免 E2E 依赖外网图片。
const TINY_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

const envelope = (data: unknown, meta: Record<string, unknown> = {}) => ({ data, meta });

const ARTICLE = {
  id: "a1",
  slug: "agent-memory-intro",
  title: "Agent Memory 的核心价值",
  excerpt: "为什么「记忆」是让 AI Agent 从玩具走向产品的关键一步。",
  cover: null,
  category: { name: "AI & Agent", slug: "ai-agent" },
  readingMinutes: 3,
  publishedAt: "2026-06-06T00:00:00Z",
};

const PROJECT = {
  id: "p1",
  slug: "panos",
  name: "PanOS",
  tagline: "浏览器里的个人操作系统",
  summary: "把内容组织成一个 macOS 风格的桌面空间。",
  cover: null,
  category: { name: "Web Apps", slug: "web-apps" },
  status: "building",
  techStack: ["React", "FastAPI"],
  isFeatured: true,
  links: [{ type: "github", label: "GitHub", url: "https://example.com" }],
  publishedAt: "2026-06-08T00:00:00Z",
};

const GALLERY_ITEM = {
  id: "g1",
  slug: "panos-wallpaper",
  title: "PanOS Wallpaper",
  description: "桌面壁纸",
  category: { name: "UI Design", slug: "ui-design" },
  media: { url: TINY_PNG, width: 1600, height: 1000, alt: "PanOS wallpaper" },
  tool: "Figma",
  shotAt: "2026-06-07",
  allowDownload: false,
};

const SOCIAL_LINK = {
  id: "l1",
  platform: "GitHub",
  slug: "github",
  description: "My code and experiments.",
  url: "https://example.com",
  iconName: "Github",
  isPrimary: true,
};

// 拦截全部公开 API，E2E 不依赖本地后端。
export async function mockPublicApi(page: Page): Promise<void> {
  await page.route(/\/api\/categories(\?.*)?$/, (route) =>
    route.fulfill({
      json: envelope([
        {
          id: "cat1",
          module: "articles",
          name: "AI & Agent",
          slug: "ai-agent",
          description: null,
          sortOrder: 0,
        },
      ]),
    }),
  );
  await page.route(/\/api\/articles(\?.*)?$/, (route) =>
    route.fulfill({ json: envelope([ARTICLE], { total: 1, hasMore: false }) }),
  );
  await page.route(/\/api\/articles\/[^/?]+$/, (route) =>
    route.fulfill({
      json: envelope({
        ...ARTICLE,
        bodyMdx: "## 为什么需要记忆\n\n一个没有记忆的 Agent 每次对话都从零开始。",
        previous: null,
        next: null,
      }),
    }),
  );
  await page.route(/\/api\/projects(\?.*)?$/, (route) =>
    route.fulfill({ json: envelope([PROJECT], { total: 1, hasMore: false }) }),
  );
  await page.route(/\/api\/projects\/[^/?]+$/, (route) =>
    route.fulfill({
      json: envelope({
        ...PROJECT,
        backgroundMdx: "## 为什么做 PanOS\n\n传统博客装不下多种内容类型。",
        features: null,
        architectureMdx: null,
        processMdx: null,
        roadmapMdx: null,
      }),
    }),
  );
  await page.route(/\/api\/gallery(\?.*)?$/, (route) =>
    route.fulfill({ json: envelope([GALLERY_ITEM], { total: 1, hasMore: false }) }),
  );
  await page.route(/\/api\/links$/, (route) => route.fulfill({ json: envelope([SOCIAL_LINK]) }));
  await page.route(/\/api\/contact$/, (route) =>
    route.fulfill({ status: 201, json: envelope({ id: "c1", status: "new" }) }),
  );
  await page.route(/\/api\/widgets$/, (route) =>
    route.fulfill({
      json: envelope([
        { id: "w1", type: "clock", title: "Clock", payload: {} },
        { id: "w2", type: "now", title: "Now", payload: { lines: ["正在开发：PanOS"] } },
        { id: "w3", type: "github", title: "GitHub", payload: { username: "e2e-user" } },
        { id: "w4", type: "visitors", title: "Visitors", payload: {} },
      ]),
    }),
  );
  await page.route(/\/api\/views$/, (route) =>
    route.fulfill({ status: 201, json: envelope({ path: "/x", count: 1 }) }),
  );
  await page.route(/\/api\/views\/summary$/, (route) =>
    route.fulfill({ json: envelope({ total: 128, today: 6 }) }),
  );
  await page.route(/\/api\/calendar\?.*$/, (route) => {
    // 用请求月份动态造一条 15 号的计划，保证任何月份打开日历都有事件点。
    const month = new URL(route.request().url()).searchParams.get("month") ?? "2026-06";
    return route.fulfill({
      json: envelope([{ id: "cal1", date: `${month}-15`, title: "发布新文章" }]),
    });
  });
  // GitHub 贡献热力图走外部社区 API，E2E 一律拦截避免外网依赖。
  await page.route(/github-contributions-api/, (route) =>
    route.fulfill({
      json: {
        total: {},
        contributions: Array.from({ length: 84 }, (_, i) => ({
          date: `2026-0${(i % 5) + 1}-0${(i % 9) + 1}`,
          count: i % 5,
          level: (i % 5) as 0 | 1 | 2 | 3 | 4,
        })),
      },
    }),
  );
}

// 拦截后台 API（登录 + 文章列表），覆盖登录链路。
export async function mockAdminApi(page: Page): Promise<void> {
  await page.route(/\/api\/admin\/login$/, (route) =>
    route.fulfill({
      json: envelope({ accessToken: "e2e-token", expiresAt: "2099-01-01T00:00:00Z" }),
    }),
  );
  await page.route(/\/api\/admin\/articles(\?.*)?$/, (route) =>
    route.fulfill({
      json: envelope(
        [
          {
            id: "a1",
            slug: "agent-memory-intro",
            title: "Agent Memory 的核心价值",
            status: "published",
            visibility: "public",
            categoryId: null,
            updatedAt: "2026-06-10T00:00:00Z",
            publishedAt: "2026-06-06T00:00:00Z",
          },
        ],
        { total: 1 },
      ),
    }),
  );
}
