/**
 * Category of a detected match.
 *
 * - `profanity` — a blocklisted word (including bypass variants).
 * - `link`      — a generic URL / domain.
 * - `invite`    — a Discord invite link.
 */
export type MatchType = 'profanity' | 'link' | 'invite';
export type SupportedLanguage = 'tr' | 'en';

/** Toggles for the individual normalization passes used by the profanity matcher. */
export interface NormalizationOptions {
  /** Collapse characters repeated 3+ times (`saaalak` -> `salak`). Default: `true`. */
  repeatedCharacters?: boolean;
  /** Detect deliberate separators between single letters (`s.a.l.a.k`). Default: `true`. */
  separators?: boolean;
  /** Apply a small, conservative leetspeak map (`4->a`, `@->a`, `3->e`, `1->i`, `0->o`, `$->s`). Default: `true`. */
  leetspeak?: boolean;
  /** Fold a small curated set of Latin-looking Unicode homoglyphs (Cyrillic/Greek). Default: `true`. */
  homoglyphs?: boolean;
}

export interface FilterOptions {
  /** Extra profanity rules, merged with the defaults unless `useDefaults` is `false`. */
  words?: string[];
  /** Extra link host fragments (matched against the URL host, e.g. `myshop.example`). */
  links?: string[];
  /** Extra invite host fragments (e.g. `myserver.gg`). */
  invites?: string[];
  /** Words that must never be flagged as profanity even if a rule would match them. */
  allowlist?: string[];
  /** Load the built-in TR/EN profanity list and the built-in invite hosts. Default: `true`. */
  useDefaults?: boolean;
  /** Select default profanity dictionaries. Defaults to TR + EN. */
  languages?: SupportedLanguage[];
  /**
   * Profanity rules with a length `<=` this value are matched with a strict word
   * boundary on both sides (so `sik` never matches `sikayet`). Default: `3`.
   */
  shortWordLength?: number;
  /**
   * Normalization configuration. `true` (default) enables every pass, `false`
   * disables all of them (only case-folding + diacritic stripping remain), and an
   * object toggles them individually.
   */
  normalization?: NormalizationOptions | boolean;

  /** @deprecated v1 alias for {@link FilterOptions.links}. */
  ads?: string[];
  /** @deprecated v1 alias — `false` is equivalent to `normalization: false`. */
  cleanCheck?: boolean;
}

/** A single positive detection. */
export interface FilterMatch {
  match: true;
  type: MatchType;
  /** The canonical rule / value that matched (e.g. the blocklisted word, or the invite/link URL). */
  word: string;
  /** The exact substring of the original input that triggered the match. */
  matchedText: string;
  /** Start index of `matchedText` in the original input. */
  index: number;
  /** End index (exclusive) of `matchedText` in the original input. */
  endIndex: number;
}

/** Returned by {@link Filter.check} when nothing matched. */
export interface FilterNoMatch {
  match: false;
  type: null;
  word: null;
  matchedText: null;
  index: -1;
  endIndex: -1;
}

export type FilterResult = FilterMatch | FilterNoMatch;

/** Returned by {@link Filter.checkAll}. */
export interface FilterAllResult {
  match: boolean;
  /** Every match found, ordered by `index`. Empty when `match` is `false`. */
  matches: FilterMatch[];
}
