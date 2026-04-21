import { useCallback, useEffect, useState } from 'react';

interface AudioItem {
  text: string;
  voiceKind: string;
  usageContext: string[];
  clips: AudioClip[];
}

interface AudioClip {
  id: number;
  provider: string;
  voiceId: string;
  status: 'pending' | 'approved' | 'rejected';
  filePath: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

interface Filters {
  status: 'pending' | 'approved' | 'rejected' | 'all';
  voiceKind: 'mandarin' | 'cantonese' | 'all';
  search: string;
}

interface UseAdminAudioReturn {
  items: AudioItem[];
  isLoading: boolean;
  error: string | null;
  filters: Filters;
  setFilters: (f: Partial<Filters>) => void;
  approve: (clipId: number) => Promise<void>;
  reject: (clipId: number) => Promise<void>;
  regenerate: (clipId: number) => Promise<void>;
  generate: (text: string, voiceKind: string, provider: string, voiceId: string) => Promise<void>;
  prewarm: () => Promise<{ generated: number; skipped: number }>;
  refresh: () => void;
}

export function useAdminAudio(): UseAdminAudioReturn {
  const [items, setItems] = useState<AudioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<Filters>({
    status: 'pending',
    voiceKind: 'all',
    search: '',
  });

  const buildQuery = useCallback((f: Filters) => {
    const params = new URLSearchParams();
    if (f.status !== 'all') params.set('status', f.status);
    if (f.voiceKind !== 'all') params.set('voiceKind', f.voiceKind);
    if (f.search) params.set('search', f.search);
    return params.toString();
  }, []);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const q = buildQuery(filters);
      const res = await fetch(`/api/admin/audio/items?${q}`, { credentials: 'include' });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      setItems(data.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setIsLoading(false);
    }
  }, [filters, buildQuery]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const setFilters = useCallback((partial: Partial<Filters>) => {
    setFiltersState(prev => ({ ...prev, ...partial }));
  }, []);

  const postAction = useCallback(async (path: string, body: object) => {
    const res = await fetch(`/api/admin/audio/${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? `${res.status}`);
    }
    return res.json();
  }, []);

  const approve = useCallback(async (clipId: number) => {
    await postAction('approve', { clipId });
    await fetchItems();
  }, [postAction, fetchItems]);

  const reject = useCallback(async (clipId: number) => {
    await postAction('reject', { clipId });
    await fetchItems();
  }, [postAction, fetchItems]);

  const regenerate = useCallback(async (clipId: number) => {
    await postAction('regenerate', { clipId });
    await fetchItems();
  }, [postAction, fetchItems]);

  const generate = useCallback(async (text: string, voiceKind: string, provider: string, voiceId: string) => {
    await postAction('generate', { text, voiceKind, provider, voiceId });
    await fetchItems();
  }, [postAction, fetchItems]);

  const prewarm = useCallback(async () => {
    const data = await postAction('prewarm', {});
    await fetchItems();
    return data;
  }, [postAction, fetchItems]);

  return {
    items, isLoading, error, filters, setFilters,
    approve, reject, regenerate, generate, prewarm,
    refresh: fetchItems,
  };
}
