/**
 * system/appRegistry/types.ts
 *
 * An AppManifest describes everything the OS needs to know about an
 * application: how to render it, what icon to show, default window size, etc.
 */

import type { ComponentType } from 'react';
import type { Rect } from '@/core/types';

export interface AppManifest {
  /** Unique stable identifier, e.g. "com.browseros.terminal". */
  id: string;
  /** Display name shown in launchers and window titles. */
  name: string;
  /** Path to an SVG or data-URL icon. */
  icon: string;
  /** Short human-readable description. */
  description: string;
  /** Default window geometry. */
  defaultRect?: Partial<Rect>;
  /**
   * The React component that renders the app's content inside a window frame.
   * For dynamic/plugin apps this may be loaded lazily via import().
   */
  component: ComponentType<AppComponentProps>;
}

/** Props injected into every app component by the window frame. */
export interface AppComponentProps {
  /** The owning window's id – apps can use this to request their own close. */
  windowId: string;
}

export interface AppRegistryStore {
  apps: AppManifest[];
  register: (manifest: AppManifest) => void;
  unregister: (id: string) => void;
  getApp: (id: string) => AppManifest | undefined;
}
