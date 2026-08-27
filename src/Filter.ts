import type {
  FilterOptions,
  FilterResult,
  FilterAllResult,
  FilterMatch,
  NormalizationOptions,
} from './types';
import {
  ALL_NORMALIZATION,
  NO_NORMALIZATION,
  type ResolvedNormalization,
} from './normalization/normalize';
import {
  compileProfanity,
  matchProfanity,
  type CompiledProfanity,
} from './matchers/profanity';
import { compileUrl, matchUrls, type CompiledUrl } from './matchers/url';
import {
  DEFAULT_WORDS,
  DEFAULT_ALLOWLIST,
  DEFAULT_INVITE_HOSTS,
} from './defaults';

const NO_MATCH: FilterResult = {
  match: false,
  type: null,
  word: null,
  matchedText: null,
  index: -1,
  endIndex: -1,
};

function resolveNormalization(
  opt: NormalizationOptions | boolean | undefined,
  cleanCheck: boolean | undefined,
): ResolvedNormalization {
  if (cleanCheck === false) return { ...NO_NORMALIZATION };
  if (opt === false) return { ...NO_NORMALIZATION };
  if (opt === undefined || opt === true) return { ...ALL_NORMALIZATION };
  return {
    repeatedCharacters: opt.repeatedCharacters ?? true,
    separators: opt.separators ?? true,
    leetspeak: opt.leetspeak ?? true,
    homoglyphs: opt.homoglyphs ?? true,
  };
}

function uniquePush(list: string[], value: string): boolean {
  const v = value.trim();
  if (!v || list.includes(v)) return false;
  list.push(v);
  return true;
}

export class Filter {
  #words: string[];
  #links: string[];
  #invites: string[];
  #allowlist: string[];

  readonly #shortWordLength: number;
  readonly #normalization: ResolvedNormalization;

  #profanity: CompiledProfanity;
  #url: CompiledUrl;

  constructor(options: FilterOptions = {}) {
    const useDefaults = options.useDefaults !== false;

    this.#shortWordLength = options.shortWordLength ?? 3;
    this.#normalization = resolveNormalization(
      options.normalization,
      options.cleanCheck,
    );

    const customLinks = [...(options.links ?? []), ...(options.ads ?? [])];

    this.#words = [
      ...(useDefaults ? DEFAULT_WORDS : []),
      ...(options.words ?? []),
    ].map((w) => w.trim()).filter(Boolean);
    this.#links = customLinks.map((w) => w.trim()).filter(Boolean);
    this.#invites = [
      ...(useDefaults ? DEFAULT_INVITE_HOSTS : []),
      ...(options.invites ?? []),
    ].map((w) => w.trim()).filter(Boolean);
    this.#allowlist = [
      ...(useDefaults ? DEFAULT_ALLOWLIST : []),
      ...(options.allowlist ?? []),
    ].map((w) => w.trim()).filter(Boolean);

    this.#profanity = this.#compileProfanity();
    this.#url = this.#compileUrl();
  }

  #compileProfanity(): CompiledProfanity {
    return compileProfanity({
      rules: this.#words,
      allowlist: this.#allowlist,
      shortWordLength: this.#shortWordLength,
      normalization: this.#normalization,
    });
  }

  #compileUrl(): CompiledUrl {
    return compileUrl(this.#invites, this.#links);
  }

  // ---------------------------------------------------------------------------
  // Blocklist accessors
  // ---------------------------------------------------------------------------

  /** Live profanity rule list. Prefer the mutation methods over editing directly. */
  get words(): string[] {
    return this.#words;
  }

  /** Live custom link-fragment list. */
  get links(): string[] {
    return this.#links;
  }

  /** Live invite host-fragment list. */
  get invites(): string[] {
    return this.#invites;
  }

  /** @deprecated v1 alias for {@link Filter.links}. */
  get ads(): string[] {
    return this.#links;
  }

  // ---------------------------------------------------------------------------
  // Mutation
  // ---------------------------------------------------------------------------

  addWord(word: string): void {
    if (uniquePush(this.#words, word)) this.#profanity = this.#compileProfanity();
  }

  removeWord(word: string): void {
    const target = word.trim();
    const next = this.#words.filter((w) => w !== target);
    if (next.length !== this.#words.length) {
      this.#words = next;
      this.#profanity = this.#compileProfanity();
    }
  }

  hasWord(word: string): boolean {
    return this.#words.includes(word.trim());
  }

  clearWords(): void {
    this.#words = [];
    this.#profanity = this.#compileProfanity();
  }

  addLink(fragment: string): void {
    if (uniquePush(this.#links, fragment)) this.#url = this.#compileUrl();
  }

  removeLink(fragment: string): void {
    const target = fragment.trim();
    const next = this.#links.filter((w) => w !== target);
    if (next.length !== this.#links.length) {
      this.#links = next;
      this.#url = this.#compileUrl();
    }
  }

  clearLinks(): void {
    this.#links = [];
    this.#url = this.#compileUrl();
  }

  addInvite(fragment: string): void {
    if (uniquePush(this.#invites, fragment)) this.#url = this.#compileUrl();
  }

  removeInvite(fragment: string): void {
    const target = fragment.trim();
    const next = this.#invites.filter((w) => w !== target);
    if (next.length !== this.#invites.length) {
      this.#invites = next;
      this.#url = this.#compileUrl();
    }
  }

  clearInvites(): void {
    this.#invites = [];
    this.#url = this.#compileUrl();
  }

  addAllow(word: string): void {
    if (uniquePush(this.#allowlist, word)) this.#profanity = this.#compileProfanity();
  }

  // ---------------------------------------------------------------------------
  // Checking
  // ---------------------------------------------------------------------------

  /**
   * Return the single most relevant match, or a no-match result.
   * Category priority: `profanity` > `invite` > `link`; ties broken by position.
   */
  check(content: string): FilterResult {
    if (!content || typeof content !== 'string') return NO_MATCH;

    const profanity = matchProfanity(this.#profanity, content);
    if (profanity.length > 0) return profanity[0]!;

    const urls = matchUrls(this.#url, content);
    if (urls.length > 0) {
      const invite = urls.find((u: FilterMatch) => u.type === 'invite');
      return invite ?? urls[0]!;
    }

    return NO_MATCH;
  }

  /** Return every match found in `content`, ordered by position. */
  checkAll(content: string): FilterAllResult {
    if (!content || typeof content !== 'string') {
      return { match: false, matches: [] };
    }
    const matches: FilterMatch[] = [
      ...matchProfanity(this.#profanity, content),
      ...matchUrls(this.#url, content),
    ].sort((a, b) => a.index - b.index || a.endIndex - b.endIndex);

    return { match: matches.length > 0, matches };
  }
}
