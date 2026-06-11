import { expect, test } from "@playwright/test";

import { mockPublicApi } from "./mocks";

test.beforeEach(async ({ page }) => {
  await mockPublicApi(page);
  await page.goto("/?app=contact");
});

test("Contact 表单校验失败时提示错误", async ({ page }) => {
  await page.getByLabel("姓名").fill("访客");
  await page.getByLabel("邮箱").fill("not-an-email");
  await page.getByLabel("内容").fill("太短");
  await page.getByRole("button", { name: "Send Message" }).click();

  await expect(page.getByText("请输入有效邮箱")).toBeVisible();
  await expect(page.getByText("内容至少 10 字")).toBeVisible();
});

test("Contact 表单提交成功后展示确认信息", async ({ page }) => {
  await page.getByLabel("姓名").fill("访客");
  await page.getByLabel("邮箱").fill("visitor@example.com");
  await page.getByLabel("主题").fill("研究交流");
  await page.getByLabel("内容").fill("你好，我想交流一下 PanOS 这个项目的设计。");
  await page.getByRole("button", { name: "Send Message" }).click();

  await expect(page.getByText("留言已进入 PanOS，我会尽快回复你。")).toBeVisible();
});
