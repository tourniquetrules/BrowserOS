# BrowserOS

An experimental browser-native desktop environment — a full window manager, app launcher, virtual filesystem, and user session, all running in-browser with zero backend.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| State | Zustand |
| Persistence | IndexedDB (`idb`) + `localStorage` |
| Styling | CSS Modules + CSS Custom Properties |
| Testing | Vitest + Testing Library |

## Quick Start

```bash
npm install
npm run dev        # Start dev server at http://localhost:5173
npm run build      # Type-check + production build
npm test           # Run unit tests
```

## Architecture

```
src/
├── core/               # OS primitives
│   ├── types.ts        # Shared type aliases (OsId, Rect, OsEventName…)
│   ├── eventBus.ts     # Typed publish/subscribe bus for cross-subsystem events
│   └── kernel.ts       # Boot sequence: hydrates session, registers apps
│
├── system/             # OS subsystems (no React dependencies)
│   ├── windowManager/  # Window state (open/close/focus/move/resize)
│   ├── appRegistry/    # App manifest catalogue + dynamic loader hook
│   ├── fileSystem/     # Virtual POSIX-like FS backed by IndexedDB
│   └── session/        # User config (theme, wallpaper…) via localStorage
│
├── apps/               # Built-in applications
│   ├── Terminal/       # In-browser shell with ls, cat, mkdir, cd, theme…
│   ├── FileExplorer/   # Visual filesystem navigator
│   └── Settings/       # Theme, wallpaper, username, taskbar controls
│
├── ui/                 # Shell chrome (pure React, reads from system stores)
│   ├── Desktop/        # Wallpaper, desktop icons, window host, context menu
│   ├── Window/         # Draggable/resizable window frame + titlebar
│   ├── Taskbar/        # App switcher + clock + start button
│   ├── StartMenu/      # App grid with search
│   └── ContextMenu/    # Right-click menu
│
├── hooks/              # Reusable interaction hooks
│   ├── useDrag.ts      # Pointer-based drag (mouse + touch)
│   ├── useResize.ts    # Edge/corner resize handle behaviour
│   └── useTheme.ts     # Syncs session theme → html[data-theme]
│
└── styles/
    └── global.css      # CSS custom property tokens (dark + light themes)
```

## Key Design Decisions

**Zustand stores as the single source of truth.** The Window Manager, App Registry, and Session are each a Zustand store. React components subscribe to slices; the kernel and system services call `getState()` directly without React.

**CSS Custom Properties for theming.** Switching dark↔light is a single `data-theme` attribute change on `<html>`. No JS class toggling per component.

**Event bus for cross-subsystem decoupling.** Subsystems emit typed events (`window:opened`, `fs:changed`, etc.) rather than importing each other. The kernel wires them together at boot.

**Virtual FS via IndexedDB.** The `fileSystem` service exposes a POSIX-flavoured API (`readFile`, `writeFile`, `mkdir`, `ls`, `rm`). The IDB layer is isolated in `system/fileSystem/idb.ts`.

**ES Module dynamic import for plugin apps.** Third-party apps can be loaded at runtime via `import(url)` and registered with `appRegistry.register(manifest)`.

## Adding a New Built-in App

1. Create `src/apps/MyApp/index.tsx` exporting a React component that accepts `{ windowId: string }`.
2. Create an icon in `src/apps/icons.ts` (inline SVG data-URL).
3. Add an `AppManifest` entry to `src/apps/index.ts`.

## Adding a Plugin App at Runtime

```ts
// Dynamically load an ES module that exports an AppManifest
const mod = await import('https://example.com/my-plugin/manifest.js');
appRegistry.register(mod.manifest);
// Then open it like any built-in:
openWindow({ appId: 'com.example.myplugin', title: 'My Plugin' });
```

## Session Persistence

User preferences (theme, wallpaper, username, taskbar position) are stored in `localStorage` under the key `browser-os-session`. The filesystem is persisted in IndexedDB (`browser-os-fs`). Both survive page reloads; clearing site data resets everything to defaults.
