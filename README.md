# discord-filter

Lightweight, **dependency-free**, framework-agnostic text filter for profanity,
links, and Discord invites — with real bypass detection and a low false-positive
rate.

- **Zero runtime dependencies.** Operates on plain strings.
- **Framework independent.** Works with Discord.js, grammY / Telegram, Twitch
  bots, web chats, forums, games, or any Node.js app.
- **Native TypeScript**, shipped as both ESM and CommonJS with type declarations.
- **Bypass-aware:** separators (`s.a.l.a.k`), repeated characters (`saaalak`),
  leetspeak (`$alak`), and a small set of Unicode homoglyphs.
- **Separate categories:** `profanity`, `link`, and `invite` — a normal URL is a
  `link`, not an "ad".

It **only analyzes text and returns a result.** It never bans, kicks, times out,
deletes messages, connects to Discord, or calls any external API.

## Installation

```bash
npm install discord-filter
```

Requires Node.js 18+.

## Usage

```ts
import { Filter } from 'discord-filter';

const filter = new Filter();

filter.check('you are a s.a.l.a.k');
// {
//   match: true,
//   type: 'profanity',
//   word: 'salak',
//   matchedText: 's.a.l.a.k',
//   index: 10,
//   endIndex: 19
// }

filter.check('join my server discord.gg/abcdef');
// { match: true, type: 'invite', word: 'discord.gg/abcdef', matchedText: 'discord.gg/abcdef', index: 15, endIndex: 31 }

filter.check('check out https://example.com');
// { match: true, type: 'link', word: 'https://example.com', ... }

filter.check('what a lovely picture');
// { match: false, type: null, word: null, matchedText: null, index: -1, endIndex: -1 }
```

CommonJS:

```js
const { Filter } = require('discord-filter');
```

### Discord.js

`discord-filter` is not a Discord library — you wire it into your own handler:

```ts
import { Filter } from 'discord-filter';

const filter = new Filter();

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const result = filter.check(message.content);
  if (result.match) {
    await message.delete();
    // your own logging / warning / mod-action logic here
  }
});
```

### Other frameworks

```ts
// grammY (Telegram)
bot.on('message:text', async (ctx) => {
  if (filter.check(ctx.message.text).match) await ctx.deleteMessage();
});
```

## API

### `new Filter(options?)`

| Option            | Type                              | Default  | Description                                                                 |
| :---------------- | :-------------------------------- | :------- | :------------------------------------------------------------------------- |
| `words`           | `string[]`                        | `[]`     | Extra profanity rules, merged with the defaults.                          |
| `links`           | `string[]`                        | `[]`     | Extra link fragments to flag (matched literally, case-insensitively).     |
| `invites`         | `string[]`                        | defaults | Extra invite host fragments (e.g. `myserver.gg`).                         |
| `allowlist`       | `string[]`                        | defaults | Words that must never be flagged as profanity.                            |
| `useDefaults`     | `boolean`                         | `true`   | Load the built-in TR/EN profanity list + invite hosts + allowlist.        |
| `shortWordLength` | `number`                          | `3`      | Rules this length or shorter require a strict word boundary on both sides. |
| `normalization`   | `boolean \| NormalizationOptions` | `true`   | `false` disables every bypass pass; an object toggles them individually.   |

`NormalizationOptions`: `{ repeatedCharacters?, separators?, leetspeak?, homoglyphs? }` — all `true` by default.

### `filter.check(text): FilterResult`

Returns the single most relevant match, or a no-match object. Category priority
is **`profanity` > `invite` > `link`**; ties broken by position.

```ts
type FilterResult =
  | { match: true; type: 'profanity' | 'link' | 'invite'; word: string; matchedText: string; index: number; endIndex: number }
  | { match: false; type: null; word: null; matchedText: null; index: -1; endIndex: -1 };
```

### `filter.checkAll(text): { match: boolean; matches: FilterMatch[] }`

Returns **every** match found, ordered by `index`.

### Blocklist methods

```ts
filter.addWord(w);   filter.removeWord(w);   filter.hasWord(w);   filter.clearWords();
filter.addLink(f);   filter.removeLink(f);                        filter.clearLinks();
filter.addInvite(f); filter.removeInvite(f);                      filter.clearInvites();
filter.addAllow(w);
```

