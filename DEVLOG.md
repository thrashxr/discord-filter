## [2026-08-27] [Claude]
**Görev:** discord-filter v2.0.0 yayın öncesi doğrulama — gerçek npm tarball tüketici testleri, Node sürüm matrisi, export denetimi, kalan risklerin kapatılması.
**Değişen dosyalar:**
- Modified: src/defaults/index.ts, src/index.ts, src/Filter.ts — `DEFAULT_ALLOWLIST` → `DEFAULT_ALLOWLIST_WORDS` (isim tutarlılığı, `_WORDS` ekli diğerleriyle uyum); kullanılmayan `DEFAULT_LINK_HOSTS` silindi
- Modified: package.json — `exports` koşullu tiplerle yeniden yazıldı (import→d.ts, require→d.cts); NodeNext CJS tüketicide TS1479 hatası düzeldi
- Modified: src/matchers/profanity.ts, src/normalization/normalize.ts — tekrar-karakter tespiti iki varyantlı literal eşleştirmeye taşındı (3+ ve 2+ collapse); `saaalaak` gibi karışık kaçışlar artık yakalanıyor, 10k kural perf regresyonu yok
- Deleted: src/normalization/repeated.ts — mantık `collapseRuns(minRun)` olarak normalize.ts'e taşındı
- Modified: src/types.ts — yorum yazım hatası ("bl!ocklisted" → "blocklisted")
- Modified: src/defaults/tr.ts — ASCII/TR ikili girişlerin neden tutulduğuna dair not
- Modified: README.md — export sabitleri bölümü, invite örneğinde endIndex 31→32 düzeltmesi
- Created: test/exports.test.ts (6 test), test/index-integrity.test.ts (22 test) — public export yüzeyi + slice(index,endIndex)===matchedText doğrulaması
- Modified: test/profanity.test.ts, test/false-positives.test.ts, test/normalization.test.ts — mixed-repeat bypass + çift harfli kelime (committee/possess/balloon) regresyonları
**Notlar:** 8 dosya / 165 test geçiyor. Gerçek tarball ile CommonJS + ESM + TypeScript (NodeNext/Bundler/Node16, skipLibCheck:false) tüketicileri doğrulandı. Node 18/20/22/24 CJS+ESM smoke + Node 26 tam suite geçti. `npm audit --omit=dev` → 0 açık (5 açık yalnız devDependencies/eslint8 zincirinde, pakete girmiyor). Runtime bağımlılığı: 0. Karar: READY TO PUBLISH 2.0.0. Publish/tag/release YAPILMADI.

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
