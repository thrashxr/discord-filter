import { foldHomoglyph } from './homoglyphs';
import { foldLeet } from './leetspeak';
import { compactSeparators } from './separators';

/** Fully-resolved normalization toggles (no `undefined`). */
export interface ResolvedNormalization {
  repeatedCharacters: boolean;
  separators: boolean;
  leetspeak: boolean;
  homoglyphs: boolean;
}

export const ALL_NORMALIZATION: ResolvedNormalization = {
  repeatedCharacters: true,
  separators: true,
  leetspeak: true,
  homoglyphs: true,
};

export const NO_NORMALIZATION: ResolvedNormalization = {
  repeatedCharacters: false,
  separators: false,
  leetspeak: false,
  homoglyphs: false,
};

/**
 * A normalized string together with an index map back to the original input.
 * `map[i]` is the index in the original string that normalized character `i`
 * originated from.
 */
export interface Normalized {
  text: string;
  map: number[];
}

/**
 * Turkish-aware folding.
 *
 * `ı`/`İ`/`I` and `ş` are folded to their ASCII form because people routinely
 * type them that way ("amcik", "yavsak"). `ç`, `ğ`, `ö`, `ü` are deliberately
 * *preserved* (mapped to themselves so the generic NFD pass cannot strip their
 * diacritic): folding them creates collisions such as `piç` -> `pic` and
 * `göt` -> `got`.
 */
const TR_FOLD: Record<string, string> = {
  'ı': 'i',
  'İ': 'i',
  'I': 'i',
  'ş': 's',
  'Ş': 's',
  'ç': 'ç',
  'Ç': 'ç',
  'ğ': 'ğ',
  'Ğ': 'ğ',
  'ö': 'ö',
  'Ö': 'ö',
  'ü': 'ü',
  'Ü': 'ü',
};

/** Combining diacritical marks (U+0300–U+036F). */
const COMBINING_MARKS = new RegExp('[\\u0300-\\u036f]', 'g');

/** Case-fold + Turkish-aware fold + diacritic strip for a single source char. */
function foldChar(ch: string): string {
  const tr = TR_FOLD[ch];
  if (tr !== undefined) return tr;
  return ch.toLowerCase().normalize('NFD').replace(COMBINING_MARKS, '');
}

/**
 * Normalize input for the profanity matcher, tracking the origin index of every
 * resulting character so matches can be mapped back to the original text.
 */
export function normalizeForProfanity(
  input: string,
  opts: ResolvedNormalization,
): Normalized {
  const chars: string[] = [];
  const map: number[] = [];

  // Step 1 — per-character folding. Iterate by code point.
  let i = 0;
  for (const cp of input) {
    let piece = cp;
    if (opts.homoglyphs) piece = foldHomoglyph(piece);
    if (opts.leetspeak) piece = foldLeet(piece);
    const folded = foldChar(piece);
    for (const c of folded) {
      chars.push(c);
      map.push(i);
    }
    i += cp.length;
  }

  let state = { chars, map };

  // Step 2 — separator evasion (`s.a.l.a.k`).
  if (opts.separators) state = compactSeparators(state.chars, state.map);

  // Repeated characters (`saaalak`) are handled by the matcher via `collapseRuns`
  // on derived variants, so the base text keeps every character.

  return { text: state.chars.join(''), map: state.map };
}

/**
 * Collapse every run of `minRun` or more identical characters down to a single
 * character, carrying the index map. Runs shorter than `minRun` are left intact
 * (so `minRun: 3` preserves legit doubles like `book`).
 */
export function collapseRuns(
  chars: string[],
  map: number[],
  minRun: number,
): { chars: string[]; map: number[] } {
  const outChars: string[] = [];
  const outMap: number[] = [];

  let runStart = 0;
  while (runStart < chars.length) {
    let runEnd = runStart + 1;
    while (runEnd < chars.length && chars[runEnd] === chars[runStart]) runEnd++;

    const runLength = runEnd - runStart;
    const keep = runLength >= minRun ? 1 : runLength;
    for (let k = 0; k < keep; k++) {
      outChars.push(chars[runStart]!);
      outMap.push(map[runStart + k]!);
    }
    runStart = runEnd;
  }

  return { chars: outChars, map: outMap };
}
