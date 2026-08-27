import { describe, it, expect } from 'vitest';
import { Filter } from '../src/index';

const filter = new Filter();

describe('url detection', () => {
  it.each([
    'https://example.com',
    'http://example.com',
    'example.com',
    'www.example.com',
    'http://example.com/some/path?q=1',
    'check out https://sub.domain.co.uk/page now',
  ])('flags %j as a link', (text) => {
    const r = filter.check(text);
    expect(r.match).toBe(true);
    expect(r.type).toBe('link');
  });

  it('reports the url substring and index', () => {
    const r = filter.check('go to example.com now');
    expect(r).toMatchObject({ type: 'link', matchedText: 'example.com', index: 6 });
  });

  it.each([
    'something.completely different',
    'e.g. hello there',
    'i.e. this thing',
    'Node.js and index.js files',
    'version 1.2.3 released',
    'call me at 3.30',
  ])('does not treat %j as a link', (text) => {
    expect(filter.check(text).match).toBe(false);
  });

  it('does not classify a plain url as an ad', () => {
    // regression against v1 behaviour
    expect(filter.check('https://youtube.com').type).not.toBe('ad');
  });
});
