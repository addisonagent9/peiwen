import React, { useMemo } from 'react';
import type { TrainerStrings } from '../../i18n/trainer-strings';
import type { Rhyme } from '../../types/pingshui-trainer';
import { RHYMES_PINGSHENG } from '../../data/pingshui/trainer-curriculum';
import { useAudio } from '../../hooks/useAudio';
import { AnchorDemoSection } from './FoundationModule';

export interface RhymeDetailProps {
  rhymeId: string;
  strings: TrainerStrings;
  onBack: () => void;
  onStartDrill: (rhymeId: string) => void;
}

function buildCalloutMessage(rhyme: Rhyme): string | undefined {
  if (!rhyme.anchorPoem) return undefined;
  const chars = rhyme.anchorPoem.rhymingCharacters;
  if (chars.length < 2) return undefined;

  const tails = chars.map((rc) => {
    const m = rc.jyutping.match(/[a-z]+/);
    return m ? m[0].slice(-3) : '';
  });

  const allSame = tails.every((t) => t === tails[0]);
  const charList = chars.map((rc) => rc.char).join('·');

  if (allSame && tails[0]) {
    return `粤语里韵脚字 ${charList} 都押 -${tails[0]} 韵,家族关系清晰;普通话已模糊。`;
  }
  return '粤语里韵脚字的押韵关系比普通话更明显 — 听听看,对照下面的粤语拼音。';
}

export const RhymeDetail: React.FC<RhymeDetailProps> = ({
  rhymeId,
  strings,
  onBack,
  onStartDrill,
}) => {
  const audio = useAudio();
  const rhyme = useMemo(
    () => RHYMES_PINGSHENG.find((r) => r.id === rhymeId),
    [rhymeId],
  );

  const mandarinAvailable = audio.available && audio.probed && audio.approvedCounts.mandarin > 0;

  if (!rhyme) {
    return (
      <div className="pt-6 space-y-4">
        <p className="text-rose font-serif">{strings.errorGeneric}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 border border-ink-line rounded text-creamDim hover:text-cream transition-colors"
        >
          {strings.backToHome}
        </button>
      </div>
    );
  }

  const calloutMessage = buildCalloutMessage(rhyme);

  return (
    <div className="pt-6 pb-24 space-y-8">
      {/* Header */}
      <header>
        <button
          onClick={onBack}
          className="text-creamDim text-xs hover:text-cream transition-colors mb-4 flex items-center gap-1"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
            <path d="M6 2 L3 5 L6 8" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {strings.tier1Title}
        </button>
        <h2 className="font-serif text-cream tracking-wide" style={{ fontSize: '48px', lineHeight: 1.1 }}>
          {rhyme.label}
        </h2>
        <p className="text-creamDim text-sm mt-2 font-mono tracking-wide">
          {rhyme.modernRime}
        </p>
      </header>

      {/* Mnemonic */}
      {rhyme.mnemonic && (
        <aside className="pl-4 border-l-2 border-gold/60">
          <p className="text-creamDim text-xs mb-1">{strings.rhymeDetailMnemonic}</p>
          <p className="text-cream/90 text-[15px] leading-[1.8]">{rhyme.mnemonic}</p>
        </aside>
      )}

      {/* Seed characters */}
      <section>
        <p className="text-creamDim text-xs mb-3">{strings.rhymeDetailSeedChars}</p>
        <div className="flex flex-wrap gap-2">
          {rhyme.seedCharacters.map((ch) => (
            <button
              key={ch}
              onClick={mandarinAvailable ? () => audio.play(ch, 'mandarin') : undefined}
              className={`w-14 h-14 flex items-center justify-center border border-ink-line rounded font-serif text-2xl transition-colors ${
                mandarinAvailable
                  ? 'text-cream hover:border-gold/50 hover:text-gold cursor-pointer'
                  : 'text-cream/70 cursor-default'
              } ${audio.currentText === ch ? 'border-gold text-gold' : ''}`}
            >
              {ch}
            </button>
          ))}
        </div>
      </section>

      {/* Anchor poem */}
      {rhyme.anchorPoem ? (
        <AnchorDemoSection
          config={{
            rhymeId,
            showJyutpingCallout: true,
            calloutMessage,
          }}
          audioAvailable={mandarinAvailable}
          cantoneseAudioAvailable={audio.available && audio.probed && audio.approvedCounts.cantonese > 0}
          onPlay={async (text, voice) => { await audio.play(text, voice); }}
          playingText={audio.currentText}
        />
      ) : (
        <div className="p-6 border border-ink-line/50 rounded-md text-center">
          <p className="text-creamDim font-serif text-sm">{strings.rhymeDetailNoPoem}</p>
        </div>
      )}

      {/* Start drill CTA */}
      <div className="pt-4">
        <button
          onClick={() => onStartDrill(rhymeId)}
          className="w-full py-3 bg-gold/10 border border-gold/40 text-gold font-serif tracking-wider rounded hover:bg-gold/20 transition-colors"
        >
          {strings.rhymeDetailStartDrill} →
        </button>
      </div>
    </div>
  );
};
