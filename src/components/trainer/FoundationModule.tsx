/**
 * FoundationModule — the 7-screen Phase 0 orientation.
 *
 * Single-flow tap-through (per M3.2 scope — no quiz yet). Each screen
 * occupies the entire content area. Progress bar + step counter at top.
 * Next/Back at the bottom. Completing the final screen calls the API to
 * mark foundation complete and returns the user to Home.
 *
 * ── Audio behavior ───────────────────────────────────────────────────────────
 * Client-side audioIntent state: 'auto-on' (default) or 'auto-off'.
 * On each screen mount, if audioIntent is 'auto-on' and audio is available,
 * the queue auto-starts. Pressing pause sets intent to 'auto-off'; pressing
 * play sets it back to 'auto-on'. Demo character taps stop the queue but
 * don't change intent. Navigation stops the queue but preserves intent, so
 * the next screen auto-plays if the user never explicitly paused.
 *
 * ── Design notes ─────────────────────────────────────────────────────────────
 * Mobile-first single column. Generous whitespace — each screen breathes.
 * The headline character uses font-serif at 64px for visual anchor.
 *
 * Demo items: unified single card per character. Mandarin section on top,
 * Cantonese evidence below a thin divider. Buttons labeled [▶ 普] / [▶ 粤].
 *
 * Insight callouts use a thin gold left border + cream text.
 * Caveats use rose-tinted background + rose text.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { TrainerStrings } from '../../i18n/trainer-strings';
import type { UserTrainerState } from '../../types/pingshui-trainer';
import {
  FOUNDATION_SCREENS,
  type FoundationScreen,
  type DemoItem,
  type AnchorDemoConfig,
} from '../../data/pingshui/foundation-content';
import { RHYMES_PINGSHENG } from '../../data/pingshui/trainer-curriculum';
import type { AnchorPoem } from '../../types/pingshui-trainer';
import { useAudio } from '../../hooks/useAudio';
import { useAudioQueue } from '../../hooks/useAudioQueue';

type AudioIntent = 'auto-on' | 'auto-off';

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
  const [audioIntent, setAudioIntent] = useState<AudioIntent>('auto-on');

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

  // Auto-play on screen mount when intent is 'auto-on'
  const autoPlayFired = useRef(false);
  useEffect(() => {
    autoPlayFired.current = false;
  }, [currentStep]);

  useEffect(() => {
    if (
      audioIntent === 'auto-on' &&
      mandarinAvailable &&
      audio.probed &&
      queueTexts.length > 0 &&
      !autoPlayFired.current
    ) {
      autoPlayFired.current = true;
      queue.start(queueTexts, 'mandarin');
    }
  }, [currentStep, audio.probed, mandarinAvailable, audioIntent, queueTexts, queue]);

  const handleScreenPlay = useCallback(() => {
    if (queue.active) {
      queue.pause();
      setAudioIntent('auto-off');
    } else {
      setAudioIntent('auto-on');
      if (queue.currentIndex >= 0) {
        queue.resume();
      } else {
        queue.start(queueTexts, 'mandarin');
      }
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
                aria-label={queue.active ? 'Stop narration' : 'Play narration'}
              >
                {queue.active ? (
                  <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
                    <rect x="1.5" y="1.5" width="7" height="7" fill="currentColor" rx="0.5" />
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
      <section className="space-y-3 pt-2">
        {screen.demos.map((d, i) => (
          <DemoCard
            key={i}
            demo={d}
            audioAvailable={audioAvailable}
            cantoneseAudioAvailable={cantoneseAudioAvailable}
            onPlay={onPlay}
            playingText={playingText}
          />
        ))}
      </section>
    )}

    {/* Anchor poem demo */}
    {screen.anchorDemo && (
      <AnchorDemoSection
        config={screen.anchorDemo}
        audioAvailable={audioAvailable}
        cantoneseAudioAvailable={cantoneseAudioAvailable}
        onPlay={onPlay}
        playingText={playingText}
      />
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
// Labeled play button (▶ 普 or ▶ 粤)
// ---------------------------------------------------------------------------

const LabeledPlayButton: React.FC<{
  onClick: () => void;
  isPlaying: boolean;
  label: string;
  ariaLabel: string;
}> = ({ onClick, isPlaying, label, ariaLabel }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-ink-line text-creamDim hover:text-cream hover:border-cream/40 transition-colors"
    aria-label={ariaLabel}
  >
    {isPlaying ? (
      <svg width="9" height="9" viewBox="0 0 10 10" aria-hidden>
        <rect x="1.5" y="1.5" width="7" height="7" fill="currentColor" rx="0.5" />
      </svg>
    ) : (
      <svg width="9" height="9" viewBox="0 0 11 11" aria-hidden>
        <path d="M3 1.5 L3 9.5 L9.5 5.5 Z" fill="currentColor" />
      </svg>
    )}
    <span className="text-xs font-sans">{label}</span>
  </button>
);

// ---------------------------------------------------------------------------
// Unified demo card
// ---------------------------------------------------------------------------

interface DemoCardProps {
  demo: DemoItem;
  audioAvailable: boolean;
  cantoneseAudioAvailable: boolean;
  onPlay: (text: string, voice?: 'mandarin' | 'cantonese') => Promise<void>;
  playingText: string | null;
}

const DemoCard: React.FC<DemoCardProps> = ({
  demo,
  audioAvailable,
  cantoneseAudioAvailable,
  onPlay,
  playingText,
}) => (
  <div className="border border-ink-line rounded-md overflow-hidden">
    {/* Mandarin section */}
    <div className="py-3 px-4 flex items-start gap-4">
      {/* Character */}
      <div className="shrink-0 min-w-[56px] flex items-center justify-center pt-0.5">
        <span className="font-serif text-cream text-2xl">{demo.text}</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-3">
          <span className="text-cream text-sm">{demo.caption}</span>
        </div>
        {(demo.pinyin || demo.note) && (
          <p className="text-creamDim/80 text-xs mt-1 leading-relaxed">
            {demo.pinyin && <span className="font-mono">{demo.pinyin}</span>}
            {demo.pinyin && demo.note && <span> · </span>}
            {demo.note}
          </p>
        )}
      </div>

      {/* Mandarin play button */}
      {audioAvailable && (
        <div className="shrink-0 self-center">
          <LabeledPlayButton
            onClick={() => onPlay(demo.text, 'mandarin')}
            isPlaying={playingText === demo.text}
            label="普"
            ariaLabel={`Play ${demo.text} in Mandarin`}
          />
        </div>
      )}
    </div>

    {/* Cantonese evidence section (demo cards) */}
    {demo.cantoneseEvidence && (
      <>
        <div className="mx-4 border-t border-ink-line/30" />
        <div className="py-2.5 px-4 flex items-center gap-4">
          <div className="shrink-0 min-w-[56px]" />
          <div className="flex-1 min-w-0">
            <span className="text-creamDim text-xs">
              粤 · <span className="font-mono">{demo.cantoneseEvidence.jyutping}</span>
              {demo.cantoneseEvidence.descriptor && (
                <span> · {demo.cantoneseEvidence.descriptor}</span>
              )}
            </span>
          </div>
          {cantoneseAudioAvailable && (
            <div className="shrink-0">
              <LabeledPlayButton
                onClick={() => onPlay(demo.text, 'cantonese')}
                isPlaying={false}
                label="粤"
                ariaLabel={`Play ${demo.text} in Cantonese`}
              />
            </div>
          )}
        </div>
      </>
    )}
  </div>
);

// ---------------------------------------------------------------------------
// Anchor poem demo section
// ---------------------------------------------------------------------------

export function formatJyutping(raw: string): string {
  return raw.replace(/(\d)$/, (_, d) => {
    const sup: Record<string, string> = { '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶' };
    return sup[d] ?? d;
  });
}

export interface AnchorDemoSectionProps {
  config: AnchorDemoConfig;
  audioAvailable: boolean;
  cantoneseAudioAvailable: boolean;
  onPlay: (text: string, voice?: 'mandarin' | 'cantonese') => Promise<void>;
  playingText: string | null;
}

export const AnchorDemoSection: React.FC<AnchorDemoSectionProps> = ({
  config,
  audioAvailable,
  cantoneseAudioAvailable,
}) => {
  const rhyme = RHYMES_PINGSHENG.find((r) => r.id === config.rhymeId);
  if (!rhyme?.anchorPoem) return null;
  const poem = rhyme.anchorPoem;
  const rhymingChars = new Set(poem.rhymingCharacters.map((rc) => rc.char));

  return (
    <section className="border border-ink-line rounded-md overflow-hidden pt-3 pb-3">
      {/* Title + author */}
      <div className="px-4 pb-2">
        <span className="font-serif text-cream text-sm">
          《{poem.title}》
        </span>
        <span className="text-creamDim text-xs ml-2">{poem.author}</span>
      </div>

      {/* Poem text with highlighted rhyming characters */}
      <div className="px-4 pb-3">
        {poem.text.split('\n').map((line, li) => (
          <p key={li} className="font-serif text-cream/90 text-[15px] leading-[2] tracking-widest">
            {[...line].map((ch, ci) => (
              <span
                key={ci}
                className={rhymingChars.has(ch) ? 'text-gold font-bold' : ''}
              >
                {ch}
              </span>
            ))}
          </p>
        ))}
      </div>

      {/* Play buttons — real pause/resume via local audio element */}
      <AnchorPoemPlayer
        text={poem.text}
        title={poem.title}
        audioAvailable={audioAvailable}
        cantoneseAudioAvailable={cantoneseAudioAvailable}
      />

      {/* Jyutping callout table */}
      {config.showJyutpingCallout && (
        <>
          <div className="mx-4 border-t border-ink-line/30" />
          <div className="px-4 pt-3">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-creamDim">
                  <th className="text-left font-normal pb-1 w-12">字</th>
                  <th className="text-left font-normal pb-1">粤语</th>
                  <th className="text-left font-normal pb-1">普通话</th>
                </tr>
              </thead>
              <tbody>
                {poem.rhymingCharacters.map((rc) => (
                  <tr key={rc.char}>
                    <td className="font-serif text-cream text-sm py-0.5">{rc.char}</td>
                    <td className="font-mono text-cream/80 py-0.5">{formatJyutping(rc.jyutping)}</td>
                    <td className="font-mono text-creamDim py-0.5">{rc.pinyin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {config.calloutMessage && (
              <p className="text-creamDim text-xs mt-2 leading-relaxed">
                {config.calloutMessage}
              </p>
            )}
          </div>
        </>
      )}
    </section>
  );
};

// ---------------------------------------------------------------------------
// Anchor poem player — true pause/resume via local HTMLAudioElement
// ---------------------------------------------------------------------------

const AnchorPoemPlayer: React.FC<{
  text: string;
  title: string;
  audioAvailable: boolean;
  cantoneseAudioAvailable: boolean;
}> = ({ text, title, audioAvailable, cantoneseAudioAvailable }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [status, setStatus] = useState<'idle' | 'playing' | 'paused'>('idle');
  const [activeVoice, setActiveVoice] = useState<'mandarin' | 'cantonese' | null>(null);

  const handleClick = useCallback((voice: 'mandarin' | 'cantonese') => {
    let el = audioRef.current;

    if (activeVoice === voice && el) {
      if (status === 'playing') {
        el.pause();
        return;
      }
      if (status === 'paused') {
        el.play().catch(() => setStatus('idle'));
        return;
      }
    }

    if (el) {
      el.pause();
      el.removeAttribute('src');
      el.load();
    } else {
      el = new Audio();
      audioRef.current = el;
    }

    el.onended = () => { setStatus('idle'); setActiveVoice(null); };
    el.onpause = () => { if (!el!.ended) setStatus('paused'); };
    el.onplay = () => setStatus('playing');
    el.onerror = () => { setStatus('idle'); setActiveVoice(null); };

    el.src = `/api/audio/${encodeURIComponent(text)}?voice=${voice}`;
    setActiveVoice(voice);
    el.play().catch(() => { setStatus('idle'); setActiveVoice(null); });
  }, [text, status, activeVoice]);

  useEffect(() => {
    return () => {
      const el = audioRef.current;
      if (el) { el.pause(); el.src = ''; }
    };
  }, []);

  const renderButton = (voice: 'mandarin' | 'cantonese', label: string) => {
    const isThis = activeVoice === voice;
    const playing = isThis && status === 'playing';
    const paused = isThis && status === 'paused';
    return (
      <button
        onClick={() => handleClick(voice)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-ink-line text-creamDim hover:text-cream hover:border-cream/40 transition-colors"
        aria-label={`${playing ? 'Pause' : 'Play'} ${title} in ${voice === 'mandarin' ? 'Mandarin' : 'Cantonese'}`}
      >
        {playing ? (
          <svg width="9" height="9" viewBox="0 0 12 12" aria-hidden>
            <rect x="3" y="2" width="2" height="8" fill="currentColor" />
            <rect x="7" y="2" width="2" height="8" fill="currentColor" />
          </svg>
        ) : (
          <svg width="9" height="9" viewBox="0 0 11 11" aria-hidden>
            <path d="M3 1.5 L3 9.5 L9.5 5.5 Z" fill="currentColor" />
          </svg>
        )}
        <span className="text-xs font-sans">{label}</span>
        {paused && <span className="text-[10px] text-creamDim/60">⏸</span>}
      </button>
    );
  };

  return (
    <div className="px-4 pb-2 flex items-center gap-3">
      {audioAvailable && renderButton('mandarin', '普通话')}
      {cantoneseAudioAvailable && renderButton('cantonese', '粤语')}
    </div>
  );
};
