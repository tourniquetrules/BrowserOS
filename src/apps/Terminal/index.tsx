/**
 * apps/Terminal/index.tsx
 *
 * A simple browser-side terminal emulator.
 * Supports a small set of built-in commands; architecture is intentionally
 * command-handler based so new commands are easy to add.
 */

import { useState, useRef, useEffect, useCallback, KeyboardEvent } from 'react';
import { fileSystem } from '@/system/fileSystem';
import { useSessionStore } from '@/system/session';
import type { AppComponentProps } from '@/system/appRegistry';
import styles from './Terminal.module.css';

type LineType = 'output' | 'error' | 'info' | 'prompt';

interface Line {
  text: string;
  type: LineType;
}

type CommandHandler = (args: string[], cwd: string) => Promise<{ output: string; type?: LineType; newCwd?: string }>;

// ─── Command registry ────────────────────────────────────────────────────────

const commands: Record<string, CommandHandler> = {
  async help() {
    return {
      output: [
        'Available commands:',
        '  help              — show this help',
        '  ls [path]         — list directory contents',
        '  cat <path>        — print file contents',
        '  echo <text>       — print text',
        '  mkdir <path>      — create directory',
        '  touch <path>      — create empty file',
        '  rm <path>         — remove file/directory',
        '  pwd               — print working directory',
        '  cd <path>         — change directory',
        '  clear             — clear terminal',
        '  theme <dark|light>— change OS theme',
        '  whoami            — print username',
      ].join('\n'),
      type: 'info',
    };
  },

  async pwd(_args, cwd) {
    return { output: cwd };
  },

  async ls([path], cwd) {
    const target = resolvePath(path ?? '.', cwd);
    try {
      const entries = await fileSystem.ls(target);
      if (entries.length === 0) return { output: '(empty)' };
      return {
        output: entries
          .map((e) => `${e.type === 'directory' ? 'd' : '-'}  ${e.path.split('/').pop()}`)
          .join('\n'),
      };
    } catch {
      return { output: `ls: cannot access '${target}'`, type: 'error' };
    }
  },

  async cat([path], cwd) {
    if (!path) return { output: 'Usage: cat <path>', type: 'error' };
    const target = resolvePath(path, cwd);
    try {
      const content = await fileSystem.readFile(target);
      return { output: content };
    } catch {
      return { output: `cat: ${target}: No such file`, type: 'error' };
    }
  },

  async echo(args) {
    return { output: args.join(' ') };
  },

  async mkdir([path], cwd) {
    if (!path) return { output: 'Usage: mkdir <path>', type: 'error' };
    await fileSystem.mkdir(resolvePath(path, cwd));
    return { output: '' };
  },

  async touch([path], cwd) {
    if (!path) return { output: 'Usage: touch <path>', type: 'error' };
    await fileSystem.writeFile(resolvePath(path, cwd), '');
    return { output: '' };
  },

  async rm([path], cwd) {
    if (!path) return { output: 'Usage: rm <path>', type: 'error' };
    await fileSystem.rm(resolvePath(path, cwd));
    return { output: '' };
  },

  async whoami() {
    const username = useSessionStore.getState().config.username;
    return { output: username };
  },

  async theme([mode]) {
    if (mode !== 'dark' && mode !== 'light') {
      return { output: 'Usage: theme <dark|light>', type: 'error' };
    }
    useSessionStore.getState().setTheme(mode);
    return { output: `Theme set to ${mode}`, type: 'info' };
  },

  // 'cd' and 'clear' are handled specially in the component because they
  // need to mutate component state (cwd, lines).
};

function resolvePath(input: string, cwd: string): string {
  if (input.startsWith('/')) return input;
  if (input === '.') return cwd;
  if (input === '..') {
    const parts = cwd.split('/').filter(Boolean);
    return '/' + parts.slice(0, -1).join('/') || '/';
  }
  return `${cwd === '/' ? '' : cwd}/${input}`;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function Terminal(_props: AppComponentProps) {
  const username = useSessionStore((s) => s.config.username);
  const [lines, setLines] = useState<Line[]>([
    { text: 'BrowserOS Terminal v0.1.0', type: 'info' },
    { text: "Type 'help' for available commands.", type: 'info' },
    { text: '', type: 'output' },
  ]);
  const [input, setInput] = useState('');
  const [cwd, setCwd] = useState('/home/user');
  const [history, setHistory] = useState<string[]>([]);
  const [, setHistIdx] = useState(-1); // current index only needed via setter
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new output
  useEffect(() => {
    outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight });
  }, [lines]);

  const appendLine = useCallback((text: string, type: LineType = 'output') => {
    setLines((l) => [...l, { text, type }]);
  }, []);

  const runCommand = useCallback(
    async (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) return;

      // Echo the prompt line
      appendLine(`${username}@browseros:${cwd}$ ${trimmed}`, 'prompt');

      // Add to history
      setHistory((h) => [trimmed, ...h.slice(0, 49)]);
      setHistIdx(-1);

      const [cmd, ...args] = trimmed.split(/\s+/);

      // Special commands that mutate component state
      if (cmd === 'clear') {
        setLines([]);
        return;
      }
      if (cmd === 'cd') {
        const target = resolvePath(args[0] ?? '/home/user', cwd);
        const exists = await fileSystem.exists(target);
        if (!exists) {
          appendLine(`cd: ${target}: No such directory`, 'error');
        } else {
          setCwd(target);
        }
        return;
      }

      const handler = commands[cmd];
      if (!handler) {
        appendLine(`${cmd}: command not found`, 'error');
        return;
      }

      try {
        const result = await handler(args, cwd);
        if (result.newCwd) setCwd(result.newCwd);
        if (result.output) appendLine(result.output, result.type ?? 'output');
      } catch (err) {
        appendLine(`Error: ${String(err)}`, 'error');
      }
    },
    [appendLine, cwd, username],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        runCommand(input);
        setInput('');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHistIdx((i) => {
          const next = Math.min(i + 1, history.length - 1);
          setInput(history[next] ?? '');
          return next;
        });
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHistIdx((i) => {
          const next = Math.max(i - 1, -1);
          setInput(next === -1 ? '' : history[next]);
          return next;
        });
      }
    },
    [input, runCommand, history],
  );

  return (
    <div className={styles.terminal} onClick={() => inputRef.current?.focus()}>
      <div className={styles.output} ref={outputRef}>
        {lines.map((l, i) => (
          <span key={i} className={`${styles.line} ${styles[l.type]}`}>
            {l.text + '\n'}
          </span>
        ))}
      </div>
      <div className={styles.inputRow}>
        <span className={styles.promptLabel}>{username}@browseros:{cwd}$&nbsp;</span>
        <input
          ref={inputRef}
          className={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          aria-label="Terminal input"
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
        />
      </div>
    </div>
  );
}
