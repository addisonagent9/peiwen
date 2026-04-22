/**
 * FoundationModule — the 6-screen Phase 0 orientation.
 *
 * Single-flow tap-through (per M3.2 scope — no quiz yet). Each screen
 * occupies the entire content area. Progress bar + step counter at top.
 * Next/Back at the bottom. Completing the final screen calls the API to
 * mark foundation complete and returns the user to Home.
 *
 * ── Audio behavior ───────────────────────────────────────────────────────────
 * One screen-level play/pause button at the top-right. Pressing it queues
 * all body paragraphs + insight for sequential playback via useAudioQueue.
 * The currently-playing paragraph gets a gold left-border highlight.
 * Demo character buttons still work independently — tapping one stops the
 * queue but does not auto-resume it.
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

import React, { useCallback, useMemo, useState } from 'react';
import type { TrainerStrings } from '../../i18n/trainer-strings';
import type { UserTrainerState } from '../../types/pingshui-trainer';
import {
  FOUNDATION_SCREENS,
  type FoundationScreen,
  type DemoItem,
} from '../../data/pingshui/foundation-content';
import { useAudio } from '../../hooks/useAudio';
import { useAudioQueue } from '../../hooks/useAudioQueue';

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
  const queue = useAudioQueue(audio);

  const screen = FOUNDATION_SCREENS.find((s) => s.step === currentStep)!;
  const totalSteps = FOUNDATION_SCREENS.length;
  const isLastStep = currentStep === totalSteps;

  const mandarinAvailable = audio.available && audio.probed && audio.approvedCounts.mandarin > 0;
  const cantoneseAvailable = audio.available && audio.probed && audio.approvedCounts.cantonese > 0;

  const queueTexts = useMemo(() => {
    const texts = [...screen.body];
    if (screen.insight) texts.push(screen.insight);
    return texts;
  }, [screen]);

  const handleScreenPlay = useCallback(() => {
    if (queue.active) {
      queue.stop();
    } else {
      queue.start(queueTexts, 'mandarin');
    }
  }, [queue, queueTexts]);

  const handleDemoPlay = useCallback(
    async (text: string, voice?: 'mandarin' | 'cantonese') => {
      queue.stop();
      await audio.play(text, voice);
    },
    [queue, audio],
  );

  const goNext = useCallback(async () => {
    queue.stop();
    if (!isLastStep) {
      setCurrentStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      return;
    }
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
  }, [isLastStep, onComplete, queue]);

  const goBack = useCallback(() => {
    queue.stop();
    if (currentStep === 1) {
      onExitBack();
      return;
    }
    setCurrentStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [currentStep, onExitBack, queue]);

  return (
    <div className="pt-4 pb-24 space-y-8">
      {/* Progress indicator + screen-level play button */}
      <div>
        <div className="flex items-center justify-between text-xs text-creamDim mb-2">
          <span>{strings.foundationStepOf(currentStep, totalSteps)}</span>
          <div className="flex items-center gap-3">
            <span className="font-serif text-cream">{screen.subtitle}</span>
            {mandarinAvailable && (
              <button
                onClick={handleScreenPlay}
                className="w-8 h-8 rounded-full border border-ink-line flex items-center justify-center text-creamDim hover:text-cream hover:border-cream/40 transition-colors"
                aria-label={queue.active ? 'Pause narration' : 'Play narration'}
              >
                {queue.active ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
                    <rect x="3" y="2" width="2" height="8" fill="currentColor" />
                    <rect x="7" y="2" width="2" height="8" fill="currentColor" />
                  </svg>
                ) : (
                  <svg width="11" height="11" viewBox="0 0 11 11" aria-hidden>
                    <path d="M3 1.5 L3 9.5 L9.5 5.5 Z" fill="currentColor" />
                  </svg>
                )}
              </button>
            )}
          </div>
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
        audioAvailable={mandarinAvailable}
        cantoneseAudioAvailable={cantoneseAvailable}
        onPlay={handleDemoPlay}
        playingText={audio.currentText}
        queueActive={queue.active}
        queueIndex={queue.currentIndex}
        queueTexts={queueTexts}
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
  cantoneseAudioAvailable: boolean;
  onPlay: (text: string, voice?: 'mandarin' | 'cantonese') => Promise<void>;
  playingText: string | null;
  queueActive: boolean;
  queueIndex: number;
  queueTexts: string[];
}

