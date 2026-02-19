/**
 * system/fileSystem/index.ts
 *
 * Virtual Filesystem public API.
 * Wraps the IndexedDB layer with a POSIX-inspired interface.
 * All paths are absolute strings starting with "/".
 */

import { eventBus } from '@/core/eventBus';
import {
  readEntry,
  writeEntry,
  deleteEntry,
  listEntries,
  type FsEntry,
} from './idb';

export type { FsEntry };

async function ensureRoot() {
  const root = await readEntry('/');
  if (!root) {
    await writeEntry({ path: '/', type: 'directory', createdAt: Date.now(), modifiedAt: Date.now() });
    // Seed default directory structure
    for (const dir of ['/home', '/home/user', '/tmp', '/apps']) {
      await writeEntry({ path: dir, type: 'directory', createdAt: Date.now(), modifiedAt: Date.now() });
    }
    await writeEntry({
      path: '/home/user/welcome.txt',
      type: 'file',
      content: 'Welcome to BrowserOS!\n\nThis is your home directory.\n',
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    });
  }
}

export const fileSystem = {
  /**
   * Initialise the FS (create root structure if first run).
   * Called by the kernel at boot.
   */
  async init(): Promise<void> {
    await ensureRoot();
  },

  async readFile(path: string): Promise<string> {
    const entry = await readEntry(path);
    if (!entry) throw new Error(`ENOENT: ${path}`);
    if (entry.type !== 'file') throw new Error(`EISDIR: ${path}`);
    return entry.content ?? '';
  },

  async writeFile(path: string, content: string): Promise<void> {
    const existing = await readEntry(path);
    await writeEntry({
      path,
      type: 'file',
      content,
      createdAt: existing?.createdAt ?? Date.now(),
      modifiedAt: Date.now(),
    });
    eventBus.emit('fs:changed', { path });
  },

  async mkdir(path: string): Promise<void> {
    const existing = await readEntry(path);
    if (existing) return; // idempotent
    await writeEntry({ path, type: 'directory', createdAt: Date.now(), modifiedAt: Date.now() });
    eventBus.emit('fs:changed', { path });
  },

  async rm(path: string): Promise<void> {
    await deleteEntry(path);
    eventBus.emit('fs:changed', { path });
  },

  async ls(path: string): Promise<FsEntry[]> {
    return listEntries(path);
  },

  async exists(path: string): Promise<boolean> {
    return (await readEntry(path)) !== undefined;
  },
};
