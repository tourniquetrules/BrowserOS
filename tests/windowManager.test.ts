/**
 * tests/windowManager.test.ts
 *
 * Unit tests for the Window Manager store.
 * Tests the core lifecycle: open, focus, minimize, maximize, restore, close.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useWindowManagerStore } from '@/system/windowManager';

// Reset store between tests
beforeEach(() => {
  useWindowManagerStore.setState({ windows: [] });
});

describe('Window Manager', () => {
  it('opens a window and returns its id', () => {
    const { openWindow, windows } = useWindowManagerStore.getState();
    const id = openWindow({ appId: 'test.app', title: 'Test App' });
    expect(id).toMatch(/^win-/);
    expect(useWindowManagerStore.getState().windows).toHaveLength(1);
    expect(windows).toHaveLength(0); // snapshot before open
  });

  it('new window is focused and others are unfocused', () => {
    const store = useWindowManagerStore.getState();
    store.openWindow({ appId: 'app1', title: 'App 1' });
    store.openWindow({ appId: 'app2', title: 'App 2' });
    const { windows } = useWindowManagerStore.getState();
    expect(windows.filter((w) => w.focused)).toHaveLength(1);
    expect(windows[windows.length - 1].focused).toBe(true);
  });

  it('closes a window by id', () => {
    const store = useWindowManagerStore.getState();
    const id = store.openWindow({ appId: 'test.app', title: 'Test' });
    store.closeWindow(id);
    expect(useWindowManagerStore.getState().windows).toHaveLength(0);
  });

  it('minimizes a window', () => {
    const store = useWindowManagerStore.getState();
    const id = store.openWindow({ appId: 'test.app', title: 'Test' });
    store.minimizeWindow(id);
    const win = useWindowManagerStore.getState().windows.find((w) => w.id === id);
    expect(win?.state).toBe('minimized');
    expect(win?.focused).toBe(false);
  });

  it('maximizes and restores a window', () => {
    const store = useWindowManagerStore.getState();
    const id = store.openWindow({ appId: 'test.app', title: 'Test' });
    store.maximizeWindow(id);
    expect(useWindowManagerStore.getState().windows.find((w) => w.id === id)?.state).toBe('maximized');
    // Toggle back
    store.maximizeWindow(id);
    expect(useWindowManagerStore.getState().windows.find((w) => w.id === id)?.state).toBe('normal');
  });

  it('focuses a window and raises its z-index', () => {
    const store = useWindowManagerStore.getState();
    const id1 = store.openWindow({ appId: 'app1', title: 'App 1' });
    const id2 = store.openWindow({ appId: 'app2', title: 'App 2' });
    store.focusWindow(id1);
    const wins = useWindowManagerStore.getState().windows;
    const w1 = wins.find((w) => w.id === id1)!;
    const w2 = wins.find((w) => w.id === id2)!;
    expect(w1.focused).toBe(true);
    expect(w2.focused).toBe(false);
    expect(w1.zIndex).toBeGreaterThan(w2.zIndex);
  });

  it('moves a window', () => {
    const store = useWindowManagerStore.getState();
    const id = store.openWindow({ appId: 'test.app', title: 'Test', initialRect: { x: 100, y: 100 } });
    store.moveWindow(id, 200, 300);
    const win = useWindowManagerStore.getState().windows.find((w) => w.id === id)!;
    expect(win.rect.x).toBe(200);
    expect(win.rect.y).toBe(300);
  });

  it('resizes a window', () => {
    const store = useWindowManagerStore.getState();
    const id = store.openWindow({ appId: 'test.app', title: 'Test' });
    store.resizeWindow(id, { width: 800, height: 600 });
    const win = useWindowManagerStore.getState().windows.find((w) => w.id === id)!;
    expect(win.rect.width).toBe(800);
    expect(win.rect.height).toBe(600);
  });

  it('cascades window positions', () => {
    const store = useWindowManagerStore.getState();
    const id1 = store.openWindow({ appId: 'app1', title: 'App 1' });
    const id2 = store.openWindow({ appId: 'app2', title: 'App 2' });
    const wins = useWindowManagerStore.getState().windows;
    const w1 = wins.find((w) => w.id === id1)!;
    const w2 = wins.find((w) => w.id === id2)!;
    // Second window should be offset from first
    expect(w2.rect.x).not.toBe(w1.rect.x);
    expect(w2.rect.y).not.toBe(w1.rect.y);
  });
});
