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
}
