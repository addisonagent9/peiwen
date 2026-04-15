// AUTO-GENERATED wrapper for src/data/pingshui.json. Do not edit.
import data from "./pingshui.json";

export type ToneKind = "平" | "仄" | "入";
export interface PSEntry { tone: ToneKind; group: string; rhyme: string; }
export interface PSRhymeBucket { tone: ToneKind; group: string; chars: string[]; }

export const PINGSHUI_CHAR = data.chars as unknown as Record<string, PSEntry[]>;
export const PINGSHUI_RHYME = data.rhymes as unknown as Record<string, PSRhymeBucket>;
