/**
 * hooks/useResize.ts
 *
 * Provides resize handle behaviour for window edges/corners.
 * The caller specifies which edge is being resized; this hook computes
 * the correct rect delta and calls onResize with the updated dimensions.
 */

import { useCallback, useRef } from 'react';
import type { Rect } from '@/core/types';

export type ResizeEdge =
  | 'n' | 's' | 'e' | 'w'
  | 'ne' | 'nw' | 'se' | 'sw';

interface UseResizeOptions {
  edge: ResizeEdge;
  currentRect: Rect;
  onResize: (rect: Partial<Rect>) => void;
  minWidth?: number;
  minHeight?: number;
}

const MIN_W = 200;
const MIN_H = 120;

export function useResize({
  edge,
  currentRect,
  onResize,
  minWidth = MIN_W,
  minHeight = MIN_H,
}: UseResizeOptions) {
  const startRef = useRef<{ pointerX: number; pointerY: number; rect: Rect } | null>(null);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);
      startRef.current = { pointerX: e.clientX, pointerY: e.clientY, rect: { ...currentRect } };
    },
    [currentRect],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!startRef.current) return;
      const dx = e.clientX - startRef.current.pointerX;
      const dy = e.clientY - startRef.current.pointerY;
      const { rect } = startRef.current;
      const update: Partial<Rect> = {};

      // Horizontal edges
      if (edge.includes('e')) {
        update.width = Math.max(minWidth, rect.width + dx);
      }
      if (edge.includes('w')) {
        const newWidth = Math.max(minWidth, rect.width - dx);
        update.x = rect.x + rect.width - newWidth;
        update.width = newWidth;
      }
      // Vertical edges
      if (edge.includes('s')) {
        update.height = Math.max(minHeight, rect.height + dy);
      }
      if (edge.includes('n')) {
        const newHeight = Math.max(minHeight, rect.height - dy);
        update.y = rect.y + rect.height - newHeight;
        update.height = newHeight;
      }

      onResize(update);
    },
    [edge, minWidth, minHeight, onResize],
  );

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    startRef.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }, []);

  return { onPointerDown, onPointerMove, onPointerUp };
}
