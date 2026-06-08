import { create } from "zustand";

import type { WindowAppId } from "./config/apps";
import { WINDOW_TITLES } from "./config/apps";

export interface PanosWindow {
  id: WindowAppId;
  title: string;
  isOpen: boolean;
  isMaximized: boolean;
  isMinimized: boolean;
  zIndex: number;
  // 窗口左上角坐标，相对 .window-layer（安全区）。拖拽与居中都基于它。
  x: number;
  y: number;
}

interface WindowStore {
  windows: Partial<Record<WindowAppId, PanosWindow>>;
  activeWindowId: WindowAppId | null;
  nextZIndex: number;
  openWindow: (id: WindowAppId) => void;
  closeWindow: (id: WindowAppId) => void;
  minimizeWindow: (id: WindowAppId) => void;
  toggleMaximize: (id: WindowAppId) => void;
  focusWindow: (id: WindowAppId) => void;
  moveWindow: (id: WindowAppId, x: number, y: number) => void;
  restartIntro: () => void;
}

// 与 CSS `.frame { width: min(880px, calc(100vw - 48px)) }` 对齐，保证居中计算一致。
const DEFAULT_WIDTH = 880;
const VIEWPORT_MARGIN = 48;
const CASCADE_STEP = 28;

function viewport(): { width: number; height: number } {
  if (typeof window === "undefined") {
    return { width: 1280, height: 800 };
  }
  return { width: window.innerWidth, height: window.innerHeight };
}

// 居中的初始位置；按已开窗口数做轻微层叠偏移，避免多窗口完全重叠。
function centeredPosition(offsetIndex: number): { x: number; y: number } {
  const { width } = viewport();
  const frameWidth = Math.min(DEFAULT_WIDTH, width - VIEWPORT_MARGIN);
  const offset = (offsetIndex % 6) * CASCADE_STEP;
  return {
    x: Math.max(24, (width - frameWidth) / 2) + offset,
    y: 24 + offset,
  };
}

// 拖拽边界：至少保留约 200px 可见，标题栏不被菜单栏 / Dock 吞掉。
function clampPosition(x: number, y: number): { x: number; y: number } {
  const { width, height } = viewport();
  const minVisible = 200;
  const safeAreaHeight = height - 36 - 94;
  return {
    x: Math.min(Math.max(x, -(DEFAULT_WIDTH - minVisible)), width - minVisible),
    y: Math.min(Math.max(y, 0), Math.max(0, safeAreaHeight - 44)),
  };
}

function openWindowCount(windows: Partial<Record<WindowAppId, PanosWindow>>): number {
  return Object.values(windows).filter((win) => win?.isOpen && !win.isMinimized).length;
}

function createPanosWindow(
  id: WindowAppId,
  zIndex: number,
  position: { x: number; y: number },
): PanosWindow {
  return {
    id,
    title: WINDOW_TITLES[id],
    isOpen: true,
    isMaximized: false,
    isMinimized: false,
    zIndex,
    ...position,
  };
}

export const useWindowStore = create<WindowStore>((set) => ({
  windows: {
    welcome: createPanosWindow("welcome", 10, centeredPosition(0)),
  },
  activeWindowId: "welcome",
  nextZIndex: 11,
  openWindow: (id) =>
    set((state) => {
      const nextZIndex = state.nextZIndex + 1;
      const existing = state.windows[id];
      // 已存在的窗口保留它当前位置；新窗口居中 + 层叠。
      const base =
        existing ?? createPanosWindow(id, nextZIndex, centeredPosition(openWindowCount(state.windows)));
      return {
        windows: {
          ...state.windows,
          [id]: {
            ...base,
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
  moveWindow: (id, x, y) =>
    set((state) => {
      const current = state.windows[id];
      if (!current) {
        return state;
      }
      return {
        windows: {
          ...state.windows,
          [id]: { ...current, ...clampPosition(x, y) },
        },
      };
    }),
  restartIntro: () =>
    set((state) => {
      const nextZIndex = state.nextZIndex + 1;
      return {
        windows: {
          ...state.windows,
          welcome: createPanosWindow("welcome", nextZIndex, centeredPosition(0)),
        },
        activeWindowId: "welcome",
        nextZIndex,
      };
    }),
}));
