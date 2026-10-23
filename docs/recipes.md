# Recipes

Every example imports the same pure string filter. Keep a single `Filter` instance per rule set rather than allocating one per incoming message.

## Allow links but block Discord invites and profanity

```ts
import { Filter } from '@thrasherflu/modsent';
import { createDiscordModerator } from '@thrasherflu/modsent/discordjs';

const filter = new Filter();
const handler = createDiscordModerator({
  filter,
  categories: ['invite', 'profanity'],
  onError: (error) => console.error('Failed to moderate message:', error),
});
client.on('messageCreate', handler);
```

The `categories` setting is supported by every adapter. Its default is all match types.

## Observe matches without deleting anything

```ts
import { Filter } from '@thrasherflu/modsent';
import { createGrammyMiddleware } from '@thrasherflu/modsent/grammy';

bot.use(createGrammyMiddleware({
  filter: new Filter(),
  action: 'none',
  stopOnMatch: false,
  onMatch: (ctx, match) => {
    console.log(ctx.from?.id, match.type, match.matchedText);
  },
}));
```

A moderation callback does not persist data. Store violations, user strikes, bans, and exemptions in your own database.

## Express HTTP API

Install `npm i @thrasherflu/modsent express`, create `server.mjs`:

```js
import express from 'express';
import { Filter } from '@thrasherflu/modsent';

const app = express();
const filter = new Filter({ languages: ['en'] });
app.use(express.json({ limit: '16kb' }));

app.post('/moderate', (req, res) => {
  if (typeof req.body?.text !== 'string') {
    res.status(400).json({ error: 'text must be a string' });
    return;
  }
  const result = filter.check(req.body.text);
  res.status(result.match ? 422 : 200).json(result);
});

app.listen(3000, () => console.log('Ready at http://localhost:3000'));
```

Run with `node server.mjs`. This endpoint only returns a detection result; it does not store submitted messages.

## Socket.IO chat

Install `npm i @thrasherflu/modsent socket.io`, create `server.mjs`:

```js
import { Server } from 'socket.io';
import { Filter } from '@thrasherflu/modsent';

const io = new Server(3001);
const filter = new Filter();

io.on('connection', (socket) => {
  socket.on('chat:message', (payload, acknowledge) => {
    if (typeof payload?.text !== 'string') {
      acknowledge?.({ ok: false, reason: 'invalid_payload' });
      return;
    }
    const result = filter.check(payload.text);
    if (result.match) {
      acknowledge?.({ ok: false, reason: result.type });
      return;
    }
    io.emit('chat:message', { text: payload.text });
    acknowledge?.({ ok: true });
  });
});
```

Run with `node server.mjs`. Authentication, authorization, flood control and message persistence remain the application's responsibility.

## Separate policies by chat or community

```ts
import { Filter } from '@thrasherflu/modsent';

const filters = new Map<string, Filter>();

export function forChat(chatId: string): Filter {
  let filter = filters.get(chatId);
  if (!filter) {
    filter = new Filter({ words: ['customword'], languages: ['en'] });
    filters.set(chatId, filter);
  }
  return filter;
}
```

Unbounded in-memory maps can grow indefinitely; use lifecycle cleanup or a bounded cache for production deployments.

## Practical boundaries

- The core is synchronous, deterministic and has no runtime network calls.
- Normalization minimizes false positives; it cannot identify every intentionally obfuscated message.
- `filter.check()` picks the highest-priority match, while `filter.checkAll()` returns all detections.
- The adapters do not fetch missing message text, request permissions, or administer strikes.
- Bot token secrets belong in environment variables, not in source control.
