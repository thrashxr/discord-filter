import { TR_WORDS } from './tr';
import { EN_WORDS } from './en';

export { TR_WORDS, EN_WORDS };

/** Built-in profanity rules (Turkish + English). */
export const DEFAULT_WORDS: readonly string[] = [...TR_WORDS, ...EN_WORDS];

/**
 * Words that must never be reported as profanity even when a rule would
 * otherwise match them (surnames, compounds, technical terms).
 */
export const DEFAULT_ALLOWLIST: readonly string[] = [
  'dickens',
  'dickinson',
  'shiitake',
  'shitake',
  'niggardly',
  'niggard',
  'retardant',
  'scunthorpe',
  'analysis',
  'assassin',
  'assignment',
  'assumption',
  'class',
  'classic',
  'grass',
  'pass',
  'password',
  'bass',
  'canvas',
  'sikayet',
  'şikayet',
];

/**
 * Host fragments treated as Discord invites. Matched case-insensitively against
 * the detected URL's host + path prefix.
 */
export const DEFAULT_INVITE_HOSTS: readonly string[] = [
  'discord.gg',
  'discord.com/invite',
  'discordapp.com/invite',
  'discord.me',
  'dis.gd',
];

/**
 * v1 shipped a `DEFAULT_ADS` list that flagged every URL. v2 has a real URL
 * matcher instead, so there is no default link blocklist — every link is
 * reported as `link` unless the caller opts into a custom `links` list.
 */
export const DEFAULT_LINK_HOSTS: readonly string[] = [];
