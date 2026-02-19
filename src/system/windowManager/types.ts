/**
 * system/windowManager/types.ts
 *
 * Types for the Window Manager subsystem.
 */

import type { OsId, Rect } from '@/core/types';

export type WindowState = 'normal' | 'minimized' | 'maximized';

export interface OsWindow {
  /** Unique window identifier. */
  id: OsId;
  /** ID of the app that owns this window. */
  appId: string;
  /** Title shown in the window chrome. */
  title: string;
  /** Current position and size on the desktop. */
  rect: Rect;
  /** Stacking order – higher = on top. */
  zIndex: number;
  /** Lifecycle state of the window. */
  state: WindowState;
  /** Whether this window is currently keyboard-focused. */
  focused: boolean;
  /** Icon URL/data-URL for the taskbar button. */
  icon?: string;
}

export interface WindowManagerStore {
  windows: OsWindow[];
  /** Open a new window and return its id. */
  openWindow: (opts: OpenWindowOptions) => OsId;
  /** Permanently close and remove a window. */
  closeWindow: (id: OsId) => void;
  /** Bring a window to the top and focus it. */
  focusWindow: (id: OsId) => void;
  /** Minimise to taskbar. */
  minimizeWindow: (id: OsId) => void;
  /** Toggle maximise. */
  maximizeWindow: (id: OsId) => void;
  /** Restore from minimised/maximised to normal. */
  restoreWindow: (id: OsId) => void;
  /** Move window (drag). */
  moveWindow: (id: OsId, x: number, y: number) => void;
  /** Resize window. */
  resizeWindow: (id: OsId, rect: Partial<Rect>) => void;
}

export interface OpenWindowOptions {
  appId: string;
  title: string;
  icon?: string;
  initialRect?: Partial<Rect>;
}
