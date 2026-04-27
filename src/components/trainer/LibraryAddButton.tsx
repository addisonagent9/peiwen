import React, { useCallback, useState } from 'react';
import type { TrainerStrings } from '../../i18n/trainer-strings';

const addedCache = new Set<string>();

interface Props {
  rhymeId: string;
  char: string;
  strings: TrainerStrings;
  size?: 'sm' | 'md';
}

export const LibraryAddButton: React.FC<Props> = ({ rhymeId, char, strings, size = 'md' }) => {
  const cacheKey = `${rhymeId}:${char}`;
  const [added, setAdded] = useState(addedCache.has(cacheKey));
  const [loading, setLoading] = useState(false);

  const handleAdd = useCallback(async () => {
    if (added || loading) return;
    setLoading(true);
    try {
      const res = await fetch('/api/trainer/library/add', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ rhyme_id: rhymeId, char }),
      });
      if (res.ok) {
        addedCache.add(cacheKey);
        setAdded(true);
      }
    } catch {}
    finally { setLoading(false); }
  }, [rhymeId, char, cacheKey, added, loading]);

  if (added) {
    return <span className={`text-gold ${size === 'sm' ? 'text-[10px]' : 'text-xs'}`}>✓</span>;
  }

  return (
    <button
      onClick={handleAdd}
      disabled={loading}
      className={`text-gold hover:text-cream transition-colors disabled:opacity-50 ${
        size === 'sm' ? 'text-[10px]' : 'text-xs'
      }`}
    >
      {loading ? '…' : size === 'sm' ? strings.libraryAddSm : strings.libraryAddBtn}
    </button>
  );
};
