/**
 * apps/index.ts
 *
 * Barrel that exports the list of built-in AppManifests.
 * The kernel imports this and registers everything at boot.
 *
 * To add a new built-in app:
 *   1. Create src/apps/MyApp/index.tsx  (export a React component)
 *   2. Add an entry to the `builtinApps` array below.
 */

import type { AppManifest } from '@/system/appRegistry';
import { Terminal } from './Terminal';
import { FileExplorer } from './FileExplorer';
import { Settings } from './Settings';
import { terminalIcon, fileExplorerIcon, settingsIcon } from './icons';

export const builtinApps: AppManifest[] = [
  {
    id: 'com.browseros.terminal',
    name: 'Terminal',
    icon: terminalIcon,
    description: 'Command-line interface to BrowserOS',
    defaultRect: { width: 700, height: 440 },
    component: Terminal,
  },
  {
    id: 'com.browseros.fileexplorer',
    name: 'Files',
    icon: fileExplorerIcon,
    description: 'Browse the virtual filesystem',
    defaultRect: { width: 600, height: 420 },
    component: FileExplorer,
  },
  {
    id: 'com.browseros.settings',
    name: 'Settings',
    icon: settingsIcon,
    description: 'Customise your BrowserOS environment',
    defaultRect: { width: 480, height: 500 },
    component: Settings,
  },
];
