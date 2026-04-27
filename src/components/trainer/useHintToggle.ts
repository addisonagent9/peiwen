import { useState, useEffect } from 'react';

export function useHintToggle(drillKey: 'drill1' | 'drill2' | 'drill3', defaultOn: boolean) {
  const storageKey = `peiwen.trainer.${drillKey}.hint`;
  const [hintOn, setHintOn] = useState(() => {
    try {
      const v = localStorage.getItem(storageKey);
      if (v === '1') return true;
      if (v === '0') return false;
      return defaultOn;
    } catch { return defaultOn; }
  });
  useEffect(() => {
    try { localStorage.setItem(storageKey, hintOn ? '1' : '0'); } catch {}
  }, [hintOn, storageKey]);
  const toggle = () => setHintOn(v => !v);
  return { hintOn, toggle };
}
