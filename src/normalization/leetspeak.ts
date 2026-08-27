/**
 * Conservative leetspeak substitutions. Only the widely-agreed mappings are
 * included; ambiguous ones (`5->s`, `7->t`, `2->z`, ...) are intentionally left
 * out because they cause false positives far more often than real detections.
 */
const LEET: Record<string, string> = {
  '4': 'a',
  '@': 'a',
  '3': 'e',
  '1': 'i',
  '!': 'i',
  '0': 'o',
  '$': 's',
};

export function foldLeet(ch: string): string {
  return LEET[ch] ?? ch;
}
