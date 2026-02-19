/**
 * hooks/useTheme.ts
 *
 * Reads the current theme from the session store and syncs it to the
 * document root as a data-theme attribute so CSS custom properties pick it up.
 *
 * Call once at the App root level.
 */

import { useEffect } from 'react';
import { useSessionStore } from '@/system/session';

export function useTheme() {
  const theme = useSessionStore((s) => s.config.theme);
  const setTheme = useSessionStore((s) => s.setTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return { theme, setTheme };
}
