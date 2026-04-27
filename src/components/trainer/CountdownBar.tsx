import React, { useEffect, useState } from 'react';

interface Props {
  startMs: number;
  durationMs: number;
}

export const CountdownBar: React.FC<Props> = ({ startMs, durationMs }) => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let raf: number;
    const tick = () => {
      const elapsed = Date.now() - startMs;
      const p = Math.min(1, elapsed / durationMs);
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [startMs, durationMs]);
  return (
    <div className="w-full h-1 bg-ink-line/30 rounded-full overflow-hidden mt-3">
      <div
        className="h-full bg-gold"
        style={{ width: `${progress * 100}%`, transition: 'none' }}
      />
    </div>
  );
};
