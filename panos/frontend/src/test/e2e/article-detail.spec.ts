import { expect, test } from "@playwright/test";

import { mockPublicApi } from "./mocks";

test("文章详情直达路由渲染标题与正文", async ({ page }) => {
  await mockPublicApi(page);
  await page.goto("/articles/agent-memory-intro");

  await expect(
    page.getByRole("heading", { level: 1, name: "Agent Memory 的核心价值" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "为什么需要记忆" })).toBeVisible();
  await expect(page.getByRole("button", { name: "返回 PanOS 桌面" })).toBeVisible();
});

test("项目详情直达路由渲染项目信息", async ({ page }) => {
  await mockPublicApi(page);
  await page.goto("/projects/panos");

  await expect(page.getByRole("heading", { level: 1, name: "PanOS" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "项目背景" })).toBeVisible();
  await expect(page.getByRole("link", { name: /GitHub/ })).toHaveAttribute(
    "href",
    "https://example.com",
  );
});

test("未知路由展示 404 页面", async ({ page }) => {
  await mockPublicApi(page);
  await page.goto("/definitely/not/a/page");

  await expect(page.getByText(/404|不存在|找不到/).first()).toBeVisible();
});
