/**
 * ui/Desktop/Desktop.tsx
 *
 * The main desktop surface. Responsibilities:
 *  - Sets the wallpaper (from session config)
 *  - Renders all open windows
 *  - Shows desktop icons (one per registered app)
 *  - Handles right-click context menu
 *  - Owns the Start Menu toggle state
 */

import { useState, useCallback } from 'react';
import { useWindowManagerStore } from '@/system/windowManager';
import { useAppRegistryStore, type AppManifest } from '@/system/appRegistry';
import { useSessionStore } from '@/system/session';
import { Window } from '@/ui/Window';
import { Taskbar } from '@/ui/Taskbar';
import { StartMenu } from '@/ui/StartMenu';
import { ContextMenu, type ContextMenuItem } from '@/ui/ContextMenu';
import type { OsWindow } from '@/system/windowManager';
import styles from './Desktop.module.css';

interface ContextMenuState {
  x: number;
  y: number;
  items: ContextMenuItem[];
}

export function Desktop() {
  const windows = useWindowManagerStore((s) => s.windows);
  const openWindow = useWindowManagerStore((s) => s.openWindow);
  const apps = useAppRegistryStore((s) => s.apps);
  const wallpaper = useSessionStore((s) => s.config.wallpaper);
  const taskbarPosition = useSessionStore((s) => s.config.taskbarPosition);

  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const items: ContextMenuItem[] = [
        {
          label: 'New Terminal',
          icon: '⌨',
          onClick: () => openWindow({ appId: 'com.browseros.terminal', title: 'Terminal' }),
        },
        {
          label: 'Open Files',
          icon: '📁',
          dividerAfter: true,
          onClick: () => openWindow({ appId: 'com.browseros.fileexplorer', title: 'Files' }),
        },
        {
          label: 'Settings',
          icon: '⚙',
          onClick: () => openWindow({ appId: 'com.browseros.settings', title: 'Settings' }),
        },
      ];
      setContextMenu({ x: e.clientX, y: e.clientY, items });
    },
    [openWindow],
  );

  const launchApp = useCallback(
    (app: AppManifest) => {
      openWindow({
        appId: app.id,
        title: app.name,
        icon: app.icon,
        initialRect: app.defaultRect,
      });
    },
    [openWindow],
  );

  return (
    <div
      className={styles.desktop}
      style={{ background: wallpaper }}
      onContextMenu={handleContextMenu}
      data-taskbar={taskbarPosition}
    >
      {/* Desktop icons */}
      <div className={styles.iconsArea}>
        {apps.map((app) => (
          <button
            key={app.id}
            className={styles.desktopIcon}
            onDoubleClick={() => launchApp(app)}
            title={app.description}
          >
            <img src={app.icon} alt={app.name} />
            {app.name}
          </button>
        ))}
      </div>

      {/* Open windows – rendered in z-order */}
      {windows.map((win: OsWindow) => (
        <WindowWithApp key={win.id} win={win} />
      ))}

      {/* Start menu */}
      {startMenuOpen && <StartMenu onClose={() => setStartMenuOpen(false)} />}

      {/* Context menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenu.items}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Taskbar – rendered last so it's always on top via z-index */}
      <Taskbar
        onStartClick={() => setStartMenuOpen((o) => !o)}
        startMenuOpen={startMenuOpen}
      />
    </div>
  );
}

// ─── WindowWithApp ─────────────────────────────────────────────────────────

/**
 * Looks up the AppManifest for the window's appId and renders the app
 * component inside the Window chrome. Renders a fallback if the app
 * isn't found (e.g., a plugin was unregistered while a window was open).
 */
function WindowWithApp({ win }: { win: OsWindow }) {
  const getApp = useAppRegistryStore((s) => s.getApp);
  const app = getApp(win.appId);
  const AppComponent = app?.component;

  return (
    <Window window={win}>
      {AppComponent ? (
        <AppComponent windowId={win.id} />
      ) : (
        <div style={{ padding: 16, color: 'var(--color-text-muted)' }}>
          App &ldquo;{win.appId}&rdquo; not found.
        </div>
      )}
    </Window>
  );
}
