/**
 * apps/Settings/index.tsx
 *
 * System Settings app. Allows the user to change:
 *   - Theme (dark / light)
 *   - Wallpaper
 *   - Username
 *   - Taskbar position
 */

import { useSessionStore } from '@/system/session';
import type { AppComponentProps } from '@/system/appRegistry';
import styles from './Settings.module.css';

const WALLPAPERS = [
  { label: 'Dark Navy', value: 'linear-gradient(135deg, #1e1e2e 0%, #313244 100%)' },
  { label: 'Midnight Blue', value: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 100%)' },
  { label: 'Forest', value: 'linear-gradient(135deg, #0d1b0d 0%, #1a3a1a 100%)' },
  { label: 'Sunset', value: 'linear-gradient(135deg, #3b0764 0%, #be185d 50%, #f97316 100%)' },
  { label: 'Ocean', value: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 50%, #38bdf8 100%)' },
  { label: 'Rose', value: 'linear-gradient(135deg, #4c0519 0%, #9f1239 50%, #fb7185 100%)' },
  { label: 'Solid Dark', value: '#11111b' },
  { label: 'Solid Light', value: '#eff1f5' },
];

export function Settings(_props: AppComponentProps) {
  const config = useSessionStore((s) => s.config);
  const setTheme = useSessionStore((s) => s.setTheme);
  const setWallpaper = useSessionStore((s) => s.setWallpaper);
  const setUsername = useSessionStore((s) => s.setUsername);
  const setTaskbarPosition = useSessionStore((s) => s.setTaskbarPosition);

  return (
    <div className={styles.settings}>
      {/* Appearance */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Appearance</h2>

        <div className={styles.row}>
          <div>
            <div className={styles.label}>Theme</div>
            <div className={styles.sublabel}>Switches between dark and light mode</div>
          </div>
          <select
            className={styles.select}
            value={config.theme}
            onChange={(e) => setTheme(e.target.value as 'dark' | 'light')}
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </div>

        <div>
          <div className={styles.label} style={{ marginBottom: 8 }}>Wallpaper</div>
          <div className={styles.wallpaperRow}>
            {WALLPAPERS.map((w) => (
              <button
                key={w.value}
                className={`${styles.swatch} ${config.wallpaper === w.value ? styles.active : ''}`}
                style={{ background: w.value }}
                onClick={() => setWallpaper(w.value)}
                title={w.label}
                aria-label={w.label}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Desktop */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Desktop</h2>

        <div className={styles.row}>
          <div>
            <div className={styles.label}>Taskbar position</div>
          </div>
          <select
            className={styles.select}
            value={config.taskbarPosition}
            onChange={(e) => setTaskbarPosition(e.target.value as 'bottom' | 'top')}
          >
            <option value="bottom">Bottom</option>
            <option value="top">Top</option>
          </select>
        </div>
      </section>

      {/* User */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>User</h2>

        <div className={styles.row}>
          <div className={styles.label}>Username</div>
          <input
            className={styles.input}
            value={config.username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
            maxLength={32}
          />
        </div>
      </section>

      {/* About */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>About BrowserOS</h2>
        <p className={styles.about}>
          BrowserOS v0.1.0 — an experimental browser-native desktop environment.<br />
          Built with React, TypeScript, Vite, and Zustand.<br />
          Storage: IndexedDB (filesystem) + localStorage (session).<br />
          <br />
          All data lives in your browser — nothing leaves your device.
        </p>
      </section>
    </div>
  );
}
