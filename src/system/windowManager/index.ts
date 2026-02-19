/**
 * system/windowManager/index.ts
 *
 * Public API for the Window Manager subsystem.
 * Consumers import from here; internal implementation details stay private.
 */

export { useWindowManagerStore } from './store';
export type { OsWindow, OpenWindowOptions, WindowState, WindowManagerStore } from './types';
