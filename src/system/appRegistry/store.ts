/**
 * system/appRegistry/store.ts
 *
 * A simple Zustand store that maps app IDs → AppManifest objects.
 * The kernel seeds it with built-in apps at boot; runtime plugin loading
 * can call register() with dynamically imported manifests.
 */

import { create } from 'zustand';
import type { AppManifest, AppRegistryStore } from './types';

export const useAppRegistryStore = create<AppRegistryStore>((set, get) => ({
  apps: [],

  register(manifest: AppManifest) {
    // Prevent duplicate registration
    if (get().apps.find((a) => a.id === manifest.id)) return;
    set((s) => ({ apps: [...s.apps, manifest] }));
  },

  unregister(id: string) {
    set((s) => ({ apps: s.apps.filter((a) => a.id !== id) }));
  },

  getApp(id: string) {
    return get().apps.find((a) => a.id === id);
  },
}));

/**
 * Non-reactive singleton accessor for use outside React components
 * (e.g. in kernel.ts during boot).
 */
export const appRegistry = {
  register: (m: AppManifest) => useAppRegistryStore.getState().register(m),
  unregister: (id: string) => useAppRegistryStore.getState().unregister(id),
  getApp: (id: string) => useAppRegistryStore.getState().getApp(id),
};
