/**
 * ui/Taskbar/Taskbar.tsx
 *
 * The always-visible OS taskbar. Shows:
 *   - Start button (toggles the Start Menu)
 *   - A button per open window (click to focus/restore, click focused to minimise)
 *   - Clock
 */

import { useCallback, useEffect, useState } from 'react';
import { useWindowManagerStore } from '@/system/windowManager';
import { useSessionStore } from '@/system/session';
import type { OsWindow } from '@/system/windowManager';
import styles from './Taskbar.module.css';

interface TaskbarProps {
  onStartClick: () => void;
  startMenuOpen: boolean;
}

export function Taskbar({ onStartClick, startMenuOpen }: TaskbarProps) {
  const windows = useWindowManagerStore((s) => s.windows);
  const focusWindow = useWindowManagerStore((s) => s.focusWindow);
  const minimizeWindow = useWindowManagerStore((s) => s.minimizeWindow);
  const restoreWindow = useWindowManagerStore((s) => s.restoreWindow);
  const taskbarPosition = useSessionStore((s) => s.config.taskbarPosition);

  const [time, setTime] = useState(() => formatTime(new Date()));

  useEffect(() => {
    const id = setInterval(() => setTime(formatTime(new Date())), 10_000);
    return () => clearInterval(id);
  }, []);

  const handleWindowBtn = useCallback(
    (win: OsWindow) => {
      if (win.state === 'minimized') {
        restoreWindow(win.id);
        focusWindow(win.id);
      } else if (win.focused) {
        minimizeWindow(win.id);
      } else {
        focusWindow(win.id);
      }
    },
    [focusWindow, minimizeWindow, restoreWindow],
  );

  return (
    <div className={styles.taskbar} data-position={taskbarPosition}>
      {/* Start button */}
      <button
        className={`${styles.startButton} ${startMenuOpen ? styles.active : ''}`}
        onClick={onStartClick}
        aria-label="Open start menu"
        title="Start"
      >
        ⬡
      </button>

      <div className={styles.separator} />

      {/* Open windows */}
      <div className={styles.windowList}>
        {windows.map((win) => (
          <button
            key={win.id}
            className={[
              styles.windowBtn,
              win.focused ? styles.focused : '',
              win.state === 'minimized' ? styles.minimized : '',
            ].join(' ')}
            onClick={() => handleWindowBtn(win)}
            title={win.title}
          >
            {win.icon && (
              <img className={styles.icon} src={win.icon} alt="" aria-hidden />
            )}
            {win.title}
          </button>
        ))}
      </div>

      {/* Clock */}
      <div className={styles.clock} aria-live="off">{time}</div>
    </div>
  );
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
