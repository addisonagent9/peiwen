/**
 * FoundationModule — the 6-screen Phase 0 orientation.
 *
 * Single-flow tap-through (per M3.2 scope — no quiz yet). Each screen
 * occupies the entire content area. Progress bar + step counter at top.
 * Next/Back at the bottom. Completing the final screen calls the API to
 * mark foundation complete and returns the user to Home.
 *
 * ── Audio behavior ───────────────────────────────────────────────────────────
 * Each demo item shows a round play button. If `useAudio.available === false`
 * after the initial probe, the buttons render disabled with a subtle
 * "audio unavailable" tooltip. The rest of the content is fully usable.
 *
 * ── Design notes ─────────────────────────────────────────────────────────────
 * Mobile-first single column. Generous whitespace — each screen breathes.
 * The headline character uses font-serif at 64px for visual anchor. Demo
 * items stack vertically, never grid.
 *
 * Insight callouts use a thin gold left border + cream text — the one place
 * gold appears in the body content.
 * Caveats use rose-tinted background + rose text — reserved for honest
 * pedagogical limits ("this feature not yet available").
 */

import React, { useCallback, useState } from 'react';
import type { TrainerStrings } from '../../i18n/trainer-strings';
import type { UserTrainerState } from '../../types/pingshui-trainer';
import {
  FOUNDATION_SCREENS,
  type FoundationScreen,
  type DemoItem,
} from '../../data/pingshui/foundation-content';
import { useAudio } from '../../hooks/useAudio';

export interface FoundationModuleProps {
  strings: TrainerStrings;
  onComplete: () => Promise<UserTrainerState> | void;
  onExitBack: () => void;
}

