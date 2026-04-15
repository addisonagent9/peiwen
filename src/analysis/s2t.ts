import { Converter } from "opencc-js";

const s2t = Converter({ from: "cn", to: "tw" });
const t2s = Converter({ from: "tw", to: "cn" });

export function toTraditional(char: string): string {
  if (!char) return char;
  return s2t(char);
}

export function toSimplified(char: string): string {
  if (!char) return char;
  return t2s(char);
}
