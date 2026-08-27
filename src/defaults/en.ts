/**
 * Default English profanity rules.
 *
 * The word-boundary matcher already neutralises the classic substring traps
 * (`Scunthorpe`, `class`, `assignment`, `analysis`), so no bare `ass` rule is
 * shipped. `cock` is omitted because of `cockpit` / `cockroach` / `peacock`.
 */
export const EN_WORDS: readonly string[] = [
  'fuck',
  'motherfucker',
  'shit',
  'bullshit',
  'bitch',
  'asshole',
  'dick',
  'dickhead',
  'pussy',
  'bastard',
  'whore',
  'slut',
  'cunt',
  'nigger',
  'nigga',
  'faggot',
  'retard',
  'wanker',
];