const ScreenBody: React.FC<ScreenBodyProps> = ({
  screen,
  strings: _strings,
  audioAvailable,
  cantoneseAudioAvailable,
  onPlay,
  playingText,
  queueActive,
  queueIndex,
  queueTexts,
}) => (
  <article className="space-y-6">
    {/* Big headline character */}
    <header className="text-center pt-4">
      <span
        className="font-serif text-cream mx-auto block"
        style={{ fontSize: '64px', lineHeight: 1 }}
      >
        {screen.title}
      </span>
    </header>

    {/* Body paragraphs */}
    <div className="space-y-4">
      {screen.body.map((p, i) => {
        const isActive = queueActive && queueIndex >= 0 && queueTexts[queueIndex] === p;
        return (
          <p
            key={i}
            className={`text-cream/90 text-[15px] leading-[1.8] tracking-wide transition-all duration-300 ${
              isActive
                ? 'pl-4 border-l-2 border-gold/80'
                : ''
            }`}
          >
            {p}
          </p>
        );
      })}
    </div>

    {/* Demo items */}
    {screen.demos && screen.demos.length > 0 && (
      <section className="space-y-2 pt-2">
        {screen.demos.map((d, i) => (
          <DemoRow
            key={i}
            demo={d}
            audioAvailable={audioAvailable}
            cantoneseAudioAvailable={cantoneseAudioAvailable}
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
    {screen.insight && (() => {
      const insightIndex = queueTexts.indexOf(screen.insight!);
      const isActive = queueActive && queueIndex === insightIndex;
      return (
        <aside className={`mt-2 pl-4 border-l-2 transition-all duration-300 ${
          isActive ? 'border-gold' : 'border-gold/60'
        }`}>
          <p className="font-serif text-cream text-[15px] leading-relaxed">
            {screen.insight}
          </p>
        </aside>
      );
    })()}
  </article>
);

// ---------------------------------------------------------------------------
// Demo row with audio button
// ---------------------------------------------------------------------------

interface DemoRowProps {
  demo: DemoItem;
  audioAvailable: boolean;
  onPlay: (text: string, voice?: 'mandarin' | 'cantonese') => Promise<void>;
  isPlaying: boolean;
  cantoneseAudioAvailable: boolean;
}

const PlayButton: React.FC<{ onClick: () => void; isPlaying: boolean }> = ({ onClick, isPlaying }) => (
  <button
    onClick={onClick}
    className="shrink-0 w-9 h-9 rounded-full border border-ink-line flex items-center justify-center text-creamDim hover:text-cream hover:border-cream/40 transition-colors"
  >
    {isPlaying ? (
      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
        <rect x="3" y="2" width="2" height="8" fill="currentColor" />
        <rect x="7" y="2" width="2" height="8" fill="currentColor" />
      </svg>
    ) : (
      <svg width="11" height="11" viewBox="0 0 11 11" aria-hidden>
        <path d="M3 1.5 L3 9.5 L9.5 5.5 Z" fill="currentColor" />
      </svg>
    )}
  </button>
);

const DemoRow: React.FC<DemoRowProps> = ({
  demo,
  audioAvailable,
  onPlay,
  isPlaying,
  cantoneseAudioAvailable,
}) => (
  <div className="space-y-0">
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

      {/* Mandarin audio button */}
      {audioAvailable && (
        <PlayButton onClick={() => onPlay(demo.text, 'mandarin')} isPlaying={isPlaying} />
      )}
    </div>

    {/* Cantonese evidence row */}
    {demo.cantoneseEvidence && (
      <div className="ml-6 py-2 px-4 border-l-2 border-ink-line flex items-center gap-3">
        <span className="font-serif text-creamDim text-lg">{demo.text}</span>
        <span className="text-creamDim text-[11px]">粤语佐证</span>
        <span className="text-cream text-xs font-mono">{demo.cantoneseEvidence.jyutping}</span>
        {cantoneseAudioAvailable && (
          <PlayButton onClick={() => onPlay(demo.text, 'cantonese')} isPlaying={false} />
        )}
      </div>
    )}
  </div>
);
