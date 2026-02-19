/**
 * tests/eventBus.test.ts
 *
 * Unit tests for the typed OS event bus.
 */

import { describe, it, expect, vi } from 'vitest';
import { eventBus } from '@/core/eventBus';

describe('EventBus', () => {
  it('calls registered handler when event is emitted', () => {
    const handler = vi.fn();
    const off = eventBus.on('window:closed', handler);
    eventBus.emit('window:closed', { id: 'win-1' });
    expect(handler).toHaveBeenCalledWith({ id: 'win-1' });
    off();
  });

  it('unsubscribes handler via returned function', () => {
    const handler = vi.fn();
    const off = eventBus.on('window:focused', handler);
    off();
    eventBus.emit('window:focused', { id: 'win-1' });
    expect(handler).not.toHaveBeenCalled();
  });

  it('supports multiple handlers for same event', () => {
    const h1 = vi.fn();
    const h2 = vi.fn();
    const off1 = eventBus.on('theme:changed', h1);
    const off2 = eventBus.on('theme:changed', h2);
    eventBus.emit('theme:changed', 'dark');
    expect(h1).toHaveBeenCalledWith('dark');
    expect(h2).toHaveBeenCalledWith('dark');
    off1(); off2();
  });

  it('does not call handler after off()', () => {
    const handler = vi.fn();
    eventBus.on('session:loaded', handler);
    eventBus.off('session:loaded', handler);
    eventBus.emit('session:loaded');
    expect(handler).not.toHaveBeenCalled();
  });

  it('emits with no payload without throwing', () => {
    const handler = vi.fn();
    const off = eventBus.on('session:saved', handler);
    expect(() => eventBus.emit('session:saved')).not.toThrow();
    expect(handler).toHaveBeenCalledWith(undefined);
    off();
  });
});
