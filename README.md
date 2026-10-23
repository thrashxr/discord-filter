# Modsent

**One moderation engine. Every platform.**

A dependency-free, TypeScript-first content filtering engine for Node.js with ready-to-use Discord.js, grammY, and Telegraf adapters. Built from `discord-filter` v2.

> Release candidate: `3.0.0-rc.1`. This repository branch prepares a new package; it has not yet been published to npm.

## Installation after publishing

```sh
npm install modsent
```

## Standalone Node.js

```ts
import { Filter } from 'modsent';

const filter = new Filter({ languages: ['en'], words: ['myblockedword'] });
console.log(filter.check('myblockedword'));
console.log(filter.checkAll('See discord.gg/example and example.com'));
console.log(filter.censor('This is s.a.l.a.k'));
```

The core only analyzes strings; it does not access bot APIs. Categories: `profanity`, `link`, `invite`. A default TR/EN dictionary is loaded unless disabled with `useDefaults: false` or scoped via `languages`.

## Discord.js v14

Requires the Gateway Intent `MessageContent` and suitable message deletion permissions. Ignore messages the bot cannot moderate.

```ts
import { Client, GatewayIntentBits } from 'discord.js';
import { Filter } from 'modsent';
import { createDiscordModerator } from 'modsent/discordjs';

const client = new Client({ intents: [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent,
] });
const filter = new Filter();
client.on('messageCreate', createDiscordModerator({
  filter,
  skip: (message) => !message.guild,
  onError: (error) => console.error('Moderation failed:', error),
}));
client.login(process.env.DISCORD_TOKEN);
```

## grammY

Text messages and media captions are checked. The bot needs deletion privileges in the target chat. Use `action: 'none'` for detection-only mode.

```ts
import { Bot } from 'grammy';
import { Filter } from 'modsent';
import { createGrammyMiddleware } from 'modsent/grammy';

const bot = new Bot(process.env.BOT_TOKEN!);
bot.use(createGrammyMiddleware({
  filter: new Filter(),
  onError: (error) => console.error(error),
}));
bot.start();
```

## Telegraf

Text messages and media captions are checked. The bot must have sufficient permissions in its target chat.

```ts
import { Telegraf } from 'telegraf';
import { Filter } from 'modsent';
import { createTelegrafMiddleware } from 'modsent/telegraf';

const bot = new Telegraf(process.env.BOT_TOKEN!);
bot.use(createTelegrafMiddleware({
  filter: new Filter(),
  onError: (error) => console.error(error),
}));
bot.launch();
```

## Options and actions

Core constructor options: `words`, `links`, `invites`, `allowlist`, `useDefaults`, `languages` (`tr`, `en`), `shortWordLength`, and `normalization`. Mutation helpers include `addWord`, `removeWord`, `addLink`, `addInvite`, and `addAllow`. Inspect messages with `check` or `checkAll`; mask detected profanity with `censor`.

Adapter options: `filter`, `categories: ['profanity', 'invite', 'link']`, `action: 'delete' | 'none'`, `skip`, `onMatch`, `onError`, and `stopOnMatch`. Discord also supports `includeDMs`. These intentionally do not implement bans, strikes, role checks, or persistent moderation state. Handle those in your application.

Use `categories: ['profanity', 'invite']` to allow ordinary links while blocking invites and profanity. `skip` lets you exempt trusted users and chats. `onError` receives callback or deletion failures; if not provided, errors propagate. For performance, instantiate one Filter per shared configuration, rather than constructing it on every message.

## Migration from discord-filter

1. Replace `discord-filter` imports with `modsent`.
2. Existing `Filter.check`, `Filter.checkAll` and mutation APIs remain.
3. Existing `ads` and `cleanCheck` aliases are retained but deprecated.
4. `Filter.words`, `links`, `invites` and `ads` now return snapshots. Use mutation methods rather than editing them directly.
5. `type: 'ad'` was replaced with `link` or `invite` in v2.
6. Upgrade to `modsent/discordjs`, `modsent/grammy`, or `modsent/telegraf` for adapter-based moderation.

No changes have been published to the existing `discord-filter` npm package.

## Development

CI additionally compiles integration examples against real Discord.js, grammY and Telegraf declarations and installs the npm tarball in a clean directory to validate package exports.

```sh
npm ci
npm run typecheck
npm run lint
npm test
npm run build
```

Zero production dependencies. ESM/CJS with typings. This is deterministic matching, not an AI toxicity classifier; review false positives and bypass cases for your community.
