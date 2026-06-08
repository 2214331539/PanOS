import { describe, expect, it } from "vitest";

import { useWindowStore } from "../window-store";

describe("window store", () => {
  it("opens and focuses app windows", () => {
    useWindowStore.getState().openWindow("articles");
    useWindowStore.getState().openWindow("projects");

    const state = useWindowStore.getState();

    expect(state.windows.articles?.isOpen).toBe(true);
    expect(state.windows.projects?.isOpen).toBe(true);
    expect(state.activeWindowId).toBe("projects");
    expect(state.windows.projects?.zIndex).toBeGreaterThan(state.windows.articles?.zIndex ?? 0);
  });
});
