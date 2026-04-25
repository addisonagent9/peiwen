/**
 * PingshuiTrainer — top-level component for the 韵部 trainer module.
 *
 * Add to your top-level View enum:
 *   type View = ... | 'pingshui-trainer';
 *
 * Then render:
 *   {view === 'pingshui-trainer' && <PingshuiTrainer onExit={() => setView('home')} />}
 *
 * ── Sub-view routing ─────────────────────────────────────────────────────────
 * No router library. Internal state machine via useState<SubView>. This
 * matches your existing convention and keeps the trainer self-contained.
 *
 *   home        → welcome + tier selector + due-count callout
 *   foundation  → Phase 0 interactive intro (M3.2)
 *   tier        → list of rhymes in a tier, pick one to learn
 *   drill       → active SRS session (M3.3)
 *   dashboard   → 106-category heatmap + stats (M3.4)
 *
 * ── Design notes ─────────────────────────────────────────────────────────────
 * Aesthetic: scholar's study. Ink-bg background, cream text, gold for mastery,
 * teal for progress, rose for errors. Generous whitespace. Font-serif for
 * Chinese characters (renders as Songti/Mincho on most systems).
 *
 * Mobile-first. The entire trainer is a single full-screen surface. No
 * two-column layouts. Every interactive target is ≥44px tall.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useTrainerApi } from '../../hooks/useTrainerApi';
import { getStrings } from '../../i18n/trainer-strings';
import type { UserTrainerState, RhymeTier } from '../../types/pingshui-trainer';
import { TrainerHome } from './TrainerHome';
import { TrainerTierView } from './TrainerTierView';
import { TrainerHeader } from './TrainerHeader';
import { TrainerPlaceholder } from './TrainerPlaceholder';
import { FoundationModule } from './FoundationModule';
import { RhymeDetail } from './RhymeDetail';
import { DrillSession } from './DrillSession';
import { DrillRecallSession } from './DrillRecallSession';
import { DrillPairSession } from './DrillPairSession';

export type SubView =
  | 'home'
  | 'foundation'
  | 'tier'
  | 'detail'
  | 'drill'
  | 'drill-recall'
  | 'drill-pair'
  | 'dashboard';

export interface PingshuiTrainerProps {
  /** Called when the user taps the back/exit affordance to leave the trainer. */
  onExit?: () => void;
  /** Optional display name for the welcome greeting. */
  userName?: string;
}

