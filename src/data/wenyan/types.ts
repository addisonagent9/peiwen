/**
 * 文言教材 — content + API types.
 *
 * Bundled-content types (read from src/data/wenyan/poems.json) and
 * server-side row shapes returned by /api/wenyan/* endpoints.
 */

export interface WenyanVocab {
  word: string;
  pinyin: string;
  senseSlug: string;
  modernMeaning: string;
  ancientMeaning: string;
  notes?: string;
}

export interface WenyanPoem {
  id: string;
  title: string;
  author: string;
  dynasty: string;
  fullText: string;
  translation: string;
  background: string[];
  vocabulary: WenyanVocab[];
}

export interface WenyanContent {
  $schema_version: number;
  displayOrder: string[];
  poems: WenyanPoem[];
}

export interface WenyanProgressEntry {
  poem_id: string;
  completed_at: string;
}

export interface WenyanLibraryEntry {
  entry_id: number;
  word: string;
  sense_slug: string;
  pinyin: string | null;
  modern_meaning: string;
  ancient_meaning: string;
  notes: string | null;
  first_seen_poem_id: string;
  learned_at: string;
  mastery: number;
}

export interface WenyanCompleteResponse {
  ok: true;
  completed_at: string;
  vocab_added: number;
  pairingDue: boolean;
}

// ─── Pairing exercise types (#26 Stage C) ─────────────────────────────────

export interface PairingWord {
  entry_id: number;
  word: string;
  pinyin: string | null;
}

export interface PairingMeaning {
  entry_id: number;
  text: string;
  sense_slug: string;
  // Client-side augmentation: 2-char modern pairing hint joined via sense_slug
  // from src/data/wenyan/pairing-hints.json. null when no match in sidecar
  // (defensive; current 125-entry sidecar covers full corpus).
  pairingHint?: string | null;
}

export interface PairingQueue {
  pairingId: string;
  words: PairingWord[];
  meanings: PairingMeaning[]; // shuffled relative to words[]
}

export interface PairingSubmitPair {
  word_entry_id: number;
  meaning_entry_id: number;
}

export interface PairingSubmitRequest {
  pairingId: string;
  pairs: PairingSubmitPair[];
}

export interface PairingResultRow {
  word_entry_id: number;
  user_meaning_entry_id: number;
  correct: boolean;
  actual_meaning_entry_id: number;
}

export interface PairingSubmitResponse {
  correct_count: number;
  total_count: number;
  results: PairingResultRow[];
}
