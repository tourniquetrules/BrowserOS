/**
 * core/types.ts
 *
 * Shared OS-level primitive types used across subsystems.
 * Keep this lean – only add types that multiple subsystems depend on.
 */

/** Unique identifier type alias for clarity. */
export type OsId = string;

/** 2-D point on the desktop canvas (in CSS pixels). */
export interface Point {
  x: number;
  y: number;
}

/** Axis-aligned rectangle. */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** OS-level event names emitted on the global event bus. */
export type OsEventName =
  | 'window:opened'
  | 'window:closed'
  | 'window:focused'
  | 'window:minimized'
  | 'window:maximized'
  | 'window:restored'
  | 'app:launched'
  | 'app:registered'
  | 'session:loaded'
  | 'session:saved'
  | 'theme:changed'
  | 'fs:changed';
