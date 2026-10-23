import { describe, it, expect } from 'vitest';
import { Filter } from '../src/index';
import { createDiscordModerator } from '../src/adapters/discordjs';
import { createGrammyMiddleware } from '../src/adapters/grammy';
import { createTelegrafMiddleware } from '../src/adapters/telegraf';

describe('Modsent core', () => {
  it('allows selecting English only', () => {
    const f = new Filter({ languages: ['en'] });
    expect(f.check('salak').match).toBe(false);
    expect(f.check('fuck').type).toBe('profanity');
  });
  it('censors bypass variants without modifying URLs', () => {
    expect(new Filter().censor('s.a.l.a.k example.com')).toBe('********* example.com');
  });
  it('does not expose mutable internal rules', () => {
    const f = new Filter({ useDefaults: false });
    f.words.push('hidden');
    expect(f.check('hidden').match).toBe(false);
  });
});

describe('Moderation adapters', () => {
  const filter = new Filter({ useDefaults: false, words: ['forbidden'] });
  it('deletes Discord guild messages but not bots or DMs by default', async () => {
    let deletes = 0;
    const handle = createDiscordModerator({ filter });
    const msg = (bot: boolean, guild: unknown) => ({
      author: { bot }, content: 'forbidden', guild,
      delete: async () => { deletes++; },
    });
    await handle(msg(false, {}));
    await handle(msg(true, {}));
    await handle(msg(false, null));
    expect(deletes).toBe(1);
  });
  it('stops grammY middleware on matching messages', async () => {
    let deletes = 0;
    let nexts = 0;
    const middleware = createGrammyMiddleware({ filter });
    const ctx = (text: string) => ({
      message: { text }, deleteMessage: async () => { deletes++; },
    });
    await middleware(ctx('hello'), async () => { nexts++; });
    await middleware(ctx('forbidden'), async () => { nexts++; });
    expect({ deletes, nexts }).toEqual({ deletes: 1, nexts: 1 });
  });
  it('supports non-destructive Telegraf monitoring', async () => {
    let hits = 0;
    const middleware = createTelegrafMiddleware({
      filter, action: 'none', onMatch: () => { hits++; },
    });
    await middleware({
      message: { text: 'forbidden' },
      deleteMessage: async () => { throw Error('must not delete'); },
    }, async () => {});
    expect(hits).toBe(1);
  });
  it('handles permission failures via onError', async () => {
    let errors = 0;
    const middleware = createGrammyMiddleware({
      filter, onError: () => { errors++; },
    });
    await middleware({
      message: { text: 'forbidden' },
      deleteMessage: async () => { throw Error('forbidden'); },
    }, async () => {});
    expect(errors).toBe(1);
  });
});
