import { describe, it, expect } from 'vitest';
import { Filter } from '../src/index';

const filter = new Filter();

describe('result index integrity: slice(index, endIndex) === matchedText', () => {
  const cases = [
    'hello salak world',
    'hello s.a.l.a.k world',
    'hello saaalaak world',
    'hello s@lak world',
    'hello SALAK world',
    'hello s-a-l-a-k world',
    'hello s_a_l_a_k world',
    'hello s a l a k world',
    'you are a s.a.l.a.k',
    'çok şerefsiz birisin',
    '🎉 party then salak then 🎊',
    'emoji 👋 before f u c k here',
    'multiple salak and orospu here',
    'discord.gg/example is the link',
    'go to https://example.com/x?y=1 now',
    'salak https://example.com discord.gg/example',
  ];

  it.each(cases)('%j', (text) => {
    const all = filter.checkAll(text);
    expect(all.matches.length).toBeGreaterThan(0);
    for (const m of all.matches) {
      expect(text.slice(m.index, m.endIndex)).toBe(m.matchedText);
      expect(m.index).toBeGreaterThanOrEqual(0);
      expect(m.endIndex).toBeGreaterThan(m.index);
    }
  });

  it('single check() result is also slice-consistent', () => {
    const r = filter.check('hey saaalak you');
    expect(r.match).toBe(true);
    if (r.match) {
      expect('hey saaalak you'.slice(r.index, r.endIndex)).toBe(r.matchedText);
      expect(r.matchedText).toBe('saaalak');
    }
  });

  it('maps a leetspeak match back to the original characters', () => {
    const r = filter.check('what a s@lak');
    expect(r.match).toBe(true);
    if (r.match) expect(r.matchedText).toBe('s@lak');
  });
});

describe('check() and checkAll() consistency', () => {
  const mixed = 'salak https://example.com discord.gg/example';

  it('check() returns the highest-priority match (profanity first)', () => {
    const r = filter.check(mixed);
    expect(r).toMatchObject({ type: 'profanity', word: 'salak', index: 0 });
  });

  it('checkAll() returns every category, ordered by index, no overlaps', () => {
    const { match, matches } = filter.checkAll(mixed);
    expect(match).toBe(true);
    expect(matches.map((m) => m.type)).toEqual(['profanity', 'link', 'invite']);

    const indices = matches.map((m) => m.index);
    expect(indices).toEqual([...indices].sort((a, b) => a - b));

    for (let i = 1; i < matches.length; i++) {
      expect(matches[i]!.index).toBeGreaterThanOrEqual(matches[i - 1]!.endIndex);
    }
  });

  it('the first checkAll match equals the check result when priority is position-aligned', () => {
    const r = filter.check(mixed);
    const first = filter.checkAll(mixed).matches[0]!;
    expect({ type: r.type, index: r.index }).toEqual({ type: first.type, index: first.index });
  });

  it('a link that is also a Discord invite is reported once, as invite', () => {
    const { matches } = filter.checkAll('come here https://discord.gg/abcdef please');
    expect(matches).toHaveLength(1);
    expect(matches[0]!.type).toBe('invite');
  });
});
