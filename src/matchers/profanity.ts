import type { FilterMatch } from '../types';
import {
  normalizeForProfanity,
  type ResolvedNormalization,
} from '../normalization/normalize';

const ALNUM = /[a-z0-9]/;

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export interface CompiledProfanity {
  /** normalized rule text -> canonical (raw) rule string */
  readonly canonical: Map<string, string>;
  readonly shortRe: RegExp | null;
  readonly normalRe: RegExp | null;
  readonly allowlist: ReadonlySet<string>;
  readonly normalization: ResolvedNormalization;
}

export interface CompileProfanityInput {
  rules: readonly string[];
  allowlist: readonly string[];
  shortWordLength: number;
  normalization: ResolvedNormalization;
}

export function compileProfanity(input: CompileProfanityInput): CompiledProfanity {
  const { rules, allowlist, shortWordLength, normalization } = input;

  const canonical = new Map<string, string>();
  const shortForms: string[] = [];
  const normalForms: string[] = [];

  for (const raw of rules) {
    if (typeof raw !== 'string') continue;
    const norm = normalizeForProfanity(raw, normalization).text.trim();
    if (!norm) continue;
    if (canonical.has(norm)) continue;
    canonical.set(norm, raw);
    if (norm.length <= shortWordLength) shortForms.push(norm);
    else normalForms.push(norm);
  }

  // Longest alternative first so `siktir` wins over `sik`.
  const byLenDesc = (a: string, b: string): number => b.length - a.length;
  shortForms.sort(byLenDesc);
  normalForms.sort(byLenDesc);

  const alt = (forms: string[]): string => forms.map(escapeRegExp).join('|');

  const shortRe =
    shortForms.length > 0
      ? new RegExp(`(?<![a-z0-9])(${alt(shortForms)})(?![a-z0-9])`, 'gi')
      : null;
  const normalRe =
    normalForms.length > 0
      ? new RegExp(`(?<![a-z0-9])(${alt(normalForms)})`, 'gi')
      : null;

  const normalizedAllowlist = new Set<string>();
  for (const w of allowlist) {
    if (typeof w !== 'string') continue;
    const n = normalizeForProfanity(w, normalization).text.trim();
    if (n) normalizedAllowlist.add(n);
  }

  return {
    canonical,
    shortRe,
    normalRe,
    allowlist: normalizedAllowlist,
    normalization,
  };
}

/** Expand `[start, end)` to the surrounding maximal `[a-z0-9]` run in `text`. */
function tokenBounds(text: string, start: number, end: number): [number, number] {
  let s = start;
  let e = end;
  while (s > 0 && ALNUM.test(text[s - 1]!)) s--;
  while (e < text.length && ALNUM.test(text[e]!)) e++;
  return [s, e];
}

function runMatcher(
  re: RegExp | null,
  compiled: CompiledProfanity,
  normText: string,
  map: number[],
  input: string,
  expandRight: boolean,
  out: FilterMatch[],
  seen: Set<string>,
): void {
  if (!re) return;
  re.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(normText)) !== null) {
    const ruleForm = m[1]!.toLowerCase();
    const ruleStart = m.index + m[0].length - m[1]!.length;
    const ruleEnd = ruleStart + m[1]!.length;

    const [tokStart, tokEnd] = tokenBounds(normText, ruleStart, ruleEnd);
    const token = normText.slice(tokStart, tokEnd);
    if (compiled.allowlist.has(token)) continue;

    const spanEnd = expandRight ? tokEnd : ruleEnd;
    const origStart = map[ruleStart]!;
    const origEnd = spanEnd < map.length ? map[spanEnd]! : input.length;

    const key = `${origStart}:${origEnd}`;
    if (seen.has(key)) continue;
    seen.add(key);

    out.push({
      match: true,
      type: 'profanity',
      word: compiled.canonical.get(ruleForm) ?? ruleForm,
      matchedText: input.slice(origStart, origEnd),
      index: origStart,
      endIndex: origEnd,
    });

    // Avoid infinite loops on zero-width edge cases.
    if (re.lastIndex === m.index) re.lastIndex++;
  }
}

export function matchProfanity(
  compiled: CompiledProfanity,
  input: string,
): FilterMatch[] {
  if (!input) return [];
  const { text: normText, map } = normalizeForProfanity(
    input,
    compiled.normalization,
  );
  if (!normText) return [];

  const out: FilterMatch[] = [];
  const seen = new Set<string>();
  runMatcher(compiled.shortRe, compiled, normText, map, input, false, out, seen);
  runMatcher(compiled.normalRe, compiled, normText, map, input, true, out, seen);
  out.sort((a, b) => a.index - b.index);
  return out;
}
