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

  await expect(page.getByText("Agent Memory 的核心价值")).toBeVisible();
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

  await page.getByRole("button", { name: "PanOS Wallpaper" }).click();
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
