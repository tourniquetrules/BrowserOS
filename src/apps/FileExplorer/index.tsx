/**
 * apps/FileExplorer/index.tsx
 *
 * A minimal file manager that navigates the virtual filesystem.
 * Double-click directories to navigate; click files to (future) open them.
 */

import { useState, useEffect, useCallback } from 'react';
import { fileSystem, type FsEntry } from '@/system/fileSystem';
import { eventBus } from '@/core/eventBus';
import type { AppComponentProps } from '@/system/appRegistry';
import styles from './FileExplorer.module.css';

function parentOf(path: string): string {
  if (path === '/') return '/';
  const parts = path.split('/').filter(Boolean);
  return '/' + parts.slice(0, -1).join('/');
}

function nameOf(path: string): string {
  return path.split('/').filter(Boolean).pop() ?? '/';
}

function iconFor(entry: FsEntry): string {
  if (entry.type === 'directory') return '📁';
  const ext = entry.path.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, string> = { txt: '📄', md: '📝', json: '🔧', js: '📜', ts: '📜' };
  return map[ext] ?? '📄';
}

export function FileExplorer(_props: AppComponentProps) {
  const [cwd, setCwd] = useState('/home/user');
  const [entries, setEntries] = useState<FsEntry[]>([]);
  const [history, setHistory] = useState<string[]>(['/home/user']);
  const [histIdx, setHistIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  const navigate = useCallback((path: string, addHistory = true) => {
    setCwd(path);
    setSelected(null);
    if (addHistory) {
      setHistory((h) => [...h.slice(0, histIdx + 1), path]);
      setHistIdx((i) => i + 1);
    }
  }, [histIdx]);

  const loadEntries = useCallback(async () => {
    try {
      const list = await fileSystem.ls(cwd);
      setEntries(list.sort((a, b) => {
        // Directories first
        if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
        return a.path.localeCompare(b.path);
      }));
    } catch {
      setEntries([]);
    }
  }, [cwd]);

  useEffect(() => { loadEntries(); }, [loadEntries]);

  // Refresh when FS changes
  useEffect(() => eventBus.on('fs:changed', loadEntries), [loadEntries]);

  const handleBack = () => {
    if (histIdx <= 0) return;
    const prev = history[histIdx - 1];
    setHistIdx((i) => i - 1);
    setCwd(prev);
    setSelected(null);
  };

  const handleForward = () => {
    if (histIdx >= history.length - 1) return;
    const next = history[histIdx + 1];
    setHistIdx((i) => i + 1);
    setCwd(next);
    setSelected(null);
  };

  const handleDoubleClick = (entry: FsEntry) => {
    if (entry.type === 'directory') navigate(entry.path);
    // Future: open files with associated app
  };

  return (
    <div className={styles.explorer}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <button className={styles.navBtn} onClick={handleBack} disabled={histIdx <= 0} title="Back">←</button>
        <button className={styles.navBtn} onClick={handleForward} disabled={histIdx >= history.length - 1} title="Forward">→</button>
        <button className={styles.navBtn} onClick={() => navigate(parentOf(cwd))} disabled={cwd === '/'} title="Up">↑</button>
        <button className={styles.navBtn} onClick={loadEntries} title="Refresh">↻</button>
        <input
          className={styles.pathBar}
          value={cwd}
          onChange={(e) => setCwd(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && navigate((e.target as HTMLInputElement).value)}
        />
      </div>

      {/* File grid */}
      <div className={styles.content}>
        {entries.length === 0 ? (
          <div className={styles.empty}>Empty directory</div>
        ) : (
          entries.map((entry) => (
            <button
              key={entry.path}
              className={`${styles.entry} ${selected === entry.path ? styles.selected : ''}`}
              onClick={() => setSelected(entry.path)}
              onDoubleClick={() => handleDoubleClick(entry)}
              title={nameOf(entry.path)}
            >
              <span className={styles.entryIcon}>{iconFor(entry)}</span>
              <span className={styles.entryName}>{nameOf(entry.path)}</span>
            </button>
          ))
        )}
      </div>

      {/* Status bar */}
      <div className={styles.statusBar}>
        {entries.length} item{entries.length !== 1 ? 's' : ''}
        {selected && ` — ${nameOf(selected)} selected`}
      </div>
    </div>
  );
}
