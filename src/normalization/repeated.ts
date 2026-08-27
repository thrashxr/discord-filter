/**
 * Collapse characters repeated three or more times down to a single occurrence
 * (`saaalak` -> `salak`, `fuuuuck` -> `fuck`). Runs of exactly two are kept so
 * ordinary words with double letters (`book`, `class`, `assignment`) are
 * unaffected.
 */
export function collapseRepeated(
  chars: string[],
  map: number[],
): { chars: string[]; map: number[] } {
  const outChars: string[] = [];
  const outMap: number[] = [];

  let runStart = 0;
  while (runStart < chars.length) {
    let runEnd = runStart + 1;
    while (runEnd < chars.length && chars[runEnd] === chars[runStart]) runEnd++;

    const runLength = runEnd - runStart;
    const keep = runLength >= 3 ? 1 : runLength;
    for (let k = 0; k < keep; k++) {
      outChars.push(chars[runStart]!);
      outMap.push(map[runStart + k]!);
    }
    runStart = runEnd;
  }

  return { chars: outChars, map: outMap };
}