export const PingshuiTrainer: React.FC<PingshuiTrainerProps> = ({
  onExit,
  userName,
}) => {
  const api = useTrainerApi();

  // Core persisted state, loaded from the server
  const [state, setState] = useState<UserTrainerState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state — which sub-view is active, and parameters
  const [subView, setSubView] = useState<SubView>('home');
  const [selectedTier, setSelectedTier] = useState<RhymeTier>(1);
  const [selectedRhymeId, setSelectedRhymeId] = useState<string | null>(null);
  const [drillScope, setDrillScope] = useState<'tier1' | 'all'>('all');
  const [unlocks, setUnlocks] = useState<{ tiers: number[]; drills: Array<{ tier: number; drillNumber: number }>; sessionCounts: Record<string, number> } | null>(null);

  const refreshUnlocks = () => {
    fetch('/api/trainer/drill/unlocks', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setUnlocks(data); })
      .catch(() => {});
  };

  // Load initial state
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const st = await api.getState();
        if (cancelled) return;
        setState(st);
        setError(null);
        refreshUnlocks();
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'UNKNOWN');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [api]);

  // Derive localized strings from current state's language preference
  const strings = useMemo(
    () => getStrings(state?.uiLanguage ?? 'zh-Hans'),
    [state?.uiLanguage],
  );

  // --------------------------------------------------------------------
  // Render states
  // --------------------------------------------------------------------

  if (loading && !state) {
    return (
      <div className="min-h-screen bg-ink-bg text-cream flex items-center justify-center">
        <span className="font-serif text-lg text-creamDim animate-pulse">
          {getStrings('zh-Hans').loading}
        </span>
      </div>
    );
  }

  if (error === 'UNAUTHORIZED') {
    return (
      <div className="min-h-screen bg-ink-bg text-cream flex items-center justify-center p-8">
        <div className="max-w-xs text-center space-y-4">
          <h2 className="font-serif text-2xl">需要登录</h2>
          <p className="text-creamDim text-sm">
            请先通过 Google 登录以保存学习进度。
          </p>
        </div>
      </div>
    );
  }

  if (error || !state) {
    return (
      <div className="min-h-screen bg-ink-bg text-cream flex items-center justify-center p-8">
        <div className="max-w-xs text-center space-y-4">
          <p className="text-rose font-serif">{strings.errorGeneric}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 border border-ink-line rounded text-cream hover:bg-cream hover:text-ink-bg transition-colors"
          >
            {strings.retry}
          </button>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------
  // Sub-view dispatch
  // --------------------------------------------------------------------

  const goHome = () => setSubView('home');

  return (
    <div className="min-h-screen bg-ink-bg text-cream font-sans antialiased">
      <TrainerHeader
        strings={strings}
        subView={subView}
        onBack={
          subView === 'home' ? onExit
          : subView === 'tier' ? () => setSubView('home')
          : subView === 'detail' ? () => setSubView('tier')
          : subView === 'drill' ? () => setSubView('tier')
          : subView === 'drill-recall' ? () => setSubView('tier')
          : subView === 'drill-pair' ? () => setSubView('tier')
          : subView === 'dashboard' ? () => setSubView('home')
          : goHome
        }
        showBack={subView !== 'home' || !!onExit}
      />

      <main className="max-w-screen-sm mx-auto px-5 pb-20 pt-4">
        {subView === 'home' && (
          <TrainerHome
            strings={strings}
            state={state}
            userName={userName}
            unlockedTiers={unlocks?.tiers}
            onStartFoundation={() => setSubView('foundation')}
            onOpenTier={(tier) => {
              setSelectedTier(tier);
              setSubView('tier');
            }}
            onOpenDashboard={() => setSubView('dashboard')}
            onStartDrill={() => { setDrillScope('all'); setSubView('drill'); }}
          />
        )}

        {subView === 'foundation' && (
          <FoundationModule
            strings={strings}
            onExitBack={goHome}
            onComplete={async () => {
              const next = await api.completeFoundation();
              setState(next);
              goHome();
              return next;
            }}
          />
        )}

        {subView === 'tier' && (
          <TrainerTierView
            strings={strings}
            tier={selectedTier}
            unlockedTier={state.currentTier}
            onSelectRhyme={(id) => {
              setSelectedRhymeId(id);
              setSubView('detail');
            }}
            onStartDrill={(drillNum) => {
              setDrillScope('tier1');
              if (drillNum === 2) {
                setSubView('drill-recall');
              } else if (drillNum === 3) {
                setSubView('drill-pair');
              } else {
                setSubView('drill');
              }
            }}
            unlockedDrills={unlocks?.drills}
            sessionCounts={unlocks?.sessionCounts}
          />
        )}

        {subView === 'detail' && selectedRhymeId && (
          <RhymeDetail
            rhymeId={selectedRhymeId}
            strings={strings}
            onBack={() => setSubView('tier')}
          />
        )}

        {subView === 'drill' && (
          <DrillSession
            strings={strings}
            scope={drillScope}
            onExit={() => setSubView('tier')}
            onSessionComplete={refreshUnlocks}
          />
        )}

        {subView === 'drill-recall' && (
          <DrillRecallSession
            strings={strings}
            scope={drillScope}
            onExit={() => setSubView('tier')}
            onSessionComplete={refreshUnlocks}
          />
        )}

        {subView === 'drill-pair' && (
          <DrillPairSession
            strings={strings}
            scope={drillScope}
            onExit={() => setSubView('tier')}
            onSessionComplete={refreshUnlocks}
          />
        )}

        {subView === 'dashboard' && (
          <TrainerPlaceholder
            title={strings.dashboardTitle}
            subtitle="106 韵部热度图"
            body="进度仪表盘开发中,即将上线。"
          />
        )}
      </main>
    </div>
  );
};

export default PingshuiTrainer;
