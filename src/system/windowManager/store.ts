/**
 * system/windowManager/store.ts
 *
 * Zustand store that is the single source of truth for all open windows.
 * Components read from this store and dispatch actions to it; the Window
 * Manager never touches the DOM directly.
 */

import { create } from 'zustand';
import { eventBus } from '@/core/eventBus';
import type { OsId, Rect } from '@/core/types';
import type { OsWindow, WindowManagerStore, OpenWindowOptions } from './types';

/** Default window dimensions when no initialRect is provided. */
const DEFAULT_WIDTH = 640;
const DEFAULT_HEIGHT = 480;
const CASCADE_OFFSET = 30; // px offset per new window for cascade effect

let idCounter = 0;
const genId = () => `win-${++idCounter}`;

/** Compute a cascaded initial position so windows don't all stack at 0,0. */
function cascadePosition(count: number): { x: number; y: number } {
  const base = 80;
  return {
    x: base + (count % 10) * CASCADE_OFFSET,
    y: base + (count % 10) * CASCADE_OFFSET,
  };
}

export const useWindowManagerStore = create<WindowManagerStore>((set, get) => ({
  windows: [],

  openWindow(opts: OpenWindowOptions): OsId {
    const { windows } = get();
    const maxZ = windows.reduce((m, w) => Math.max(m, w.zIndex), 0);
    const pos = cascadePosition(windows.length);

    const newWindow: OsWindow = {
      id: genId(),
      appId: opts.appId,
      title: opts.title,
      icon: opts.icon,
      rect: {
        x: opts.initialRect?.x ?? pos.x,
        y: opts.initialRect?.y ?? pos.y,
        width: opts.initialRect?.width ?? DEFAULT_WIDTH,
        height: opts.initialRect?.height ?? DEFAULT_HEIGHT,
      },
      zIndex: maxZ + 1,
      state: 'normal',
      focused: true,
    };

    // Unfocus all other windows first
    set((s) => ({
      windows: [
        ...s.windows.map((w) => ({ ...w, focused: false })),
        newWindow,
      ],
    }));

    eventBus.emit('window:opened', { id: newWindow.id, appId: opts.appId });
    return newWindow.id;
  },

  closeWindow(id: OsId) {
    set((s) => ({ windows: s.windows.filter((w) => w.id !== id) }));
    eventBus.emit('window:closed', { id });
  },

  focusWindow(id: OsId) {
    const { windows } = get();
    const maxZ = windows.reduce((m, w) => Math.max(m, w.zIndex), 0);
    set((s) => ({
      windows: s.windows.map((w) =>
        w.id === id
          ? { ...w, focused: true, zIndex: maxZ + 1, state: w.state === 'minimized' ? 'normal' : w.state }
          : { ...w, focused: false },
      ),
    }));
    eventBus.emit('window:focused', { id });
  },

  minimizeWindow(id: OsId) {
    set((s) => ({
      windows: s.windows.map((w) =>
        w.id === id ? { ...w, state: 'minimized', focused: false } : w,
      ),
    }));
    eventBus.emit('window:minimized', { id });
  },

  maximizeWindow(id: OsId) {
    const win = get().windows.find((w) => w.id === id);
    if (!win) return;
    const next = win.state === 'maximized' ? 'normal' : 'maximized';
    set((s) => ({
      windows: s.windows.map((w) =>
        w.id === id ? { ...w, state: next } : w,
      ),
    }));
    eventBus.emit(next === 'maximized' ? 'window:maximized' : 'window:restored', { id });
  },

  restoreWindow(id: OsId) {
    set((s) => ({
      windows: s.windows.map((w) =>
        w.id === id ? { ...w, state: 'normal' } : w,
      ),
    }));
    eventBus.emit('window:restored', { id });
  },

  moveWindow(id: OsId, x: number, y: number) {
    set((s) => ({
      windows: s.windows.map((w) =>
        w.id === id ? { ...w, rect: { ...w.rect, x, y } } : w,
      ),
    }));
  },

  resizeWindow(id: OsId, rect: Partial<Rect>) {
    set((s) => ({
      windows: s.windows.map((w) =>
        w.id === id ? { ...w, rect: { ...w.rect, ...rect } } : w,
      ),
    }));
  },
}));
