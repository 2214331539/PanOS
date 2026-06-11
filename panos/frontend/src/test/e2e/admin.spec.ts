import { expect, test } from "@playwright/test";

import { mockAdminApi, mockPublicApi } from "./mocks";

test("未登录访问后台会跳转到登录页", async ({ page }) => {
  await page.goto("/admin/articles");

  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(page.getByRole("heading", { name: "内容管理后台" })).toBeVisible();
});

test("登录成功后进入文章管理", async ({ page }) => {
  await mockPublicApi(page);
  await mockAdminApi(page);
  await page.goto("/admin/login");

  await page.getByLabel("账号").fill("admin");
  await page.getByLabel("密码").fill("e2e-password");
  await page.getByRole("button", { name: "登录" }).click();

  await expect(page).toHaveURL(/\/admin\/articles/);
  await expect(page.getByRole("heading", { name: "文章管理" })).toBeVisible();
  await expect(page.getByText("Agent Memory 的核心价值")).toBeVisible();
});

test("后台导航包含项目、图库和链接管理入口", async ({ page }) => {
  await mockPublicApi(page);
  await mockAdminApi(page);
  await page.goto("/admin/login");
  await page.getByLabel("密码").fill("e2e-password");
  await page.getByRole("button", { name: "登录" }).click();
  await expect(page).toHaveURL(/\/admin\/articles/);

  const nav = page.getByRole("navigation", { name: "后台导航" });
  await expect(nav.getByRole("link", { name: "项目" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "图库" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "链接" })).toBeVisible();
});
