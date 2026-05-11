// Single-pass scan: returns [firstEscapeIdx, firstNewlineIdx] in one traversal.
// Both -1 when not found. Early-exits once both are located.
export function scanString(str: string): [number, number] {
  let escapeIdx = -1;
  let newlineIdx = -1;
  for (let i = 0, len = str.length; i < len; i++) {
    const c = str.charCodeAt(i);
    if (c === 27 && escapeIdx === -1) escapeIdx = i;
    else if (c === 10 && newlineIdx === -1) newlineIdx = i;
    if (escapeIdx !== -1 && newlineIdx !== -1) break;
  }
  return [escapeIdx, newlineIdx];
}

// Re-opens/closes styles around every \n (and \r\n) in the string so that
// styling doesn't bleed across lines in macOS Terminal.
export function encaseNewlines(str: string, prefix: string, postfix: string, firstIdx: number): string {
  let endIndex = 0;
  let result = '';
  let idx = firstIdx;
  do {
    const hasCR = str.charCodeAt(idx - 1) === 13; // \r
    result += str.slice(endIndex, hasCR ? idx - 1 : idx) + prefix + (hasCR ? '\r\n' : '\n') + postfix;
    endIndex = idx + 1;
    idx = str.indexOf('\n', endIndex);
  } while (idx !== -1);
  return result + str.slice(endIndex);
}
