import { describe, it, expect } from 'vitest';
import { Filter, DEFAULT_WORDS } from '../src/index';

describe('word list mutation', () => {
  it('addWord / removeWord / hasWord recompile the matcher', () => {
    const f = new Filter({ useDefaults: false });
    expect(f.check('kentang').match).toBe(false);

    f.addWord('kentang');
    expect(f.hasWord('kentang')).toBe(true);
    expect(f.check('kentang goreng').match).toBe(true);

    f.removeWord('kentang');
    expect(f.hasWord('kentang')).toBe(false);
    expect(f.check('kentang goreng').match).toBe(false);
  });

  it('addWord de-duplicates', () => {
    const f = new Filter({ useDefaults: false, words: ['x'] });
    f.addWord('x');
    expect(f.words.filter((w) => w === 'x')).toHaveLength(1);
  });

  it('clearWords empties the list', () => {
    const f = new Filter();
    f.clearWords();
    expect(f.check('fuck').match).toBe(false);
  });

  it('new words go through the full normalization pipeline', () => {
    const f = new Filter({ useDefaults: false });
    f.addWord('kentang');
    expect(f.check('k.e.n.t.a.n.g').match).toBe(true);
    expect(f.check('keeentaaang').match).toBe(true);
  });
});

describe('link / invite mutation', () => {
  it('addLink / removeLink', () => {
    const f = new Filter();
    f.addLink('sketchy-fragment');
    expect(f.check('visit sketchy-fragment here').type).toBe('link');
    f.removeLink('sketchy-fragment');
    expect(f.check('visit sketchy-fragment here').match).toBe(false);
  });

  it('addInvite / removeInvite', () => {
    const f = new Filter();
    f.addInvite('guild.gg');
    expect(f.check('guild.gg/abc').type).toBe('invite');
    f.removeInvite('guild.gg');
    expect(f.check('guild.gg/abc').type).toBe('link');
  });
});

describe('checkAll', () => {
  it('returns every match ordered by index', () => {
    const f = new Filter();
    const res = f.checkAll('salak then http://example.com then discord.gg/xyz');
    expect(res.match).toBe(true);
    expect(res.matches.map((m) => m.type)).toEqual(['profanity', 'link', 'invite']);
    const indices = res.matches.map((m) => m.index);
    expect([...indices]).toEqual([...indices].sort((a, b) => a - b));
  });

  it('returns an empty list for clean input', () => {
    expect(new Filter().checkAll('hello there friend')).toEqual({ match: false, matches: [] });
  });
});

describe('configuration', () => {
  it('useDefaults: false drops the built-in lists', () => {
    const f = new Filter({ useDefaults: false });
    expect(f.check('fuck').match).toBe(false);
  });

  it('custom words merge with defaults', () => {
    const f = new Filter({ words: ['kentang'] });
    expect(f.check('kentang').match).toBe(true);
    expect(f.check('fuck').match).toBe(true);
  });

  it('normalization: false disables bypass passes', () => {
    const f = new Filter({ normalization: false });
    expect(f.check('salak').match).toBe(true);
    expect(f.check('s.a.l.a.k').match).toBe(false);
    expect(f.check('saaalak').match).toBe(false);
  });

  it('normalization can be toggled per pass', () => {
    const f = new Filter({ normalization: { separators: false } });
    expect(f.check('s.a.l.a.k').match).toBe(false);
    expect(f.check('saaalak').match).toBe(true);
  });

  it('shortWordLength controls strict-boundary matching', () => {
    const f = new Filter({ useDefaults: false, words: ['abcd'], shortWordLength: 4 });
    // treated as a short rule -> both-side boundary, no prefix match
    expect(f.check('abcde').match).toBe(false);
    expect(f.check('abcd').match).toBe(true);
  });

  it('exposes DEFAULT_WORDS', () => {
    expect(Array.isArray(DEFAULT_WORDS)).toBe(true);
    expect(DEFAULT_WORDS).toContain('fuck');
  });
});

describe('v1 backwards compatibility', () => {
  it('accepts the { ads } option as a link list', () => {
    const f = new Filter({ ads: ['promo-code'] });
    expect(f.check('use promo-code now').type).toBe('link');
    expect(f.ads).toContain('promo-code');
  });

  it('accepts { cleanCheck: false } like normalization: false', () => {
    const f = new Filter({ cleanCheck: false });
    expect(f.check('s.a.l.a.k').match).toBe(false);
    expect(f.check('salak').match).toBe(true);
  });

  it('keeps the v1 result fields', () => {
    const r = new Filter().check('salak');
    expect(r).toHaveProperty('match');
    expect(r).toHaveProperty('type');
    expect(r).toHaveProperty('word');
  });

  it('returns a no-match object for empty / non-string input', () => {
    const f = new Filter();
    expect(f.check('').match).toBe(false);
    // @ts-expect-error runtime guard
    expect(f.check(null).match).toBe(false);
    // @ts-expect-error runtime guard
    expect(f.check(undefined).match).toBe(false);
  });
});
