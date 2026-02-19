/**
 * ui/StartMenu/StartMenu.tsx
 *
 * Application launcher. Shows all registered apps in a grid, with a
 * search filter. Clicking an app opens a new window for it.
 */

import { useState, useCallback } from 'react';
import { useAppRegistryStore } from '@/system/appRegistry';
import { useWindowManagerStore } from '@/system/windowManager';
import type { AppManifest } from '@/system/appRegistry';
import styles from './StartMenu.module.css';

interface StartMenuProps {
  onClose: () => void;
}

export function StartMenu({ onClose }: StartMenuProps) {
  const apps = useAppRegistryStore((s) => s.apps);
  const openWindow = useWindowManagerStore((s) => s.openWindow);
  const [query, setQuery] = useState('');

  const filtered = apps.filter((a) =>
    a.name.toLowerCase().includes(query.toLowerCase()),
  );

  const launch = useCallback(
    (app: AppManifest) => {
      openWindow({
        appId: app.id,
        title: app.name,
        icon: app.icon,
        initialRect: app.defaultRect,
      });
      onClose();
    },
    [openWindow, onClose],
  );

  return (
    <>
      {/* Click-outside overlay */}
      <div className={styles.overlay} onClick={onClose} aria-hidden />

      <div className={styles.menu} role="dialog" aria-label="Start menu">
        <input
          className={styles.search}
          type="search"
          placeholder="Search apps…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />

        <div className={styles.sectionLabel}>Apps</div>

        {filtered.length === 0 ? (
          <p className={styles.noResults}>No apps found</p>
        ) : (
          <div className={styles.appGrid}>
            {filtered.map((app) => (
              <button
                key={app.id}
                className={styles.appBtn}
                onClick={() => launch(app)}
                title={app.description}
              >
                <img className={styles.appIcon} src={app.icon} alt={app.name} />
                {app.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
