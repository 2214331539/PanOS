import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { mockPublicApi } from "./mocks";

test.beforeEach(async ({ page }) => {
  await mockPublicApi(page);
});

// 移动端首访的 Welcome 窗口全屏，先关掉再操作主屏网格。
async function openApp(page: Page, isMobile: boolean, title: string): Promise<void> {
  if (isMobile) {
    const closeWelcome = page.getByRole("button", { name: "Close Welcome to PanOS" });
    if (await closeWelcome.isVisible()) {
      await closeWelcome.click();
    }
    await page.getByLabel("PanOS apps").getByRole("button", { name: title }).click();
  } else {
    await page.getByRole("button", { name: `Open ${title}` }).click();
  }
}

test("首页展示桌面外壳，首访自动弹出欢迎窗口", async ({ page, isMobile }) => {
  await page.goto("/");

  await expect(page.getByLabel("PanOS desktop")).toBeVisible();
  if (isMobile) {
    await expect(page.getByLabel("PanOS apps")).toBeVisible();
  } else {
    await expect(page.getByLabel("PanOS Dock")).toBeVisible();
  }

  // 首访（localStorage 为空）自动打开 Welcome 窗口。
  await expect(
    page.getByLabel("Open PanOS windows").getByText("小潘同学的个人操作系统"),
  ).toBeVisible();
});

test("打开 Articles App 后看到文章卡片，URL 同步 ?app=", async ({ page, isMobile }) => {
  await page.goto("/");

  await openApp(page, isMobile, "Articles");

  await expect(page.getByRole("heading", { name: "Agent Memory 的核心价值" })).toBeVisible();
  await expect(page).toHaveURL(/app=articles/);
});

test("打开 Projects App 后看到项目卡片与技术栈", async ({ page, isMobile }) => {
  await page.goto("/");

  await openApp(page, isMobile, "Projects");

  await expect(page.getByText("浏览器里的个人操作系统")).toBeVisible();
  await expect(page.getByText("FastAPI")).toBeVisible();
});

test("Gallery 点击图片打开 Lightbox，ESC 关闭", async ({ page, isMobile }) => {
  await page.goto("/");

  await openApp(page, isMobile, "Gallery");

  // 桌面图标也叫 "PanOS Wallpaper"，把点击范围限定在窗口层内的图库瓦片。
  await page
    .getByLabel("Open PanOS windows")
    .getByRole("button", { name: "PanOS Wallpaper" })
    .click();
  const lightbox = page.getByRole("dialog", { name: "PanOS Wallpaper" });
  await expect(lightbox).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(lightbox).toBeHidden();
});

test("Links App 渲染来自 API 的社交链接", async ({ page, isMobile }) => {
  await page.goto("/");

  await openApp(page, isMobile, "Links");

  await expect(page.getByText("My code and experiments.")).toBeVisible();
  await expect(page.getByRole("link", { name: /Open/ })).toHaveAttribute(
    "href",
    "https://example.com",
  );
});

test("桌面图标双击直达最新文章", async ({ page, isMobile }) => {
  test.skip(isMobile, "桌面图标仅桌面端展示");
  await page.goto("/");

  await page.getByRole("button", { name: /文章：Agent Memory 的核心价值/ }).dblclick();

  await expect(page.getByRole("heading", { name: "Agent Memory 的核心价值" })).toBeVisible();
  await expect(page).toHaveURL(/app=articles/);
});

test("欢迎窗置顶内容卡片直达文章阅读器", async ({ page, isMobile }) => {
  test.skip(isMobile, "欢迎窗卡片流程在桌面端验证");
  await page.goto("/");

  await page.getByRole("button", { name: /最新文章 · 更新于/ }).click();

  await expect(page.getByRole("heading", { name: "Agent Memory 的核心价值" })).toBeVisible();
});

test("桌面 Widget 渲染时钟与访客计数", async ({ page, isMobile }) => {
  test.skip(isMobile, "Widget 仅宽屏桌面端展示");
  await page.goto("/");

  const widgets = page.getByLabel("PanOS widgets");
  await expect(widgets.getByText("Now")).toBeVisible();
  await expect(widgets.getByText("128 次浏览")).toBeVisible();
});

test("点击时钟 Widget 放大为日历并展示计划", async ({ page, isMobile }) => {
  test.skip(isMobile, "Widget 仅宽屏桌面端展示");
  await page.goto("/");

  // 加宽后的欢迎窗会盖住左侧 Widget 列，先关掉。
  await page.getByRole("button", { name: "Close Welcome to PanOS" }).click();
  await page.getByRole("button", { name: "打开日历查看计划" }).click();
  const calendar = page.getByRole("dialog", { name: "日历与计划" });
  await expect(calendar).toBeVisible();

  // 15 号有计划圆点，点选后议程区显示标题
  await calendar.getByRole("button", { name: /15 日（有计划）/ }).click();
  await expect(calendar.getByText("发布新文章")).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(calendar).toBeHidden();
});

test("GitHub Widget 链接到主页", async ({ page, isMobile }) => {
  test.skip(isMobile, "Widget 仅宽屏桌面端展示");
  await page.goto("/");

  const github = page.getByRole("link", { name: /打开 GitHub 主页/ });
  await expect(github).toHaveAttribute("href", /github\.com\//);
  await expect(github).toHaveAttribute("target", "_blank");
});

test("Spotlight 全文搜索可直达文章", async ({ page, isMobile }) => {
  test.skip(isMobile, "Spotlight 键盘流程在桌面端验证");
  await page.goto("/");

  await page.keyboard.press("ControlOrMeta+k");
  const spotlight = page.getByRole("dialog", { name: "Spotlight search" });
  await expect(spotlight).toBeVisible();

  await page.getByRole("combobox").fill("memory");
  await expect(spotlight.getByText("文章")).toBeVisible();
  await spotlight.getByRole("option", { name: /Agent Memory 的核心价值/ }).click();

  await expect(page.getByRole("heading", { name: "Agent Memory 的核心价值" })).toBeVisible();
});

test("V2 三个 App 渲染真实内容", async ({ page, isMobile }) => {
  await page.goto("/");

  // 移动端窗口全屏，切换 App 前需关闭当前窗口让出主屏网格。
  async function closeIfMobile(title: string) {
    if (isMobile) {
      await page.getByRole("button", { name: `Close ${title}` }).click();
    }
  }

  await openApp(page, isMobile, "Ideas");
  await expect(page.getByText("给 Agent 做一个遗忘曲线")).toBeVisible();
  await closeIfMobile("Ideas");

  await openApp(page, isMobile, "Research");
  await expect(page.getByText("Agent 记忆检索策略对比")).toBeVisible();
  await closeIfMobile("Research");

  await openApp(page, isMobile, "Timeline");
  await expect(page.getByText("PanOS 完成 V1 全部功能")).toBeVisible();
});

test("右下角问号悬浮球展示快捷键说明", async ({ page, isMobile }) => {
  test.skip(isMobile, "快捷键说明仅桌面端展示");
  await page.goto("/");

  await page.getByRole("button", { name: "快捷键说明" }).click();
  const panel = page.getByRole("dialog", { name: "快捷键说明" });
  await expect(panel).toBeVisible();
  await expect(panel.getByText("Spotlight 搜索全站内容")).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
});
