/**
 * system/fileSystem/idb.ts
 *
 * Low-level IndexedDB persistence layer using the `idb` library.
 * All FS state is stored in a single DB ("browser-os-fs") with an
 * "entries" object store keyed by absolute path.
 */

import { openDB, type IDBPDatabase } from 'idb';

export interface FsEntry {
  path: string; // absolute path, e.g. "/home/user/notes.txt"
  type: 'file' | 'directory';
  content?: string; // only for files; undefined for directories
  createdAt: number;
  modifiedAt: number;
}

const DB_NAME = 'browser-os-fs';
const DB_VERSION = 1;
const STORE_NAME = 'entries';

let db: IDBPDatabase | null = null;

async function getDb(): Promise<IDBPDatabase> {
  if (db) return db;
  db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(database) {
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'path' });
      }
    },
  });
  return db;
}

export async function readEntry(path: string): Promise<FsEntry | undefined> {
  const database = await getDb();
  return database.get(STORE_NAME, path);
}

export async function writeEntry(entry: FsEntry): Promise<void> {
  const database = await getDb();
  await database.put(STORE_NAME, entry);
}

export async function deleteEntry(path: string): Promise<void> {
  const database = await getDb();
  await database.delete(STORE_NAME, path);
}

export async function listEntries(dirPath: string): Promise<FsEntry[]> {
  const database = await getDb();
  const all: FsEntry[] = await database.getAll(STORE_NAME);
  // Return direct children only (one path segment deeper than dirPath)
  return all.filter((e) => {
    if (e.path === dirPath) return false;
    const relative = e.path.slice(dirPath === '/' ? 1 : dirPath.length + 1);
    return e.path.startsWith(dirPath === '/' ? '/' : dirPath + '/') && !relative.includes('/');
  });
}
