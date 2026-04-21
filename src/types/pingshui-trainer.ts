/**
 * 平水韵 Trainer — Type Definitions
 *
 * These types describe the curriculum data and user progress state for the
 * 韵部 learning module. They are shared between frontend (React components)
 * and backend (Express endpoints).
 *
 * Design notes:
 * - Tone is stored using pinyin romanization ('ping' / 'shang' / 'qu' / 'ru')
 *   to avoid confusion with Unicode Chinese characters in type literals.
 * - The `id` field of a Rhyme uses a stable slug form (e.g. "shangping-01-dong")
 *   so SRS records don't break if labels are edited later.
 * - SRS algorithm is SM-2 (Anki's base algorithm): easeFactor starts at 2.5,
 *   graded 0–5, intervals compound multiplicatively on success.
 */

// ---------------------------------------------------------------------------
// Tones
// ---------------------------------------------------------------------------

/** The four classical tones of 中古汉语. */
export type ClassicalTone = 'ping' | 'shang' | 'qu' | 'ru';

/** The binary 平/仄 distinction used in 格律 rules. */
export type ToneBinary = 'ping' | 'ze';

export const toneToBinary = (tone: ClassicalTone): ToneBinary =>
  tone === 'ping' ? 'ping' : 'ze';

// ---------------------------------------------------------------------------
// 韵部 (Rhyme categories)
// ---------------------------------------------------------------------------

/** Which half of 平声 a rhyme belongs to. Only meaningful when tone === 'ping'. */
export type PingshuiHalf = 'shangping' | 'xiaping' | null;

/**
 * Curriculum tier. Unlocked progressively.
 *   Tier 1 — distinctive, high-frequency rhymes. Quick wins for new learners.
 *   Tier 2 — the confusable families. The bulk of real teaching happens here.
 *   Tier 3 — rare categories and the -m endings (侵覃盐咸) that vanished in Mandarin.
 */
export type RhymeTier = 1 | 2 | 3;

/**
 * A "family" groups phonetically related rhymes that learners confuse.
 * Family IDs are kebab-case. See FAMILY_DEFINITIONS in trainer-curriculum.ts.
 */
export type RhymeFamilyId = string;

/** A famous couplet or quatrain that demonstrates this rhyme. */
export interface AnchorPoem {
  /** Author name in Chinese, e.g. "陆游". */
  author: string;
  /** Title in Chinese, e.g. "示儿". */
  title: string;
  /** Full text. Lines separated by \n. */
  text: string;
  /** Characters from this poem that rhyme in this 韵部. Used for highlighting. */
  rhymingCharacters: string[];
  /** Optional translation or contextual note in English. */
  gloss?: string;
}

/** A single 韵部 (rhyme category) in the curriculum. */
export interface Rhyme {
  /** Stable slug ID, e.g. "shangping-01-dong". Used as FK in SRS tables. */
  id: string;
  /** Ordinal within its tone half, e.g. 1 for 一东. */
  ordinal: number;
  /** Chinese label as it appears in 韵书, e.g. "一东". */
  label: string;
  /** The 韵目 character, e.g. "东". */
  rhymeCharacter: string;
  /** Classical tone. For this curriculum mostly 'ping'; other tones added in later phases. */
  tone: ClassicalTone;
  /** Which half of 平声, or null for 仄声 categories. */
  half: PingshuiHalf;
  /** Pedagogical tier (1/2/3). Controls unlock order. */
  tier: RhymeTier;
  /** Family grouping for confusable-pair teaching. */
  family: RhymeFamilyId;
  /** IDs of other rhymes commonly confused with this one. */
  confusables: string[];
  /**
   * Seed characters the learner should recognize first.
   * NOT an exhaustive list — the full lookup lives in the existing
   * pingshui data module. Typically 8–12 high-frequency chars.
   */
  seedCharacters: string[];
  /**
   * A mnemonic hook combining visual, story, and sound.
   * Kept short (one or two sentences) for mobile display.
   */
  mnemonic: string;
  /** Modern-Mandarin rime signature, e.g. "-ong", "-ang". Informational only. */
  modernRime: string;
  /** Optional anchor poem. Tier 1 should always have one. */
  anchorPoem?: AnchorPoem;
}

