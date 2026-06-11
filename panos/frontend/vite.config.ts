import { fileURLToPath, URL } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/shared/test/setup.ts",
    // E2E（Playwright）的 *.spec.ts 不归 Vitest 跑
    exclude: ["**/node_modules/**", "src/test/e2e/**"],
  },
});
