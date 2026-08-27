import { describe, it, expect } from 'vitest';
import { Filter } from '../src/index';

const filter = new Filter();

describe('false-positive regression', () => {
  const clean = [
    // spec-mandated cases
    'picture',
    'Picasso',
    'şikayet',
    'book',
    'class',
    'assignment',
    // classic substring traps
    'Scunthorpe',
    'assassin',
    'analysis',
    'password',
    'grass',
    'bass guitar',
    'therapist appointment',
    'Dickens novel',
    'Emily Dickinson',
    'cockpit',
    'Hancock',
    'peacock',
    'cocktail hour',
    'niggardly budget',
    'shiitake mushrooms',
    'fire retardant material',
    // turkish everyday words that used to collide
    'koç takımı',
    'maça gidiyoruz',
    'klasik müzik',
    'sıkıntı yok',
    'kaşar peyniri',
    'meme oldu bu iş',
    'komik adam',
    'müzik dinliyorum',
    // sentences
    'I am going to the library',
    'e.g. the quick brown fox',
    'this is something.completely different',
    'run the analysis on node.js today',
  ];

  it.each(clean)('does not flag %j', (text) => {
    const r = filter.check(text);
    expect(r.match, `unexpected match: ${JSON.stringify(r)}`).toBe(false);
  });

  it('does not flag a clean sentence via checkAll either', () => {
    expect(filter.checkAll('the class assignment is due tomorrow').matches).toHaveLength(0);
  });
});
