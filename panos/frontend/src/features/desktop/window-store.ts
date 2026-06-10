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
// 与 DesktopShell.module.css `.windowLayer { inset: 36px 0 94px }` 对齐（菜单栏 / Dock 区域）。
const MENU_BAR_HEIGHT = 36;
const DOCK_AREA_HEIGHT = 94;
const TITLEBAR_HEIGHT = 44;

function viewport(): { width: number; height: number } {
  if (typeof window === "undefined") {
    return { width: 1280, height: 800 };
  }
  return { width: window.innerWidth, height: window.innerHeight };
}

// 当前视口下窗口的实际渲染宽度（与 CSS min() 一致），避免窄屏时 clamp 范围失真。
function frameWidth(viewportWidth: number): number {
  return Math.min(DEFAULT_WIDTH, viewportWidth - VIEWPORT_MARGIN);
}

// 居中的初始位置；按已开窗口数做轻微层叠偏移，避免多窗口完全重叠。
function centeredPosition(offsetIndex: number): { x: number; y: number } {
  const { width } = viewport();
  const offset = (offsetIndex % 6) * CASCADE_STEP;
  return {
    x: Math.max(24, (width - frameWidth(width)) / 2) + offset,
    y: 24 + offset,
  };
}

// 拖拽边界：至少保留约 200px 可见，标题栏不被菜单栏 / Dock 吞掉。
// 导出给 WindowFrame 在拖拽过程中实时使用，保证视觉位置与最终落点一致。
export function clampWindowPosition(x: number, y: number): { x: number; y: number } {
  const { width, height } = viewport();
  const minVisible = 200;
  const safeAreaHeight = height - MENU_BAR_HEIGHT - DOCK_AREA_HEIGHT;
  return {
    x: Math.min(Math.max(x, -(frameWidth(width) - minVisible)), width - minVisible),
    y: Math.min(Math.max(y, 0), Math.max(0, safeAreaHeight - TITLEBAR_HEIGHT)),
  };
}

// 关闭 / 最小化当前窗口后，焦点交给剩余可见窗口中层级最高的那个。
function topVisibleWindowId(
  windows: Partial<Record<WindowAppId, PanosWindow>>,
  excludeId: WindowAppId,
): WindowAppId | null {
  let top: PanosWindow | null = null;
  for (const win of Object.values(windows)) {
    if (!win?.isOpen || win.isMinimized || win.id === excludeId) {
      continue;
    }
    if (!top || win.zIndex > top.zIndex) {
      top = win;
    }
  }
  return top?.id ?? null;
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
  // 初始为空桌面；首访自动弹 Welcome、URL 深链恢复都由 DesktopShell 决定。
  windows: {},
  activeWindowId: null,
  nextZIndex: 10,
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
    set((state) => {
      const current = state.windows[id];
      if (!current) {
        return state;
      }
      return {
        windows: { ...state.windows, [id]: { ...current, isOpen: false } },
        activeWindowId:
          state.activeWindowId === id ? topVisibleWindowId(state.windows, id) : state.activeWindowId,
      };
    }),
  minimizeWindow: (id) =>
    set((state) => {
      const current = state.windows[id];
      if (!current) {
        return state;
      }
      return {
        windows: { ...state.windows, [id]: { ...current, isMinimized: true } },
        activeWindowId:
          state.activeWindowId === id ? topVisibleWindowId(state.windows, id) : state.activeWindowId,
      };
    }),
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
          [id]: { ...current, ...clampWindowPosition(x, y) },
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
