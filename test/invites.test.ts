import { describe, it, expect } from 'vitest';
import { Filter } from '../src/index';

const filter = new Filter();

describe('discord invite detection', () => {
  it.each([
    'discord.gg/example',
    'discord.com/invite/example',
    'discordapp.com/invite/example',
    'https://discord.gg/aBc123',
    'https://www.discord.gg/aBc123',
    'join here: discord.gg/friends please',
  ])('flags %j as invite', (text) => {
    const r = filter.check(text);
    expect(r.match).toBe(true);
    expect(r.type).toBe('invite');
  });

  it('reports the invite substring', () => {
    const r = filter.check('join discord.gg/cool now');
    expect(r).toMatchObject({ type: 'invite', matchedText: 'discord.gg/cool', index: 5 });
  });

  it('a bare discord.gg with no code is a link, not an invite', () => {
    expect(filter.check('discord.gg').type).toBe('link');
  });

  it('supports custom invite hosts', () => {
    const f = new Filter({ invites: ['myserver.gg'] });
    const r = f.check('come to myserver.gg/lobby');
    expect(r.type).toBe('invite');
  });

  it('check() prioritises invite over a plain link in the same message', () => {
    const r = filter.check('site http://example.com and discord.gg/xyz');
    expect(r.type).toBe('invite');
  });
});
