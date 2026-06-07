import { create } from "zustand";

import type { WindowAppId } from "../lib/constants/dock-apps";
import { WINDOW_TITLES } from "../lib/constants/dock-apps";

export interface PanosWindow {
  id: WindowAppId;
  title: string;
  isOpen: boolean;
  isMaximized: boolean;
  isMinimized: boolean;
  zIndex: number;
}

interface WindowStore {
  windows: Record<WindowAppId, PanosWindow | undefined>;
  activeWindowId: WindowAppId | null;
  nextZIndex: number;
  openWindow: (id: WindowAppId) => void;
  closeWindow: (id: WindowAppId) => void;
  minimizeWindow: (id: WindowAppId) => void;
  toggleMaximize: (id: WindowAppId) => void;
  focusWindow: (id: WindowAppId) => void;
  restartIntro: () => void;
}

function createPanosWindow(id: WindowAppId, zIndex: number): PanosWindow {
  return {
    id,
    title: WINDOW_TITLES[id],
    isOpen: true,
    isMaximized: false,
    isMinimized: false,
    zIndex,
  };
}

export const useWindowStore = create<WindowStore>((set) => ({
  windows: {
    welcome: createPanosWindow("welcome", 10),
  },
  activeWindowId: "welcome",
  nextZIndex: 11,
  openWindow: (id) =>
    set((state) => {
      const nextZIndex = state.nextZIndex + 1;
      return {
        windows: {
          ...state.windows,
          [id]: {
            ...(state.windows[id] ?? createPanosWindow(id, nextZIndex)),
            isOpen: true,
            isMinimized: false,
            zIndex: nextZIndex,
          },
        },
        activeWindowId: id,
        nextZIndex,
      };
    }),
  closeWindow: (id) =>
    set((state) => ({
      windows: {
        ...state.windows,
        [id]: state.windows[id] ? { ...state.windows[id], isOpen: false } : undefined,
      },
      activeWindowId: state.activeWindowId === id ? null : state.activeWindowId,
    })),
  minimizeWindow: (id) =>
    set((state) => ({
      windows: {
        ...state.windows,
        [id]: state.windows[id] ? { ...state.windows[id], isMinimized: true } : undefined,
      },
      activeWindowId: state.activeWindowId === id ? null : state.activeWindowId,
    })),
  toggleMaximize: (id) =>
    set((state) => ({
      windows: {
        ...state.windows,
        [id]: state.windows[id]
          ? { ...state.windows[id], isMaximized: !state.windows[id].isMaximized }
          : undefined,
      },
    })),
  focusWindow: (id) =>
    set((state) => {
      const current = state.windows[id];
      if (!current) {
        return state;
      }

      const nextZIndex = state.nextZIndex + 1;
      return {
        windows: {
          ...state.windows,
          [id]: {
            ...current,
            isMinimized: false,
            zIndex: nextZIndex,
          },
        },
        activeWindowId: id,
        nextZIndex,
      };
    }),
  restartIntro: () =>
    set((state) => {
      const nextZIndex = state.nextZIndex + 1;
      return {
        windows: {
          ...state.windows,
          welcome: createPanosWindow("welcome", nextZIndex),
        },
        activeWindowId: "welcome",
        nextZIndex,
      };
    }),
}));

