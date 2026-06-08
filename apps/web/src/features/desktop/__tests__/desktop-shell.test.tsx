import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TooltipProvider } from "@/shared/ui/Tooltip";

import { DesktopShell } from "../DesktopShell";

describe("DesktopShell", () => {
  it("renders the PanOS desktop and dock", () => {
    render(
      <TooltipProvider>
        <DesktopShell />
      </TooltipProvider>,
    );

    expect(screen.getByLabelText("PanOS desktop")).toBeInTheDocument();
    expect(screen.getByLabelText("PanOS Dock")).toBeInTheDocument();
    expect(screen.getAllByText("Welcome to PanOS").length).toBeGreaterThan(0);
  });
});
