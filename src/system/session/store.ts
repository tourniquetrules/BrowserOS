/**
 * system/session/store.ts
 *
 * Zustand store for user-configurable session settings.
 * Every setter auto-saves to localStorage via sessionService.save().
 */

import { create } from 'zustand';
import { sessionService } from './index';

export type Theme = 'dark' | 'light';

export interface SessionConfig {
  theme: Theme;
  wallpaper: string; // CSS color or gradient string
  username: string;
  taskbarPosition: 'bottom' | 'top';
}

const DEFAULT_CONFIG: SessionConfig = {
  theme: 'dark',
  wallpaper: 'linear-gradient(135deg, #1e1e2e 0%, #313244 100%)',
  username: 'user',
  taskbarPosition: 'bottom',
};

interface SessionStore {
  config: SessionConfig;
  hydrate: (partial: Partial<SessionConfig>) => void;
  setTheme: (theme: Theme) => void;
  setWallpaper: (wallpaper: string) => void;
  setUsername: (username: string) => void;
  setTaskbarPosition: (pos: 'bottom' | 'top') => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  config: { ...DEFAULT_CONFIG },

  hydrate(partial) {
    set((s) => ({ config: { ...s.config, ...partial } }));
  },

  setTheme(theme) {
    set((s) => ({ config: { ...s.config, theme } }));
    // Persist after state update (deferred to next tick)
    setTimeout(() => sessionService.save(), 0);
  },

  setWallpaper(wallpaper) {
    set((s) => ({ config: { ...s.config, wallpaper } }));
    setTimeout(() => sessionService.save(), 0);
  },

  setUsername(username) {
    set((s) => ({ config: { ...s.config, username } }));
    setTimeout(() => sessionService.save(), 0);
  },

  setTaskbarPosition(pos) {
    set((s) => ({ config: { ...s.config, taskbarPosition: pos } }));
    setTimeout(() => sessionService.save(), 0);
  },
}));
