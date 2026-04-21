import React, { useCallback, useState } from 'react';
import { useAdminAudio } from '../../hooks/useAdminAudio';

const PROVIDERS = [
  { id: 'elevenlabs', label: 'ElevenLabs' },
  { id: 'azure', label: 'Azure' },
  { id: 'alibaba', label: 'CosyVoice' },
] as const;

// ---------------------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------------------

const STATUS_OPTIONS = ['pending', 'approved', 'rejected', 'all'] as const;
const VOICE_OPTIONS = ['all', 'mandarin', 'cantonese'] as const;

function statusColor(s: string): string {
  if (s === 'approved') return 'text-[#B8A04A] border-[#B8A04A]/40 bg-[#B8A04A]/10';
  if (s === 'rejected') return 'text-rose-400 border-rose-400/40 bg-rose-400/10';
  return 'text-amber-300 border-amber-300/40 bg-amber-300/10'; // pending
}

function statusLabel(s: string): string {
  if (s === 'approved') return 'Approved';
  if (s === 'rejected') return 'Rejected';
  return 'Pending';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AudioReview() {
  const {
    items, isLoading, error, filters, setFilters,
    approve, reject, regenerate, generate, prewarm, refresh,
  } = useAdminAudio();

  const [generateLoading, setGenerateLoading] = useState<string | null>(null);
  const [prewarmLoading, setPrewarmLoading] = useState(false);
  const [prewarmResult, setPrewarmResult] = useState<{ generated: number; skipped: number } | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // --- Prewarm ---
  const handlePrewarm = async () => {
    setPrewarmLoading(true);
    setPrewarmResult(null);
    try {
      const result = await prewarm();
      setPrewarmResult(result);
    } catch {
      // error is surfaced via the hook
    } finally {
      setPrewarmLoading(false);
    }
  };

  // --- Clip actions ---
  const handleAction = async (action: (id: number) => Promise<void>, clipId: number) => {
    setActionLoading(clipId);
    try {
      await action(clipId);
    } catch {
      // error surfaced via hook
    } finally {
      setActionLoading(null);
    }
  };

  // --- Counts ---
  const totalClips = items.reduce((n, item) => n + item.clips.length, 0);
  const pendingCount = items.reduce((n, item) => n + item.clips.filter(c => c.status === 'pending').length, 0);
  const approvedCount = items.reduce((n, item) => n + item.clips.filter(c => c.status === 'approved').length, 0);

  return (
    <div className="min-h-screen bg-[#1A1814] text-[#F5F0E8] px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* ── Header ───────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">音频审核</h1>
            <p className="text-sm text-[#F5F0E8]/60 mt-1">
              {totalClips} clips &middot; {pendingCount} pending &middot; {approvedCount} approved
            </p>
          </div>
          <div className="flex items-center gap-3">
            {prewarmResult && (
              <span className="text-xs text-[#B8A04A]">
                +{prewarmResult.generated} generated, {prewarmResult.skipped} skipped
              </span>
            )}
            <button
              onClick={handlePrewarm}
              disabled={prewarmLoading}
              className="px-4 py-2 rounded-lg bg-[#B8A04A]/20 text-[#B8A04A] border border-[#B8A04A]/30 hover:bg-[#B8A04A]/30 disabled:opacity-50 transition text-sm font-medium"
            >
              {prewarmLoading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Running...
                </span>
              ) : 'Run Prewarm'}
            </button>
            <button
              onClick={refresh}
              className="px-3 py-2 rounded-lg border border-[#F5F0E8]/20 text-[#F5F0E8]/60 hover:text-[#F5F0E8] hover:border-[#F5F0E8]/40 transition text-sm"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* ── Filter bar ───────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Status pills */}
          <div className="flex gap-1 bg-[#F5F0E8]/5 rounded-lg p-1">
            {STATUS_OPTIONS.map(s => (
              <button
                key={s}
                onClick={() => setFilters({ status: s })}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  filters.status === s
                    ? 'bg-[#F5F0E8]/15 text-[#F5F0E8]'
                    : 'text-[#F5F0E8]/40 hover:text-[#F5F0E8]/70'
                }`}
              >
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          {/* Voice kind toggle */}
          <div className="flex gap-1 bg-[#F5F0E8]/5 rounded-lg p-1">
            {VOICE_OPTIONS.map(v => (
              <button
                key={v}
                onClick={() => setFilters({ voiceKind: v as any })}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  filters.voiceKind === v
                    ? 'bg-[#F5F0E8]/15 text-[#F5F0E8]'
                    : 'text-[#F5F0E8]/40 hover:text-[#F5F0E8]/70'
                }`}
              >
                {v === 'all' ? 'All' : v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>

          {/* Search */}
          <input
            type="text"
            value={filters.search}
            onChange={e => setFilters({ search: e.target.value })}
            placeholder="Search text..."
            className="flex-1 min-w-0 px-3 py-1.5 rounded-lg bg-[#F5F0E8]/5 border border-[#F5F0E8]/10 text-sm text-[#F5F0E8] placeholder-[#F5F0E8]/30 focus:outline-none focus:border-[#B8A04A]/50"
          />
        </div>

        {/* ── Error ────────────────────────────────────────────────── */}
        {error && (
          <div className="rounded-lg border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        {/* ── Loading ──────────────────────────────────────────────── */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <svg className="animate-spin h-6 w-6 text-[#B8A04A]" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}

        {/* ── Item list ────────────────────────────────────────────── */}
        {!isLoading && items.length === 0 && (
          <p className="text-center text-[#F5F0E8]/40 py-12 text-sm">No items found.</p>
        )}

        <div className="space-y-4">
          {items.map(item => (
            <div
              key={`${item.text}-${item.voiceKind}`}
              className="rounded-xl border border-[#F5F0E8]/10 bg-[#F5F0E8]/[0.03] overflow-hidden"
            >
              {/* Item header */}
              <div className="px-4 py-3 border-b border-[#F5F0E8]/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold">{item.text}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full border border-[#F5F0E8]/20 text-[#F5F0E8]/50">
                    {item.voiceKind}
                  </span>
                </div>
                {item.usageContext.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.usageContext.map(ctx => (
                      <span key={ctx} className="text-[10px] px-1.5 py-0.5 rounded bg-[#F5F0E8]/5 text-[#F5F0E8]/40">
                        {ctx}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Clips — stacked for A/B comparison */}
              {item.clips.length > 0 && (
                <div className="divide-y divide-[#F5F0E8]/5">
                  {item.clips.map(clip => (
                    <div
                      key={clip.id}
                      className="px-4 py-3 flex flex-col gap-2"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        {/* Provider badge + status */}
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F5F0E8]/10 text-[#F5F0E8]/60 font-mono">
                            {clip.provider}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColor(clip.status)}`}>
                            {statusLabel(clip.status)}
                          </span>
                          <span className="text-xs text-[#F5F0E8]/30 truncate">
                            {clip.voiceId?.slice(0, 12)}{clip.voiceId && clip.voiceId.length > 12 ? '…' : ''}
                          </span>
                        </div>

                        {/* Audio player */}
                        <audio
                          controls
                          src={`/api/admin/audio/file/${clip.id}`}
                          className="h-8 w-full sm:w-48 flex-shrink-0"
                        />

                        {/* Action buttons */}
                        <div className="flex gap-1.5 flex-shrink-0">
                          <button
                            onClick={() => handleAction(approve, clip.id)}
                            disabled={actionLoading === clip.id || clip.status === 'approved'}
                            className="px-2 py-1 rounded text-xs bg-[#B8A04A]/10 text-[#B8A04A] border border-[#B8A04A]/30 hover:bg-[#B8A04A]/20 disabled:opacity-30 transition"
                          >✓</button>
                          <button
                            onClick={() => handleAction(reject, clip.id)}
                            disabled={actionLoading === clip.id || clip.status === 'rejected'}
                            className="px-2 py-1 rounded text-xs bg-rose-400/10 text-rose-400 border border-rose-400/30 hover:bg-rose-400/20 disabled:opacity-30 transition"
                          >✗</button>
                          <button
                            onClick={() => handleAction(regenerate, clip.id)}
                            disabled={actionLoading === clip.id}
                            className="px-2 py-1 rounded text-xs bg-amber-300/10 text-amber-300 border border-amber-300/30 hover:bg-amber-300/20 disabled:opacity-30 transition"
                          >↻</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Generate with provider picker */}
              <div className="px-4 py-3 border-t border-[#F5F0E8]/5 flex flex-wrap gap-2">
                {PROVIDERS.map(prov => {
                  const key = `${item.text}-${item.voiceKind}-${prov.id}`;
                  const alreadyExists = item.clips.some(c => c.provider === prov.id);
                  return (
                    <button
                      key={prov.id}
                      onClick={async () => {
                        setGenerateLoading(key);
                        try {
                          await generate(item.text, item.voiceKind, prov.id, '');
                        } catch (err) {
                          const msg = err instanceof Error ? err.message : String(err);
                          alert(`Failed to generate with ${prov.label}: ${msg}`);
                        }
                        setGenerateLoading(null);
                      }}
                      disabled={generateLoading === key}
                      className={`px-2.5 py-1 rounded text-xs border transition ${
                        alreadyExists
                          ? 'border-[#F5F0E8]/10 text-[#F5F0E8]/30'
                          : 'border-[#F5F0E8]/20 text-[#F5F0E8]/60 hover:text-[#F5F0E8] hover:border-[#F5F0E8]/40'
                      } disabled:opacity-50`}
                    >
                      {generateLoading === key ? '...' : `+ ${prov.label}`}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