/** Metadata for a family grouping. */
export interface RhymeFamily {
  id: RhymeFamilyId;
  /** Human-readable name, e.g. "-ang family". */
  label: string;
  /** Rhyme IDs belonging to this family, in teaching order. */
  memberIds: string[];
  /** Short description of why these are grouped and what the trap is. */
  teachingNote: string;
}

// ---------------------------------------------------------------------------
// SRS (Spaced Repetition System)
// ---------------------------------------------------------------------------

/**
 * SM-2 grade given after a review.
 *   0 — total blackout, could not recall
 *   1 — wrong but recognized after answer shown
 *   2 — wrong but felt familiar
 *   3 — correct with serious difficulty
 *   4 — correct with some hesitation
 *   5 — correct, effortless
 */
export type ReviewGrade = 0 | 1 | 2 | 3 | 4 | 5;

/** Lifecycle state of an SRS card. */
export type CardState = 'new' | 'learning' | 'review' | 'mastered' | 'suspended';

/** Drill types the trainer supports. A card may be reviewed via any of these. */
export type DrillType =
  | 'char-to-rhyme' // "月 belongs to which 韵部?"
  | 'rhyme-to-chars' // "Name 3 characters in 四支"
  | 'rhyme-judgment' // "Do 风 and 中 rhyme?"
  | 'odd-one-out' // Pick the non-matching char from 4
  | 'tone-id' // 平 vs 仄 binary
  | 'poem-rhyme-tag'; // Tap rhyming chars in a real poem

/** Per-user SRS state for a single (user, character) pair. */
export interface SRSCard {
  id: number;
  userId: number;
  character: string;
  rhymeId: string;
  state: CardState;
  /** Current interval in days between reviews. */
  intervalDays: number;
  /** SM-2 ease factor, bounded [1.3, 2.5+]. */
  easeFactor: number;
  /** Number of successful reviews in a row. */
  repetitions: number;
  /** ISO timestamp when the card is next due. */
  dueDate: string;
  /** ISO timestamp of last review, or null if never reviewed. */
  lastReviewed: string | null;
  /** ISO timestamp when card was created. */
  createdAt: string;
}

/** A single review event, logged for analytics and debugging. */
export interface SRSReview {
  id: number;
  cardId: number;
  grade: ReviewGrade;
  drillType: DrillType;
  reviewedAt: string;
  /** Milliseconds the user took to answer. */
  responseTimeMs: number;
  previousInterval: number;
  newInterval: number;
}

/** Per-user progress aggregated at the 韵部 level. */
export interface UserRhymeProgress {
  userId: number;
  rhymeId: string;
  /** 0 = not started, 1 = introduced, 2 = learning, 3 = review, 4 = mastered. */
  masteryLevel: 0 | 1 | 2 | 3 | 4;
  /** ISO timestamp when first unlocked. Null if still locked. */
  unlockedAt: string | null;
  /** ISO timestamp when mastery (>=90% accuracy across drill types) first reached. */
  masteredAt: string | null;
  /** Rolling accuracy across last 20 reviews for this rhyme. */
  recentAccuracy: number;
}

/** Overall trainer state for a user. */
export interface UserTrainerState {
  userId: number;
  /** True once the Phase 0 foundation module has been completed. */
  foundationCompleted: boolean;
  /** Highest tier the user has access to. Starts at 1. */
  currentTier: RhymeTier;
  /** Consecutive days with at least one review. */
  streakDays: number;
  /** ISO date (YYYY-MM-DD) of last activity, for streak calculation. */
  lastActivityDate: string | null;
  /** UI language preference: 'zh-Hans' | 'zh-Hant' | 'en-bilingual'. */
  uiLanguage: 'zh-Hans' | 'zh-Hant' | 'en-bilingual';
}

// ---------------------------------------------------------------------------
// Drill payloads (what the frontend renders)
// ---------------------------------------------------------------------------

export interface CharToRhymeDrill {
  type: 'char-to-rhyme';
  character: string;
  correctRhymeId: string;
  optionRhymeIds: string[]; // 4 options including correct
}

export interface RhymeJudgmentDrill {
  type: 'rhyme-judgment';
  charA: string;
  charB: string;
  rhyme: boolean; // ground truth
}

export interface OddOneOutDrill {
  type: 'odd-one-out';
  characters: string[]; // 4 characters, 3 same rhyme + 1 different
  oddIndex: number;
}

export type Drill = CharToRhymeDrill | RhymeJudgmentDrill | OddOneOutDrill;
// (Additional drill types will extend this union in later milestones.)
