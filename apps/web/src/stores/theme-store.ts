import { create } from "zustand";

export type ThemeMode = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

interface ThemeStore {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  cycleMode: () => void;
}

const storageKey = "panos-theme-mode";
const modes: ThemeMode[] = ["system", "light", "dark"];

function readStoredMode(): ThemeMode {
  if (typeof window === "undefined") {
    return "system";
  }

  const value = window.localStorage.getItem(storageKey);
  return value === "light" || value === "dark" || value === "system" ? value : "system";
}

export function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode !== "system") {
    return mode;
  }

  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(mode: ThemeMode) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.dataset.theme = resolveTheme(mode);
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  mode: readStoredMode(),
  setMode: (mode) => {
    window.localStorage.setItem(storageKey, mode);
    applyTheme(mode);
    set({ mode });
  },
  cycleMode: () => {
    const currentIndex = modes.indexOf(get().mode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    get().setMode(nextMode);
  },
}));

