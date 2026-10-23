import type { FilterMatch } from '../types';

/**
 * A pragmatic set of common TLDs. When a candidate has no scheme and no `www.`
 * prefix, its final label must be in this set — this is what stops ordinary
 * prose like `something.completely` or `Node.js` from being read as a URL.
 */
const KNOWN_TLDS = new Set([
  'com', 'net', 'org', 'io', 'gg', 'me', 'co', 'dev', 'app', 'xyz', 'info',
  'biz', 'tv', 'gl', 'link', 'click', 'site', 'online', 'store', 'shop',
  'live', 'fun', 'club', 'vip', 'cc', 'ws', 'to', 'sh', 'gd', 'ly', 'be',
  'pw', 'tk', 'ml', 'ga', 'cf', 'ru', 'de', 'fr', 'uk', 'us', 'ca', 'au',
  'nl', 'it', 'es', 'br', 'in', 'jp', 'kr', 'tr', 'pl', 'se', 'no', 'fi',
  'dk', 'ch', 'at', 'cz', 'pt', 'gr', 'ro', 'hu', 'ua', 'edu', 'gov', 'mil',
  'int', 'pro', 'name', 'mobi', 'asia', 'tech', 'space', 'website', 'wtf',
  'lol', 'gay', 'moe', 'cat', 'ai', 'im', 'is', 'la', 'so', 'st', 'nu',
]);

const SCHEME = '(?:https?:\\/\\/)';
const WWW = '(?:www\\.)';
const HOST = '((?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\\.)+[a-z][a-z0-9-]{1,23})';
const PORT = '(?::\\d{2,5})?';
const PATH = "(\\/[^\\s<>\"'`\\]),]*)?";

const URL_RE = new RegExp(
  `(${SCHEME})?(${WWW})?${HOST}${PORT}${PATH}`,
  'gi',
);

const INVITE_RE = new RegExp(
  `${SCHEME}?${WWW}?(?:discord\\.gg|discord\\.me|discord(?:app)?\\.com\\/invite)\\/[a-z0-9_-]{2,}`,
  'gi',
);

/**
 * Recognize obfuscated Discord invite hosts without broadening generic URL
 * matching. Canonical bare `discord.gg` remains a plain link.
 */
const OBFUSCATED_INVITE_RE =
  /(?<![a-z0-9_-])discord(?:[ \t]*,[ \t]*|[ \t]+\.[ \t]*|[ \t]*\.[ \t]+|[ \t]*\([ \t]*\.[ \t]*\)[ \t]*|[ \t]+)gg(?:[ \t]*\/[ \t]*[a-z0-9_-]{2,})?(?![a-z0-9_-])/gi;
function lastLabel(host: string): string {
  const parts = host.toLowerCase().split('.');
  return parts[parts.length - 1] ?? '';
}

interface Span {
  start: number;
  end: number;
}

function overlaps(a: Span, spans: Span[]): boolean {
  return spans.some((s) => a.start < s.end && s.start < a.end);
}

export interface CompiledUrl {
  readonly inviteFragments: readonly string[];
  readonly linkFragments: readonly string[];
}

export function compileUrl(
  inviteFragments: readonly string[],
  linkFragments: readonly string[],
): CompiledUrl {
  const norm = (s: string): string => s.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '');
  return {
    inviteFragments: inviteFragments.map(norm).filter(Boolean),
    linkFragments: linkFragments.map(norm).filter(Boolean),
  };
}

function matchFragment(hay: string, fragment: string): boolean {
  const idx = hay.indexOf(fragment);
  if (idx === -1) return false;
  // For a bare host fragment ("discord.gg") require a code/path after it.
  if (!fragment.includes('/')) {
    const after = hay.slice(idx + fragment.length);
    return /^\/[a-z0-9_-]{2,}/.test(after);
  }
  return true;
}

export function matchUrls(compiled: CompiledUrl, input: string): FilterMatch[] {
  if (!input) return [];
  const out: FilterMatch[] = [];
  const inviteSpans: Span[] = [];

  // 1 — Discord invites (built-in patterns).
  INVITE_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = INVITE_RE.exec(input)) !== null) {
    const span = { start: m.index, end: m.index + m[0].length };
    inviteSpans.push(span);
    out.push({
      match: true,
      type: 'invite',
      word: m[0],
      matchedText: m[0],
      index: span.start,
      endIndex: span.end,
    });
    if (INVITE_RE.lastIndex === m.index) INVITE_RE.lastIndex++;
  }

  // 2 — Discord invite hosts disguised with spaces, commas, or `(.)`.
  OBFUSCATED_INVITE_RE.lastIndex = 0;
  while ((m = OBFUSCATED_INVITE_RE.exec(input)) !== null) {
    const span = { start: m.index, end: m.index + m[0].length };
    if (overlaps(span, inviteSpans)) continue;
    inviteSpans.push(span);
    out.push({
      match: true,
      type: 'invite',
      word: m[0],
      matchedText: m[0],
      index: span.start,
      endIndex: span.end,
    });
  }

  // 3 — Generic URLs, classified as invite (custom fragment) or link.
  URL_RE.lastIndex = 0;
  while ((m = URL_RE.exec(input)) !== null) {
    const [full, scheme, www, host] = m;
    if (!host) continue;
    const span = { start: m.index, end: m.index + full.length };
    if (overlaps(span, inviteSpans)) continue;

    if (!scheme && !www && !KNOWN_TLDS.has(lastLabel(host))) continue;

    const hayFull = full.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '');

    const isCustomInvite = compiled.inviteFragments.some((f) => matchFragment(hayFull, f));
    if (isCustomInvite) {
      inviteSpans.push(span);
      out.push({
        match: true,
        type: 'invite',
        word: full,
        matchedText: full,
        index: span.start,
        endIndex: span.end,
      });
      continue;
    }

    out.push({
      match: true,
      type: 'link',
      word: full,
      matchedText: full,
      index: span.start,
      endIndex: span.end,
    });
    if (URL_RE.lastIndex === m.index) URL_RE.lastIndex++;
  }

  // 4 — Explicit custom link fragments the generic matcher may not surface.
  if (compiled.linkFragments.length > 0) {
    const lower = input.toLowerCase();
    const claimed: Span[] = out.map((r) => ({ start: r.index, end: r.endIndex }));
    for (const fragment of compiled.linkFragments) {
      let from = 0;
      let idx: number;
      while ((idx = lower.indexOf(fragment, from)) !== -1) {
        const span = { start: idx, end: idx + fragment.length };
        from = span.end;
        if (overlaps(span, claimed)) continue;
        claimed.push(span);
        out.push({
          match: true,
          type: 'link',
          word: input.slice(span.start, span.end),
          matchedText: input.slice(span.start, span.end),
          index: span.start,
          endIndex: span.end,
        });
      }
    }
  }

  out.sort((a, b) => a.index - b.index);
  return out;
}
