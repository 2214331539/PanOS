import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it } from "vitest";

import { TooltipProvider } from "@/shared/ui/Tooltip";

import { DesktopShell } from "../DesktopShell";
import { useWindowStore } from "../window-store";

describe("DesktopShell", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    // zustand store 是模块级单例，测试间手动复位。
    useWindowStore.setState({ windows: {}, activeWindowId: null, nextZIndex: 10 });
  });

  it("renders the PanOS desktop and dock", () => {
    render(
      <MemoryRouter>
        <TooltipProvider>
          <DesktopShell />
        </TooltipProvider>
      </MemoryRouter>,
    );

    expect(screen.getByLabelText("PanOS desktop")).toBeInTheDocument();
    expect(screen.getByLabelText("PanOS Dock")).toBeInTheDocument();
    // 会话首访（无 sessionStorage 标记）自动弹出 Welcome 窗口。
    expect(screen.getAllByText("Welcome to PanOS").length).toBeGreaterThan(0);
  });

  it("opens the window referenced by the ?app= deep link", () => {
    render(
      <MemoryRouter initialEntries={["/?app=contact"]}>
        <TooltipProvider>
          <DesktopShell />
        </TooltipProvider>
      </MemoryRouter>,
    );

    expect(screen.getByRole("article", { name: "Contact" })).toBeInTheDocument();
  });
});
