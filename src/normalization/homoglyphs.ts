/**
 * A small, curated set of Latin-looking Unicode characters that are routinely
 * used to bypass filters. Deliberately conservative — only glyphs that are
 * visually indistinguishable from a basic Latin letter are included, so folding
 * them cannot turn unrelated text into a match.
 */
const HOMOGLYPHS: Record<string, string> = {
  // Cyrillic
  'а': 'a', // а
  'е': 'e', // е
  'о': 'o', // о
  'р': 'p', // р
  'с': 'c', // с
  'х': 'x', // х
  'у': 'y', // у
  'ѕ': 's', // ѕ
  'і': 'i', // і
  'ј': 'j', // ј
  'һ': 'h', // һ
  'А': 'a', // А
  'В': 'b', // В
  'Е': 'e', // Е
  'К': 'k', // К
  'М': 'm', // М
  'Н': 'h', // Н
  'О': 'o', // О
  'Р': 'p', // Р
  'С': 'c', // С
  'Т': 't', // Т
  'Х': 'x', // Х
  // Greek
  'ο': 'o', // ο
  'α': 'a', // α
  'ε': 'e', // ε
  'ρ': 'p', // ρ
  'υ': 'u', // υ
  'Α': 'a', // Α
  'Β': 'b', // Β
  'Ε': 'e', // Ε
  'Ο': 'o', // Ο
  'Ρ': 'p', // Ρ
  'Τ': 't', // Τ
  'Χ': 'x', // Χ
  // Fullwidth Latin (common in copy-paste evasion)
  'ａ': 'a',
  'ｅ': 'e',
  'ｉ': 'i',
  'ｏ': 'o',
  'ｕ': 'u',
};

export function foldHomoglyph(ch: string): string {
  return HOMOGLYPHS[ch] ?? ch;
}

export const HOMOGLYPH_KEYS = Object.keys(HOMOGLYPHS);
