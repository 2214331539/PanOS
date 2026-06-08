import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DesktopShell } from "../components/desktop/DesktopShell";
import { TooltipProvider } from "../components/ui/tooltip";

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
