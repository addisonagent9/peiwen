import React, { useMemo } from 'react';
import type { TrainerStrings } from '../../i18n/trainer-strings';
import type { Rhyme, SeedCharacter } from '../../types/pingshui-trainer';
import { RHYMES_PINGSHENG } from '../../data/pingshui/trainer-curriculum';
import { useAudio } from '../../hooks/useAudio';
import { AnchorDemoSection, formatJyutping } from './FoundationModule';

export interface RhymeDetailProps {
  rhymeId: string;
  strings: TrainerStrings;
  onBack: () => void;
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
}) => {
  const audio = useAudio();
  const rhyme = useMemo(
    () => RHYMES_PINGSHENG.find((r) => r.id === rhymeId),
    [rhymeId],
  );

  const mandarinAvailable = audio.available && audio.probed && audio.approvedCounts.mandarin > 0;
  const cantoneseAvailable = audio.available && audio.probed && audio.approvedCounts.cantonese > 0;

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
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {rhyme.seedCharacters.map((sc) => {
            if (typeof sc === 'string') {
              return (
                <div key={sc} className="border border-ink-line rounded-md p-2 flex flex-col items-center">
                  <span className="font-serif text-cream text-3xl leading-none pt-1">{sc}</span>
                </div>
              );
            }
            return (
              <SeedCharCard
                key={sc.char}
                sc={sc}
                audio={audio}
                mandarinAvailable={mandarinAvailable}
                cantoneseAvailable={cantoneseAvailable}


              />
            );
          })}
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
          cantoneseAudioAvailable={cantoneseAvailable}
          onPlay={async (text, voice) => { await audio.play(text, voice); }}
          playingText={audio.currentText}
        />
      ) : (
        <div className="p-6 border border-ink-line/50 rounded-md text-center">
          <p className="text-creamDim font-serif text-sm">{strings.rhymeDetailNoPoem}</p>
        </div>
      )}

    </div>
  );
};

// ---------------------------------------------------------------------------
// Seed character card
// ---------------------------------------------------------------------------

import type { UseAudioReturn } from '../../hooks/useAudio';

const SeedCharCard: React.FC<{
  sc: SeedCharacter;
  audio: UseAudioReturn;
  mandarinAvailable: boolean;
  cantoneseAvailable: boolean;
}> = ({ sc, audio, mandarinAvailable, cantoneseAvailable }) => {
  const isPlaying = audio.currentText === sc.char;
  return (
    <div className={`border border-ink-line rounded-md p-2 flex flex-col items-center gap-1 transition-colors ${
      isPlaying ? 'border-gold/60' : ''
    }`}>
      <span className="font-serif text-cream text-3xl leading-none pt-1">{sc.char}</span>
      <span className={`font-mono text-[10px] leading-tight ${isPlaying ? 'text-cream/80' : 'text-creamDim/60'}`}>
        {sc.pinyin}
      </span>
      <span className={`font-mono text-[10px] leading-tight ${isPlaying ? 'text-cream/80' : 'text-creamDim/60'}`}>
        {formatJyutping(sc.jyutping)}
      </span>
      <div className="flex gap-1 mt-1">
        {cantoneseAvailable && (
          <button
            onClick={() => audio.play(sc.char, 'cantonese')}
            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full border border-ink-line text-creamDim hover:text-cream hover:border-cream/40 transition-colors text-[10px]"
            aria-label={`Play ${sc.char} in Cantonese`}
          >
            <svg width="7" height="7" viewBox="0 0 11 11" aria-hidden>
              <path d="M3 1.5 L3 9.5 L9.5 5.5 Z" fill="currentColor" />
            </svg>
            粤
          </button>
        )}
        {sc.showMandarinAudio && mandarinAvailable && (
          <button
            onClick={() => audio.play(sc.char, 'mandarin')}
            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full border border-ink-line text-creamDim hover:text-cream hover:border-cream/40 transition-colors text-[10px]"
            aria-label={`Play ${sc.char} in Mandarin`}
          >
            <svg width="7" height="7" viewBox="0 0 11 11" aria-hidden>
              <path d="M3 1.5 L3 9.5 L9.5 5.5 Z" fill="currentColor" />
            </svg>
            普
          </button>
        )}
      </div>
    </div>
  );
};
