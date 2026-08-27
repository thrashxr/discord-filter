/**
 * Separator-evasion handling.
 *
 * Detects runs of *single* alphanumeric characters joined by separator
 * characters — `s.a.l.a.k`, `s-a-l-a-k`, `s _ a _ l _ a _ k`, `s a l a k` — and
 * emits the letters with the separators removed. Only runs of at least three
 * single letters are compacted, and only the separators *inside* such a run are
 * dropped, so ordinary prose (`I am`, `a.com`, `e.g. this`) is left untouched.
 */

const SEP = new Set([
  ' ',
  '\t',
  '.',
  ',',
  '-',
  '_',
  '+',
  '*',
  '~',
  '|',
  '/',
  '\\',
  ':',
  ';',
  "'",
  '"',
  '`',
  '·',
  '•',
]);

const ALNUM = /[a-z0-9]/;

interface Token {
  kind: 'alnum' | 'sep' | 'other';
  chars: string[];
  map: number[];
}

/**
 * A separator run's "signature": its punctuation characters with whitespace
 * removed, or `SPACE` when it is whitespace only. A chain only compacts when
 * every separator in it shares one signature, so `a s.a.l.a.k` (space then dots)
 * does not drag the leading `a` into the evasion.
 */
function sepSignature(chars: string[]): string {
  const punct = chars.filter((c) => c.trim() !== '');
  return punct.length === 0 ? 'SPACE' : [...new Set(punct)].sort().join('');
}

function tokenize(chars: string[], map: number[]): Token[] {
  const tokens: Token[] = [];
  let cur: Token | null = null;
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i]!;
    const kind: Token['kind'] = ALNUM.test(ch) ? 'alnum' : SEP.has(ch) ? 'sep' : 'other';
    if (cur && cur.kind === kind && kind !== 'other') {
      cur.chars.push(ch);
      cur.map.push(map[i]!);
    } else {
      cur = { kind, chars: [ch], map: [map[i]!] };
      tokens.push(cur);
      if (kind === 'other') cur = null;
    }
  }
  return tokens;
}

export function compactSeparators(
  chars: string[],
  map: number[],
): { chars: string[]; map: number[] } {
  const tokens = tokenize(chars, map);
  const outChars: string[] = [];
  const outMap: number[] = [];

  let i = 0;
  while (i < tokens.length) {
    const tok = tokens[i]!;

    // Try to start a "single letter + separator" chain at an alnum token of length 1.
    if (tok.kind === 'alnum' && tok.chars.length === 1) {
      const chain: Token[] = [tok];
      let j = i + 1;
      let signature: string | null = null;
      while (
        j + 1 < tokens.length &&
        tokens[j]!.kind === 'sep' &&
        tokens[j + 1]!.kind === 'alnum' &&
        tokens[j + 1]!.chars.length === 1
      ) {
        const sig = sepSignature(tokens[j]!.chars);
        if (signature === null) signature = sig;
        else if (sig !== signature) break;
        chain.push(tokens[j + 1]!);
        j += 2;
      }

      if (chain.length >= 3) {
        for (const letter of chain) {
          outChars.push(letter.chars[0]!);
          outMap.push(letter.map[0]!);
        }
        i = j;
        continue;
      }
    }

    outChars.push(...tok.chars);
    outMap.push(...tok.map);
    i++;
  }

  return { chars: outChars, map: outMap };
}
