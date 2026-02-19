/**
 * core/kernel.ts
 *
 * The kernel orchestrates the boot sequence: it initialises each subsystem
 * in the correct order and exposes a single `boot()` function called once
 * from App.tsx.
 *
 * Subsystems are kept loosely coupled – the kernel wires them together here
 * rather than having them import each other directly.
 */

import { eventBus } from './eventBus';
import { sessionService } from '@/system/session';
import { appRegistry } from '@/system/appRegistry';
import { builtinApps } from '@/apps';

export interface KernelState {
  booted: boolean;
  bootedAt: number;
}

let state: KernelState = { booted: false, bootedAt: 0 };

/**
 * boot()
 *
 * Call once on application startup. Returns a promise that resolves when
 * all async subsystems (IndexedDB, session hydration) are ready.
 */
export async function boot(): Promise<KernelState> {
  if (state.booted) return state;

  // 1. Load persisted user session (theme, layout, etc.)
  await sessionService.load();
  eventBus.emit('session:loaded');

  // 2. Register built-in applications into the app registry
  for (const app of builtinApps) {
    appRegistry.register(app);
  }
  eventBus.emit('app:registered');

  state = { booted: true, bootedAt: Date.now() };
  return state;
}

export function getKernelState(): KernelState {
  return state;
}