Every mutation recompiles the internal matcher, so the next `check()` reflects it.
Reading `filter.words` / `filter.links` / `filter.invites` returns the live lists.

## How detection works

Each `check()` normalizes the input **once** and runs it against matchers that
were compiled **once** at construction (rule count barely affects throughput).

### Profanity

1. **Case-fold** + strip diacritics. Turkish `ı`/`İ`/`I` → `i`, `ş` → `s`.
   `ç`, `ğ`, `ö`, `ü` are **kept** — folding them creates collisions
   (`piç` → `pic`, `göt` → `got`).
2. **Homoglyphs** (optional): a small curated set of Cyrillic/Greek/fullwidth
   look-alikes → Latin (`SALAК` with a Cyrillic К → `salak`).
3. **Leetspeak** (optional): a conservative map only — `4/@ → a`, `3 → e`,
   `1/! → i`, `0 → o`, `$ → s`.
4. **Separator evasion** (optional): runs of **single** letters joined by a
   **consistent** separator (`s.a.l.a.k`, `s-a-l-a-k`, `s _ a _ l`, `s a l a k`)
   are compacted. Ordinary prose (`I am here`, `e.g. this`, `a s.a.l.a.k`) is
   left alone.
5. **Repeated characters** (optional): runs of 3+ identical characters collapse
   to one (`saaalak` → `salak`). Doubles are preserved so `book`, `class`,
   `assignment` are untouched.

Matching is **boundary-aware**, never a raw substring scan:

- Rules ≤ `shortWordLength` (default 3) need a word boundary on **both** sides,
  so `sik` never matches `şikayet`, `music`, or `Scunthorpe`.
- Longer rules need a boundary on the **left** and may match a trailing
  inflection (`fuck` → `fucking`, `salak` → `salaklar`).
- An **allowlist** clears known-safe tokens (`Dickens`, `niggardly`,
  `shiitake`, `analysis`, …).

### Links & invites

A real URL matcher (not a `.com` substring search). A bare host with no scheme
and no `www.` must end in a known TLD, so `something.completely` and `Node.js`
are not links. Discord invite formats (`discord.gg/x`, `discord.com/invite/x`,
`discordapp.com/invite/x`, with or without scheme/`www.`) are reported as
`invite`; everything else URL-shaped is a `link`.

## Limitations

- Not an AI/toxicity classifier — it matches rules and their obvious variants.
- Aggressive multi-layer obfuscation (`ѕ🅰️l4·k`) can still slip through; the
  engine deliberately favors **not** flagging clean text over catching every
  possible bypass.
- Short 3-letter rules trade recall for precision: `piçi` (inflected) is not
  matched because `piç` is a strict-boundary short rule.
- The default profanity list is intentionally small and Turkish/English only.
  Curate `words` for your community.
- Leetspeak/homoglyph maps are small by design. Extend via `words` if you need
  more.

## Migrating from v1

| v1                                   | v2                                                                 |
| :----------------------------------- | :---------------------------------------------------------------- |
| `require('discord-filter')`          | unchanged — `const { Filter } = require('discord-filter')`        |
| `new Filter({ words, useDefaults })` | unchanged                                                        |
| `new Filter({ ads: [...] })`         | still works (alias for `links`); prefer `links`                   |
| `new Filter({ cleanCheck: false })`  | still works (alias for `normalization: false`)                    |
| `result.type === 'ad'`               | now `'link'` (or `'invite'`). `'ad'` is **removed**.             |
| `result` had `match`, `type`, `word` | same three fields **plus** `matchedText`, `index`, `endIndex`.    |
| every URL flagged as `ad`            | URLs are `link`; Discord invites are `invite`; no default noise.  |
| `discord.js` was a dependency        | removed — `discord-filter` has **no runtime dependencies**.       |

The one behavioral break: **`type: 'ad'` no longer exists.** Replace
`type === 'ad'` checks with `type === 'link' || type === 'invite'`.

## Contributing

Issues and PRs welcome at <https://github.com/thrashxr/discord-filter>.
Run `npm run typecheck && npm run lint && npm test && npm run build` before
opening a PR. New behavior needs a test; false-positive regressions must stay.

## License

ISC
