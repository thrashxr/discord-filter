/**
 * Default Turkish profanity rules.
 *
 * Curated for low false-positive risk *after* normalization. Notably absent from
 * v1's list:
 *  - `meme`  — collides with everyday English/Turkish vocabulary.
 *  - `göt`   — folds toward `got`; too collision-prone as a bare rule.
 *  - `kaşar` — very common as a cheese name in ordinary Turkish text.
 *  - `amına` — collides with the given name "Amina".
 *
 * A few entries appear in both Turkish-spelled and ASCII-spelled form
 * (`amcık`/`amcik`, `yavşak`/`yavsak`, `şerefsiz`/`serefsiz`). Under the default
 * normalization they collapse to one compiled rule; the pair only matters when a
 * caller sets `normalization: false`, where the ASCII form keeps coverage for
 * users typing without a Turkish keyboard.
 */
export const TR_WORDS: readonly string[] = [
  'amk',
  'aq',
  'salak',
  'amcık',
  'amcik',
  'sik',
  'siktir',
  'sikeyim',
  'sikik',
  'oç',
  'piç',
  'pezevenk',
  'yarrak',
  'yarak',
  'orospu',
  'kahpe',
  'kaltak',
  'ibne',
  'yavşak',
  'yavsak',
  'götveren',
  'gavat',
  'şerefsiz',
  'serefsiz',
];
