/**
 * ui/Window/Window.tsx
 *
 * The OS window chrome: renders the titlebar, control buttons, and app body.
 * Handles drag-to-move and edge/corner resize interactions.
 * App content is rendered as children inside the body.
 */

import React, { useCallback } from 'react';
import { useWindowManagerStore } from '@/system/windowManager';
import { useDrag } from '@/hooks/useDrag';
import { useResize, type ResizeEdge } from '@/hooks/useResize';
import type { OsWindow } from '@/system/windowManager';
import styles from './Window.module.css';

interface WindowProps {
  window: OsWindow;
  children: React.ReactNode;
}

const RESIZE_EDGES: ResizeEdge[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];

export function Window({ window: win, children }: WindowProps) {
  const { focusWindow, closeWindow, minimizeWindow, maximizeWindow, moveWindow, resizeWindow } =
    useWindowManagerStore();

  // Drag-to-move via titlebar
  const { onPointerDown: dragDown, onPointerMove: dragMove, onPointerUp: dragUp } = useDrag({
    onStart: () => focusWindow(win.id),
    onMove: (dx, dy) => {
      if (win.state === 'maximized') return; // can't move maximized window
      moveWindow(win.id, win.rect.x + dx, win.rect.y + dy);
    },
  });

  const handleFocus = useCallback(() => focusWindow(win.id), [focusWindow, win.id]);

  const isMaximized = win.state === 'maximized';

  // Maximized windows fill the desktop (minus taskbar)
  const inlineStyle: React.CSSProperties = isMaximized
    ? { left: 0, top: 0, right: 0, bottom: 44, width: 'auto', height: 'auto', zIndex: win.zIndex }
    : {
        left: win.rect.x,
        top: win.rect.y,
        width: win.rect.width,
        height: win.rect.height,
        zIndex: win.zIndex,
      };

  return (
    <div
      className={[
        styles.window,
        win.focused ? styles.focused : '',
        win.state === 'minimized' ? styles.minimized : '',
        isMaximized ? styles.maximized : '',
      ].join(' ')}
      style={inlineStyle}
      onPointerDown={handleFocus}
      data-window-id={win.id}
      role="dialog"
      aria-label={win.title}
    >
      {/* Titlebar */}
      <div
        className={styles.titlebar}
        onPointerDown={dragDown}
        onPointerMove={dragMove}
        onPointerUp={dragUp}
      >
        {win.icon && <img className={styles.icon} src={win.icon} alt="" aria-hidden />}
        <span className={styles.title}>{win.title}</span>
        <div className={styles.controls}>
          <button
            className={`${styles.ctrl} ${styles.close}`}
            onClick={(e) => { e.stopPropagation(); closeWindow(win.id); }}
            aria-label="Close window"
            title="Close"
          />
          <button
            className={`${styles.ctrl} ${styles.minimize}`}
            onClick={(e) => { e.stopPropagation(); minimizeWindow(win.id); }}
            aria-label="Minimise window"
            title="Minimise"
          />
          <button
            className={`${styles.ctrl} ${styles.maximize}`}
            onClick={(e) => { e.stopPropagation(); maximizeWindow(win.id); }}
            aria-label={isMaximized ? 'Restore window' : 'Maximise window'}
            title={isMaximized ? 'Restore' : 'Maximise'}
          />
        </div>
      </div>

      {/* App content */}
      <div className={`${styles.body} os-window-body`}>
        {children}
      </div>

      {/* Resize handles – only shown in normal state */}
      {win.state === 'normal' &&
        RESIZE_EDGES.map((edge) => (
          <ResizeHandle key={edge} edge={edge} win={win} onResize={resizeWindow} />
        ))}
    </div>
  );
}

// ─── ResizeHandle sub-component ──────────────────────────────────────────────

interface ResizeHandleProps {
  edge: ResizeEdge;
  win: OsWindow;
  onResize: (id: string, rect: Partial<import('@/core/types').Rect>) => void;
}

function ResizeHandle({ edge, win, onResize }: ResizeHandleProps) {
  const handleResize = useCallback(
    (rect: Partial<import('@/core/types').Rect>) => onResize(win.id, rect),
    [onResize, win.id],
  );

  const { onPointerDown, onPointerMove, onPointerUp } = useResize({
    edge,
    currentRect: win.rect,
    onResize: handleResize,
  });

  return (
    <div
      className={styles.resizeHandle}
      data-edge={edge}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    />
  );
}
