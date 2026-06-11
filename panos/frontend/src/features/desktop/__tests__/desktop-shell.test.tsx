import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it } from "vitest";

import { TooltipProvider } from "@/shared/ui/Tooltip";

import { DesktopShell } from "../DesktopShell";
import { useWindowStore } from "../window-store";

// 测试不发真实请求：retry 关掉，查询保持 pending/empty 即可。
function renderShell(children: ReactNode, initialEntries?: string[]) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <TooltipProvider>{children}</TooltipProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("DesktopShell", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    // zustand store 是模块级单例，测试间手动复位。
    useWindowStore.setState({ windows: {}, activeWindowId: null, nextZIndex: 10 });
  });

  it("renders the PanOS desktop and dock", () => {
    renderShell(<DesktopShell />);

    expect(screen.getByLabelText("PanOS desktop")).toBeInTheDocument();
    expect(screen.getByLabelText("PanOS Dock")).toBeInTheDocument();
    // 会话首访（无 sessionStorage 标记）自动弹出 Welcome 窗口。
    expect(screen.getAllByText("Welcome to PanOS").length).toBeGreaterThan(0);
  });

  it("opens the window referenced by the ?app= deep link", () => {
    renderShell(<DesktopShell />, ["/?app=contact"]);

    expect(screen.getByRole("article", { name: "Contact" })).toBeInTheDocument();
  });
});
