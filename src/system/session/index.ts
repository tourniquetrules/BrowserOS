/**
 * system/session/index.ts
 *
 * User session and configuration persistence.
 * Uses localStorage for lightweight key-value settings (fast, synchronous)
 * and integrates with the Zustand session store.
 */

import { useSessionStore } from './store';

export { useSessionStore } from './store';
export type { SessionConfig, Theme } from './store';

const STORAGE_KEY = 'browser-os-session';

export const sessionService = {
  /**
   * Hydrate the Zustand store from localStorage.
   * Called by the kernel at boot before the UI renders.
   */
  async load(): Promise<void> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const config = JSON.parse(raw);
        useSessionStore.getState().hydrate(config);
      }
    } catch {
      // Corrupted storage – start fresh
      localStorage.removeItem(STORAGE_KEY);
    }
  },

  /**
   * Persist the current session config to localStorage.
   * Called automatically by the store on every change.
   */
  save(): void {
    const config = useSessionStore.getState().config;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  },
};
