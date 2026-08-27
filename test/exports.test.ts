import { describe, it, expect } from 'vitest';
import * as api from '../src/index';
import {
  Filter,
  DEFAULT_WORDS,
  DEFAULT_ALLOWLIST_WORDS,
  DEFAULT_INVITE_HOSTS,
  TR_WORDS,
  EN_WORDS,
} from '../src/index';

describe('public exports', () => {
  it('exposes exactly the documented runtime surface', () => {
    const keys = Object.keys(api).filter((k) => k !== 'default' && k !== '__esModule');
    expect(keys.sort()).toEqual(
      [
        'DEFAULT_ALLOWLIST_WORDS',
        'DEFAULT_INVITE_HOSTS',
        'DEFAULT_WORDS',
        'EN_WORDS',
        'Filter',
        'TR_WORDS',
      ].sort(),
    );
  });

  it('does not leak a mis-spelled or legacy constant name', () => {
    expect(api).not.toHaveProperty('DEFAULT_ALLOWLIST');
    expect(api).not.toHaveProperty('DEFAULT_ALLOTR_WORDS');
    expect(api).not.toHaveProperty('DEFAULT_LINK_HOSTS');
    expect(api).not.toHaveProperty('DEFAULT_ADS');
  });

  it('Filter is a constructor', () => {
    expect(typeof Filter).toBe('function');
    expect(new Filter()).toBeInstanceOf(Filter);
  });

  it('constant shapes are non-empty readonly string arrays', () => {
    for (const arr of [DEFAULT_WORDS, DEFAULT_ALLOWLIST_WORDS, DEFAULT_INVITE_HOSTS, TR_WORDS, EN_WORDS]) {
      expect(Array.isArray(arr)).toBe(true);
      expect(arr.length).toBeGreaterThan(0);
      expect(arr.every((x) => typeof x === 'string')).toBe(true);
    }
  });

  it('DEFAULT_WORDS is the union of TR_WORDS and EN_WORDS', () => {
    expect(DEFAULT_WORDS).toEqual([...TR_WORDS, ...EN_WORDS]);
  });

  it('DEFAULT_INVITE_HOSTS covers the documented hosts', () => {
    expect(DEFAULT_INVITE_HOSTS).toEqual(
      expect.arrayContaining(['discord.gg', 'discord.com/invite', 'discordapp.com/invite']),
    );
  });
});
