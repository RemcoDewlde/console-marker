import { encaseNewlines } from './utils.js';

export function applyStyle(
  openAll: string,
  closeAll: string,
  chainCloses: readonly string[],
  chainOpens: readonly string[],
  level: number,
  str: string,
): string {
  if (level === 0 || str.length === 0) return str;

  // Native includes/indexOf use SIMD in V8 — far faster than a JS loop for long strings.
  if (str.includes('\x1b')) {
    for (let i = 0; i < chainCloses.length; i++) {
      const close = chainCloses[i]!;
      if (str.includes(close)) {
        str = str.replaceAll(close, close + chainOpens[i]!);
      }
    }
  }

  const newlineIdx = str.indexOf('\n');
  if (newlineIdx !== -1) {
    str = encaseNewlines(str, closeAll, openAll, newlineIdx);
  }

  return openAll + str + closeAll;
}
