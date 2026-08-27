import { describe, it, expect } from 'vitest';
import {
  normalizeForProfanity,
  ALL_NORMALIZATION,
  NO_NORMALIZATION,
} from '../src/normalization/normalize';
import { compactSeparators } from '../src/normalization/separators';

const idxMap = (s: string): number[] => [...s].map((_, i) => i);

describe('normalizeForProfanity', () => {
  it('case-folds and strips diacritics', () => {
    expect(normalizeForProfanity('SÁLÀK', ALL_NORMALIZATION).text).toBe('salak');
  });

  it('folds Turkish ş and dotless i', () => {
    expect(normalizeForProfanity('YAVŞAK', ALL_NORMALIZATION).text).toBe('yavsak');
    expect(normalizeForProfanity('AMCIK', ALL_NORMALIZATION).text).toBe('amcik');
  });

  it('does NOT fold ç/ö so piç never becomes pic', () => {
    expect(normalizeForProfanity('PİÇ', ALL_NORMALIZATION).text).toBe('piç');
    expect(normalizeForProfanity('GÖT', ALL_NORMALIZATION).text).toBe('göt');
  });

  it('compacts separator evasions but keeps prose', () => {
    expect(normalizeForProfanity('s.a.l.a.k', ALL_NORMALIZATION).text).toBe('salak');
    expect(normalizeForProfanity('I am here', ALL_NORMALIZATION).text).toBe('i am here');
  });

  it('does NOT collapse repeated characters in the text (handled in the matcher)', () => {
    expect(normalizeForProfanity('saaalak', ALL_NORMALIZATION).text).toBe('saaalak');
    expect(normalizeForProfanity('book', ALL_NORMALIZATION).text).toBe('book');
  });

  it('NO_NORMALIZATION only lowercases + strips accents', () => {
    expect(normalizeForProfanity('S.A.L.A.K', NO_NORMALIZATION).text).toBe('s.a.l.a.k');
    expect(normalizeForProfanity('SAAALAK', NO_NORMALIZATION).text).toBe('saaalak');
  });

  it('keeps an index map back to the original string', () => {
    const { text, map } = normalizeForProfanity('s.a.l.a.k', ALL_NORMALIZATION);
    expect(text).toBe('salak');
    expect(map).toEqual([0, 2, 4, 6, 8]);
  });
});

describe('compactSeparators', () => {
  it('needs at least 3 single letters', () => {
    const two = compactSeparators([...'a.b'], idxMap('a.b'));
    expect(two.chars.join('')).toBe('a.b');
    const three = compactSeparators([...'a.b.c'], idxMap('a.b.c'));
    expect(three.chars.join('')).toBe('abc');
  });

  it('does not compact a chain with mixed separator styles', () => {
    const mixed = compactSeparators([...'a b.c'], idxMap('a b.c'));
    expect(mixed.chars.join('')).toBe('a b.c');
  });
});
