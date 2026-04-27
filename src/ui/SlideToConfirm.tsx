import React, { useState, useRef } from 'react';

interface Props {
  label: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export function SlideToConfirm({ label, onConfirm, onCancel }: Props) {
  const [pos, setPos] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const onPointerDown = (e: React.PointerEvent) => {
    draggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    setPos(Math.max(0, Math.min(1, x)));
  };
  const onPointerUp = () => {
    draggingRef.current = false;
    if (pos > 0.9) {
      onConfirm();
    } else {
      setPos(0);
      onCancel?.();
    }
  };

  return (
    <div ref={trackRef} className="relative w-full h-10 bg-ink-line/40 rounded-full overflow-hidden select-none">
      <div className="absolute inset-0 flex items-center justify-center text-xs text-creamDim pointer-events-none">{label}</div>
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="absolute top-0 left-0 h-full bg-gold rounded-full cursor-grab active:cursor-grabbing flex items-center justify-end pr-3 text-ink-bg text-xs touch-none"
        style={{ width: `${Math.max(15, pos * 100)}%`, transition: draggingRef.current ? 'none' : 'width 0.2s' }}
      >
        →
      </div>
    </div>
  );
}
