# Release checklist for Modsent

This codebase is currently a release candidate. The published `discord-filter` npm package must not be renamed or deprecated before Modsent is installable.

1. Confirm that the publisher can publish under the `@thrasherflu` npm scope using `npm whoami`. The unscoped name `@thrasherflu/modsent` was rejected by npm as too similar to `moment` (E403). A scoped name is separate, but still requires owner or organization access.
2. Use the npm account that controls `@thrasherflu`. Enable two-factor authentication or configure npm Trusted Publishing for this repository. Do not commit npm tokens.
3. Verify the source branch and build: `npm ci && npm run typecheck && npm run lint && npm test && npm run build`.
4. Run `npm pack --dry-run` and inspect the tarball; ensure `dist`, typings, README, license, changelog and `docs` are included.
5. Check the CI framework-compatibility and package-installation smoke tests.
6. Publish the first prerelease under a non-default dist-tag: `npm publish --access public --tag next`. Do **not** publish the prerelease as the `latest` dist-tag.
7. In a new consumer app, verify `npm install @thrasherflu/@thrasherflu/modsent@next` and test all four entrypoints: `@thrasherflu/modsent`, `@thrasherflu/modsent/discordjs`, `@thrasherflu/modsent/grammy`, `@thrasherflu/modsent/telegraf`.
8. Only after prerelease validation should the repo's main branch, release notes and the old package README direct users to the new package.
9. Deprecate the old npm package only if there is a tested migration path and an explicit maintainer decision.

GitHub Actions CI validates the codebase, but does **not** publish npm artifacts or claim the package name. A publisher with appropriate npm access is required.
