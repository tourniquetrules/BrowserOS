/**
 * core/eventBus.ts
 *
 * A tiny typed publish/subscribe event bus used for cross-subsystem
 * communication without creating tight coupling.
 *
 * Usage:
 *   eventBus.on('window:closed', ({ id }) => console.log('closed', id));
 *   eventBus.emit('window:closed', { id: 'win-1' });
 */

import type { OsEventName } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Handler = (...args: any[]) => void;

class EventBus {
  private listeners = new Map<OsEventName, Set<Handler>>();

  on(event: OsEventName, handler: Handler): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);

    // Return an unsubscribe function for easy cleanup in useEffect
    return () => this.off(event, handler);
  }

  off(event: OsEventName, handler: Handler): void {
    this.listeners.get(event)?.delete(handler);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emit(event: OsEventName, payload?: any): void {
    this.listeners.get(event)?.forEach((h) => h(payload));
  }
}

/** Singleton event bus – import this directly. */
export const eventBus = new EventBus();
