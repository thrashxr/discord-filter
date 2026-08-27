## [2026-08-27] [Claude]
**Görev:** discord-filter v2 — TypeScript'e tam yeniden yazım, bypass tespiti, kategori ayrımı, test + build altyapısı.
**Değişen dosyalar:**
- Deleted: index.js, index.d.ts, src/Filter.js, src/utils.js, src/defaults.js — v1 JS kaynağı TS'e taşındı
- Created: src/index.ts, src/Filter.ts, src/types.ts — yeni public API (check, checkAll, add/remove/clear Word/Link/Invite)
- Created: src/normalization/{normalize,separators,repeated,leetspeak,homoglyphs}.ts — offset-haritalı normalize hattı
- Created: src/matchers/{profanity,url}.ts — boundary-aware eşleştirme + gerçek URL/invite tespiti, init'te derlenen kurallar
- Created: src/defaults/{tr,en,index}.ts — false-positive'e göre elenmiş listeler + allowlist + invite hostları
- Created: test/*.test.ts (6 dosya, 127 test) — false-positive regresyon, bypass, URL, invite, API, normalize
- Created: bench/filter.bench.ts — mesaj boyutu / kural sayısı / derleme maliyeti benchmarkları
- Modified: package.json — v2.0.0, type:module, exports/main/module/types/files/engines/sideEffects/repository/homepage/bugs, discord.js runtime bağımlılığı kaldırıldı, tsup+vitest+eslint devDeps
- Modified: README.md, changelog.md — davranışa uygun yeniden yazım, v1→v2 migration
- Created: tsconfig.json, tsup.config.ts, .eslintrc.cjs, .gitignore, .npmignore, LICENSE
**Notlar:** Kırıcı tek değişiklik: `type: 'ad'` kaldırıldı → `'link'` / `'invite'`. Türkçe folding seçici: ı/İ/I/ş → ASCII, ama ç/ğ/ö/ü korunur (piç→pic, göt→got çakışmasını önlemek için). Separator zinciri yalnız tutarlı ayraç + tek harf dizilerinde sıkışır. Kısa kurallar (≤3) iki yanlı boundary ister. npm'e publish YAPILMADI.
