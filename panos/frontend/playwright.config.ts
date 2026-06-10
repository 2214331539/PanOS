import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./src/test/e2e",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:5199",
    trace: "on-first-retry",
  },
  // E2E 用独立端口 + 不复用现有进程：避免误连开发用的 5173（可能跑着旧代码）。
  // strictPort 让残留进程直接报「端口被占」而不是被悄悄复用。
  webServer: {
    command: "pnpm dev --host 127.0.0.1 --port 5199 --strictPort",
    url: "http://127.0.0.1:5199",
    reuseExistingServer: false,
  },
  projects: [
    { name: "chromium-desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-safari", use: { ...devices["iPhone 13"] } },
  ],
});

