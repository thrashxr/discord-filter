# Changelog

## 3.0.0-rc.1 — Modsent migration candidate

### Added
- Framework-independent moderation adapters for Discord.js, grammY and Telegraf.
- Standalone package subpath exports with ESM and CommonJS types.
- Per-adapter category selection, actions, skip callbacks and error handlers.
- Telegram message and caption moderation support.
- Selectable built-in dictionaries with `languages: ['tr', 'en']`.
- `Filter.censor(text)` for masking profanity using original match spans.
- Copy-paste examples for Node.js, Discord.js, grammY, Telegraf, Express and Socket.IO.
- CI integration typing against installed framework packages and an isolated npm package smoke test.

### Changed
- Proposed package name is `modsent`, while the previously published `discord-filter` package remains unchanged.
- Accessors `words`, `links`, `invites` and `ads` return snapshots. Use mutation APIs to change filters.

### Notes
- Release candidate only. No publication, deprecation or migration of the existing npm package is implied.
- Moderation adapters are intentionally small and do not implement persistent strikes, permissions, bans or audit logging.

---

## 2.0.0

A full rewrite. The public API (`new Filter()`, `filter.check()`) is preserved;
one output value changed. See the "Migrating from v1" section of the README.

### Added

- Native **TypeScript** source; ships **ESM + CommonJS** with `.d.ts`.
- **Zero runtime dependencies.**
- Real **separator bypass detection** — `s.a.l.a.k`, `s-a-l-a-k`, `s_a_l_a_k`,
  `s a l a k` (consistent-separator, single-letter runs only).
- **Leetspeak** normalization (conservative, configurable): `4/@→a`, `3→e`,
  `1/!→i`, `0→o`, `$→s`.
- **Unicode homoglyph** folding (small curated Cyrillic/Greek/fullwidth set).
- **URL detection** with a TLD guard instead of `.com`/`https://` substring
  checks.
- **Discord invite detection** as its own `invite` category, independent of
  Discord.js.
- Richer result: `matchedText`, `index`, `endIndex` alongside `match`, `type`,
  `word`.
- `filter.checkAll(text)` — returns every match, ordered by position.
- Symmetric blocklist methods: `addLink`/`removeLink`/`clearLinks`,
  `addInvite`/`removeInvite`/`clearInvites`, `hasWord`, `clearWords`,
  `addAllow`.
- Configurable `allowlist`, `shortWordLength`, and per-pass `normalization`
  toggles.
- Exported constants: `DEFAULT_WORDS`, `DEFAULT_ALLOWLIST_WORDS`,
  `DEFAULT_INVITE_HOSTS`, `TR_WORDS`, `EN_WORDS`.
- **127 automated tests** (Vitest) — heavy on false-positive and bypass
  regressions — plus a benchmark suite.

### Changed

- Matching is **token/boundary-aware** instead of `content.includes(word)`.
  Short rules (≤ 3 chars) require a boundary on both sides.
- Normalization runs **once per `check()`**; the blocklist is compiled **once**
  at construction and on mutation, not per call.
- Turkish folding is selective: `ı`/`İ`/`I`/`ş` fold to ASCII, but `ç`/`ğ`/`ö`/`ü`
  are preserved to avoid `piç→pic` / `göt→got` collisions.
- Default profanity lists curated for false-positive safety (`meme`, `göt`,
  `kaşar`, `cock`, bare `ass` removed).
- `package.json` rebuilt with `exports`, `module`, `types`, `files`, `engines`,
  `sideEffects`, `repository`, `homepage`, `bugs`.

### Removed

- **`discord.js` runtime dependency.**
- **`type: 'ad'`** — a normal URL is now `type: 'link'`; Discord invites are
  `type: 'invite'`. The old behavior of flagging every URL as an ad is gone.
- The `DEFAULT_ADS` list of bare TLD/scheme substrings.

### Fixed

- Separator bypasses that v1 documented but did not actually detect.
- Substring false positives (`şikayet` → `sik`, `class`, `assignment`,
  `Scunthorpe`, `picture`, `Picasso`, …).
- Repeated per-call normalization of the entire blocklist.
- Documentation that claimed unverified bypass coverage.

---

## 1.x

- 1.1.1 — class-based API, repeated-character "smart" matching, built-in TR/EN
  profanity + ad lists, TypeScript definitions.