export const FoundationModule: React.FC<FoundationModuleProps> = ({
  strings,
  onComplete,
  onExitBack,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completing, setCompleting] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);

  const audio = useAudio();

  const screen = FOUNDATION_SCREENS.find((s) => s.step === currentStep)!;
  const totalSteps = FOUNDATION_SCREENS.length;
  const isLastStep = currentStep === totalSteps;

  const goNext = useCallback(async () => {
    if (!isLastStep) {
      setCurrentStep((s) => s + 1);
      // Reset scroll on step change. Users expect each screen to open at top.
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      return;
    }
    // Last step → mark foundation complete
    try {
      setCompleting(true);
      setCompleteError(null);
      await onComplete();
    } catch (e) {
      setCompleteError(
        e instanceof Error ? e.message : 'UNKNOWN',
      );
    } finally {
      setCompleting(false);
    }
  }, [isLastStep, onComplete]);

  const goBack = useCallback(() => {
    if (currentStep === 1) {
      onExitBack();
      return;
    }
    setCurrentStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [currentStep, onExitBack]);

  return (
    <div className="pt-4 pb-24 space-y-8">
      {/* Progress indicator */}
      <div>
        <div className="flex items-center justify-between text-xs text-creamDim mb-2">
          <span>{strings.foundationStepOf(currentStep, totalSteps)}</span>
          <span className="font-serif text-cream">{screen.subtitle}</span>
        </div>
        <div className="h-px bg-ink-line relative">
          <div
            className="absolute left-0 top-0 h-px bg-gold transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <ScreenBody
        screen={screen}
        strings={strings}
        audioAvailable={audio.available && audio.probed}
        onPlay={audio.play}
        playingText={audio.currentText}
      />

      {completeError && (
        <div className="p-3 border border-rose/40 rounded text-rose text-sm">
          {strings.errorGeneric}
        </div>
      )}

      {/* Nav */}
      <div className="flex items-center gap-3 pt-4">
        <button
          onClick={goBack}
          className="flex-shrink-0 px-4 py-3 border border-ink-line rounded text-creamDim hover:text-cream hover:border-cream/40 transition-colors"
        >
          {strings.previous}
        </button>
        <button
          onClick={goNext}
          disabled={completing}
          className="flex-1 py-3 bg-gold/10 border border-gold/40 text-gold font-serif tracking-wider rounded hover:bg-gold/20 transition-colors disabled:opacity-50"
        >
          {completing
            ? strings.loading
            : isLastStep
            ? strings.markComplete
            : strings.next}
        </button>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Screen body
// ---------------------------------------------------------------------------

interface ScreenBodyProps {
  screen: FoundationScreen;
  strings: TrainerStrings;
  audioAvailable: boolean;
  onPlay: (text: string) => Promise<void>;
  playingText: string | null;
}

const ScreenBody: React.FC<ScreenBodyProps> = ({
  screen,
  strings: _strings,
  audioAvailable,
  onPlay,
  playingText,
}) => (
  <article className="space-y-6">
    {/* Big headline character */}
    <header className="text-center pt-4">
      {audioAvailable ? (
        <button
          onClick={() => onPlay(screen.title)}
          className="font-serif text-cream mx-auto block transition-opacity"
          style={{ fontSize: '64px', lineHeight: 1 }}
          aria-label={`Play ${screen.title}`}
        >
          {screen.title}
        </button>
      ) : (
        <span
          className="font-serif text-cream mx-auto block"
          style={{ fontSize: '64px', lineHeight: 1 }}
        >
          {screen.title}
        </span>
      )}
    </header>

    {/* Body paragraphs */}
    <div className="space-y-4">
      {screen.body.map((p, i) => (
        <p
          key={i}
          className="text-cream/90 text-[15px] leading-[1.8] tracking-wide"
        >
          {p}
        </p>
      ))}
    </div>

    {/* Demo items */}
    {screen.demos && screen.demos.length > 0 && (
      <section className="space-y-2 pt-2">
        {screen.demos.map((d, i) => (
          <DemoRow
            key={i}
            demo={d}
            audioAvailable={audioAvailable}
            onPlay={onPlay}
            isPlaying={playingText === d.text}
          />
        ))}
      </section>
    )}

    {/* Caveat (rose-tinted warning) */}
    {screen.caveat && (
      <aside className="mt-2 p-3 border border-rose/30 bg-rose/5 rounded">
        <p className="text-rose text-xs leading-relaxed">{screen.caveat}</p>
      </aside>
    )}

    {/* Insight callout */}
    {screen.insight && (
      <aside className="mt-2 pl-4 border-l-2 border-gold/60">
        <p className="font-serif text-cream text-[15px] leading-relaxed">
          {screen.insight}
        </p>
      </aside>
    )}
  </article>
);

// ---------------------------------------------------------------------------
// Demo row with audio button
// ---------------------------------------------------------------------------

interface DemoRowProps {
  demo: DemoItem;
  audioAvailable: boolean;
  onPlay: (text: string) => Promise<void>;
  isPlaying: boolean;
}

const DemoRow: React.FC<DemoRowProps> = ({
  demo,
  audioAvailable,
  onPlay,
  isPlaying,
}) => (
  <div className="py-3 px-4 border border-ink-line rounded-md flex items-center gap-4">
    {/* The character/phrase */}
    <div className="shrink-0 min-w-[56px] flex items-center justify-center">
      <span className="font-serif text-cream text-2xl">{demo.text}</span>
    </div>

    {/* Metadata */}
    <div className="flex-1 min-w-0">
      <div className="flex items-baseline gap-3">
        <span className="text-cream text-sm">{demo.caption}</span>
        {demo.pinyin && (
          <span className="text-creamDim text-xs font-mono">{demo.pinyin}</span>
        )}
      </div>
      {demo.note && (
        <p className="text-creamDim/80 text-xs mt-1 leading-relaxed">
          {demo.note}
        </p>
      )}
    </div>

    {/* Audio button — hidden entirely when audio unavailable */}
    {audioAvailable && <button
      onClick={() => onPlay(demo.text)}
      aria-label={`Play ${demo.text}`}
      className="shrink-0 w-9 h-9 rounded-full border border-ink-line flex items-center justify-center text-creamDim hover:text-cream hover:border-cream/40 transition-colors"
    >
      {isPlaying ? (
        // Pause / playing state — two bars
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
          <rect x="3" y="2" width="2" height="8" fill="currentColor" />
          <rect x="7" y="2" width="2" height="8" fill="currentColor" />
        </svg>
      ) : (
        // Play triangle
        <svg width="11" height="11" viewBox="0 0 11 11" aria-hidden>
          <path d="M3 1.5 L3 9.5 L9.5 5.5 Z" fill="currentColor" />
        </svg>
      )}
    </button>}
  </div>
);
