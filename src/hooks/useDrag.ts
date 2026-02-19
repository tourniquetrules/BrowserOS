/**
 * hooks/useDrag.ts
 *
 * A pointer-based drag hook that works for both mouse and touch events.
 * Returns event handlers to attach to the drag handle element.
 *
 * Usage:
 *   const { onPointerDown } = useDrag({ onMove: (dx, dy) => ... });
 */

import { useCallback, useRef } from 'react';

interface UseDragOptions {
  /** Called on each pointer move with delta since last event. */
  onMove: (dx: number, dy: number) => void;
  /** Optional callback when drag starts. */
  onStart?: () => void;
  /** Optional callback when drag ends. */
  onEnd?: () => void;
}

export function useDrag({ onMove, onStart, onEnd }: UseDragOptions) {
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Only handle primary button (left click / touch)
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      e.currentTarget.setPointerCapture(e.pointerId);
      lastPos.current = { x: e.clientX, y: e.clientY };
      onStart?.();
    },
    [onStart],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!lastPos.current) return;
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      lastPos.current = { x: e.clientX, y: e.clientY };
      onMove(dx, dy);
    },
    [onMove],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!lastPos.current) return;
      lastPos.current = null;
      e.currentTarget.releasePointerCapture(e.pointerId);
      onEnd?.();
    },
    [onEnd],
  );

  return { onPointerDown, onPointerMove, onPointerUp };
}
