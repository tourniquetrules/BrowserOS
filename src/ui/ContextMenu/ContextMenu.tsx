/**
 * ui/ContextMenu/ContextMenu.tsx
 *
 * A generic right-click context menu component.
 * Position is supplied by the caller (usually the Desktop onContextMenu handler).
 */

import type { MouseEvent } from 'react';
import styles from './ContextMenu.module.css';

export interface ContextMenuItem {
  label: string;
  icon?: string;
  danger?: boolean;
  dividerAfter?: boolean;
  onClick: () => void;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const handleItemClick = (item: ContextMenuItem) => (e: MouseEvent) => {
    e.stopPropagation();
    item.onClick();
    onClose();
  };

  return (
    <>
      <div className={styles.overlay} onClick={onClose} onContextMenu={(e) => { e.preventDefault(); onClose(); }} />
      <div
        className={styles.menu}
        style={{ left: x, top: y }}
        role="menu"
      >
        {items.map((item, i) => (
          <div key={i}>
            <button
              className={`${styles.item} ${item.danger ? styles.danger : ''}`}
              onClick={handleItemClick(item)}
              role="menuitem"
            >
              {item.icon && <span aria-hidden>{item.icon}</span>}
              {item.label}
            </button>
            {item.dividerAfter && <div className={styles.divider} />}
          </div>
        ))}
      </div>
    </>
  );
}
