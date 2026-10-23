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

  it.each([
    'discord,gg',
    'discord gg',
    'discord(.)gg',
    'discord . gg',
    'discord .gg',
    'discord. gg',
    'DISCORD ( . ) GG/abc12',
    'join discord,gg/abcdef now',
  ])('detects obfuscated invite host %j', (text) => {
    const match = filter.check(text);
    expect(match).toMatchObject({ match: true, type: 'invite' });
    expect(filter.checkAll(text).matches.some((m) => m.type === 'invite')).toBe(true);
  });

  it('preserves source offsets for an obfuscated invite', () => {
    const text = 'join discord (.) gg/abc12 now';
    const match = filter.check(text);
    expect(match).toMatchObject({
      type: 'invite',
      matchedText: 'discord (.) gg/abc12',
      index: 5,
      endIndex: 24,
    });
  });

  it.each([
    'notdiscord gg',
    'discord ggamer',
    'mydiscord(.)gg',
    'discord (.) ggg',
    'just discord or gg',
    'a discord game',
  ])('does not flag ordinary text %j', (text) => {
    expect(filter.check(text).match).toBe(false);
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
