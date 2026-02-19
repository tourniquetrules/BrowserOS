/**
 * apps/icons.ts
 *
 * Inline SVG data-URLs for built-in app icons.
 * Keeping them inline avoids extra HTTP requests and works in any deploy context.
 */

function svg(content: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(content)}`;
}

export const terminalIcon = svg(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#11111b"/>
  <rect x="2" y="2" width="28" height="28" rx="5" fill="#181825"/>
  <polyline points="7,12 13,16 7,20" stroke="#a6e3a1" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <line x1="15" y1="20" x2="25" y2="20" stroke="#89b4fa" stroke-width="2.5" stroke-linecap="round"/>
</svg>`);

export const fileExplorerIcon = svg(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#1e3a5f"/>
  <path d="M4 10 Q4 8 6 8 L13 8 L15 11 L26 11 Q28 11 28 13 L28 24 Q28 26 26 26 L6 26 Q4 26 4 24Z" fill="#89b4fa"/>
  <path d="M4 13 L28 13" stroke="#1e3a5f" stroke-width="0.5"/>
</svg>`);

export const settingsIcon = svg(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#313244"/>
  <circle cx="16" cy="16" r="4" fill="none" stroke="#cdd6f4" stroke-width="2.5"/>
  <path d="M16 4 L16 8 M16 24 L16 28 M4 16 L8 16 M24 16 L28 16
           M7.5 7.5 L10.3 10.3 M21.7 21.7 L24.5 24.5
           M24.5 7.5 L21.7 10.3 M10.3 21.7 L7.5 24.5"
        stroke="#cdd6f4" stroke-width="2.5" stroke-linecap="round"/>
</svg>`);
