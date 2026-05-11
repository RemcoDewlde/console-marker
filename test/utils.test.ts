/**
 * MC/DC coverage for src/utils.ts
 */
import { describe, it, expect } from 'vitest';
import { scanString, encaseNewlines } from '../src/utils.js';

// ── scanString ────────────────────────────────────────────────────────────────
// Decisions:
//   D1: c === 27 && escapeIdx === -1   (both conditions independently)
//   D2: c === 10 && newlineIdx === -1  (both conditions independently)
//   D3: escapeIdx !== -1 && newlineIdx !== -1  (early-exit AND)

describe('scanString', () => {
  it('returns [-1,-1] for plain string (no escape, no newline)', () => {
    expect(scanString('hello')).toEqual([-1, -1]);
  });

  // D1: c===27 true, escapeIdx===-1 true → escape recorded
  it('finds escape at correct index', () => {
    const str = 'ab\x1bc';
    const [esc, nl] = scanString(str);
    expect(esc).toBe(2);
    expect(nl).toBe(-1);
  });

  // D1: escapeIdx !== -1 on second escape → guard prevents overwrite
  it('records only the FIRST escape index when multiple escapes exist', () => {
    const str = '\x1ba\x1bb';
    const [esc] = scanString(str);
    expect(esc).toBe(0); // first escape, not second
  });

  // D2: c===10 true, newlineIdx===-1 true → newline recorded
  it('finds newline at correct index', () => {
    const str = 'ab\ncd';
    const [esc, nl] = scanString(str);
    expect(esc).toBe(-1);
    expect(nl).toBe(2);
  });

  // D2: newlineIdx !== -1 on second newline → guard prevents overwrite
  it('records only the FIRST newline index when multiple newlines exist', () => {
    const str = '\nfoo\nbar';
    const [, nl] = scanString(str);
    expect(nl).toBe(0);
  });

  // D3: both found → early exit (we verify by correctness, not timing)
  it('finds both escape and newline', () => {
    const str = '\x1b[31mhello\nworld\x1b[39m';
    const [esc, nl] = scanString(str);
    expect(esc).toBe(0);
    expect(nl).toBe(str.indexOf('\n'));
  });

  // D3: escape after newline — newline found first, then escape, then early exit
  it('handles newline before escape', () => {
    const str = 'line\n\x1b[0m';
    const [esc, nl] = scanString(str);
    expect(nl).toBe(4);
    expect(esc).toBe(5);
  });

  // D1: c===27 but escapeIdx already set — else branch taken (newline check)
  it('subsequent escape char does not update escapeIdx', () => {
    const str = '\x1b\x1b\n'; // two escapes then newline
    const [esc, nl] = scanString(str);
    expect(esc).toBe(0);
    expect(nl).toBe(2);
  });
});

// ── encaseNewlines ────────────────────────────────────────────────────────────
// Decisions:
//   D1: hasCR (str.charCodeAt(idx - 1) === 13)  — LF vs CRLF
//   D2: do-while condition (idx !== -1)          — single vs multiple newlines

describe('encaseNewlines', () => {
  const open  = '\x1b[31m';
  const close = '\x1b[39m';

  // D1 = F: plain LF — hasCR false
  it('[LF] closes and reopens around \\n', () => {
    const result = encaseNewlines('hello\nworld', close, open, 5);
    expect(result).toBe('hello' + close + '\n' + open + 'world');
  });

  // D1 = T: CRLF — hasCR true, strips \r from segment and emits \r\n
  it('[CRLF] closes and reopens around \\r\\n', () => {
    const result = encaseNewlines('hello\r\nworld', close, open, 6);
    expect(result).toBe('hello' + close + '\r\n' + open + 'world');
  });

  // D2 = T more than once: multiple newlines — loop iterates
  it('[multiple LF] encases every newline', () => {
    const result = encaseNewlines('a\nb\nc', close, open, 1);
    expect(result).toBe(
      'a' + close + '\n' + open +
      'b' + close + '\n' + open +
      'c',
    );
  });

  // Mix of CRLF and LF
  it('[mixed CRLF+LF] handles both line endings in one string', () => {
    const result = encaseNewlines('a\r\nb\nc', close, open, 2);
    expect(result).toBe(
      'a' + close + '\r\n' + open +
      'b' + close + '\n' + open +
      'c',
    );
  });

  // Trailing segment: str.slice(endIndex) when no more newlines
  it('preserves trailing text after last newline', () => {
    const result = encaseNewlines('x\ny', close, open, 1);
    expect(result.endsWith(open + 'y')).toBe(true);
  });

  // Newline at position 0 — idx-1 would be -1, charCodeAt(-1) returns NaN ≠ 13
  it('handles newline at start of string (hasCR=false)', () => {
    const result = encaseNewlines('\nworld', close, open, 0);
    expect(result).toBe('' + close + '\n' + open + 'world');
  });
});
