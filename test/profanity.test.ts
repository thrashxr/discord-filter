import { describe, it, expect } from 'vitest';
import { Filter } from '../src/index';

const filter = new Filter();

describe('basic profanity', () => {
  it.each(['salak', 'fuck', 'shit', 'yavşak', 'orospu', 'siktir'])(
    'flags %s',
    (word) => {
      const r = filter.check(word);
      expect(r.match).toBe(true);
      expect(r.type).toBe('profanity');
    },
  );

  it('reports the canonical word and position', () => {
    const r = filter.check('you are a salak lol');
    expect(r).toMatchObject({
      match: true,
      type: 'profanity',
      word: 'salak',
      matchedText: 'salak',
      index: 10,
    });
  });

  it('prefers the longer rule (siktir over sik)', () => {
    expect(filter.check('siktir lan').word).toBe('siktir');
  });
});

describe('case variants', () => {
  it.each(['SALAK', 'SaLaK', 'sAlAk', 'YAVŞAK'])('flags %s', (word) => {
    expect(filter.check(word).match).toBe(true);
  });
});

describe('repeated characters', () => {
  it.each(['saaalak', 'salllaaak', 'fuuuuck', 'shiiiit'])('flags %s', (word) => {
    expect(filter.check(word).match).toBe(true);
  });

  it('keeps the original surface text in matchedText', () => {
    expect(filter.check('saaalak').matchedText).toBe('saaalak');
  });
});

describe('separator evasions', () => {
  it.each([
    's.a.l.a.k',
    's-a-l-a-k',
    's_a_l_a_k',
    's a l a k',
    's . a . l . a . k',
    'f.u.c.k',
  ])('flags %s', (word) => {
    const r = filter.check(word);
    expect(r.match).toBe(true);
    expect(r.type).toBe('profanity');
  });

  it('preserves the obfuscated text in matchedText', () => {
    expect(filter.check('say s.a.l.a.k please').matchedText).toBe('s.a.l.a.k');
  });

  it('a leading article is not swallowed into the evasion chain', () => {
    // regression: "a s.a.l.a.k" must not normalize to "asalak" and miss
    const r = filter.check('you are a s.a.l.a.k');
    expect(r.match).toBe(true);
    expect(r.matchedText).toBe('s.a.l.a.k');
    expect(r.index).toBe(10);
  });

  it('does not compact a chain with mixed separator styles', () => {
    // space + dots is not a deliberate consistent separator
    expect(filter.check('is a b.c.d thing').match).toBe(false);
  });

  it('does not compact ordinary prose', () => {
    expect(filter.check('I am on a call').match).toBe(false);
    expect(filter.check('e.g. this and that').match).toBe(false);
  });
});

describe('leetspeak (default on)', () => {
  it.each([
    ['$alak', true],
    ['s4l4k', true],
    ['s@lak', true],
    ['sh1t', true],
    ['f@ggot', true],
  ] as const)('%s -> %s', (word, expected) => {
    expect(filter.check(word).match).toBe(expected);
  });

  it('can be disabled', () => {
    const noLeet = new Filter({ normalization: { leetspeak: false } });
    expect(noLeet.check('s4l4k').match).toBe(false);
    expect(noLeet.check('salak').match).toBe(true);
  });
});

describe('unicode homoglyphs', () => {
  it('folds a Cyrillic look-alike (SALAК with Cyrillic К)', () => {
    expect(filter.check('SALAК').match).toBe(true);
  });

  it('can be disabled', () => {
    const noHomo = new Filter({ normalization: { homoglyphs: false } });
    expect(noHomo.check('SALAК').match).toBe(false);
  });
});

describe('turkish normalization', () => {
  it.each([
    ['amcık', true],
    ['amcik', true],
    ['şerefsiz', true],
    ['serefsiz', true],
    ['YAVŞAK', true],
    ['yavsak', true],
  ] as const)('%s -> %s', (word, expected) => {
    expect(filter.check(word).match).toBe(expected);
  });
});
