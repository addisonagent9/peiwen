import { useEffect, useState } from 'react';

interface AppSettings {
  [key: string]: string;
}

let cachedSettings: AppSettings | null = null;
let inflightPromise: Promise<AppSettings> | null = null;

export function fetchAppSettings(): Promise<AppSettings> {
  if (cachedSettings) return Promise.resolve(cachedSettings);
  if (inflightPromise) return inflightPromise;
  inflightPromise = fetch('/api/settings', { credentials: 'include' })
    .then(r => r.json())
    .then(data => { cachedSettings = data; return data; })
    .catch(() => ({}))
    .finally(() => { inflightPromise = null; });
  return inflightPromise;
}

export function getSettingNumber(settings: AppSettings, key: string, fallback: number): number {
  const v = parseInt(settings[key] ?? '');
  return Number.isFinite(v) ? v : fallback;
}
