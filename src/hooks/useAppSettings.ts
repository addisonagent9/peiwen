interface AppSettings {
  [key: string]: string;
}

export function fetchAppSettings(): Promise<AppSettings> {
  return fetch('/api/settings', { credentials: 'include' })
    .then(r => r.json())
    .catch(() => ({}));
}

export function getSettingNumber(settings: AppSettings, key: string, fallback: number): number {
  const v = parseInt(settings[key] ?? '');
  return Number.isFinite(v) ? v : fallback;
}
