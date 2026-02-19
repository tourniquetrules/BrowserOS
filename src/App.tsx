/**
 * App.tsx
 *
 * Root application component. Responsibilities:
 *   1. Trigger the kernel boot sequence (async, shown as a loading screen).
 *   2. Apply the active theme via useTheme.
 *   3. Render the Desktop once booted.
 */

import { useState, useEffect } from 'react';
import { boot } from '@/core/kernel';
import { useTheme } from '@/hooks/useTheme';
import { fileSystem } from '@/system/fileSystem';
import { Desktop } from '@/ui/Desktop';

type BootState = 'booting' | 'ready' | 'error';

export function App() {
  const [bootState, setBootState] = useState<BootState>('booting');
  const [error, setError] = useState<string | null>(null);

  // Sync theme attribute to <html>
  useTheme();

  useEffect(() => {
    async function init() {
      try {
        // Init filesystem first (seeds default dirs if first run)
        await fileSystem.init();
        // Boot kernel (loads session, registers apps)
        await boot();
        setBootState('ready');
      } catch (err) {
        setError(String(err));
        setBootState('error');
      }
    }
    init();
  }, []);

  if (bootState === 'booting') {
    return <BootScreen />;
  }

  if (bootState === 'error') {
    return (
      <div style={{ padding: 32, color: '#f38ba8', fontFamily: 'monospace' }}>
        <h1>Boot Error</h1>
        <pre>{error}</pre>
      </div>
    );
  }

  return <Desktop />;
}

function BootScreen() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: 16,
        background: 'var(--color-bg)',
        color: 'var(--color-text)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* Simple CSS spinner */}
      <div
        style={{
          width: 40,
          height: 40,
          border: '3px solid var(--color-border)',
          borderTopColor: 'var(--color-accent)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <span style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>
        BrowserOS booting…
      </span>
    </div>
  );
}
