/**
 * MC/DC coverage for src/apply.ts — applyStyle()
 *
 * Decision map:
 *   D1: level === 0 || str.length === 0   (early return, two independent conditions)
 *   D2: str.includes('\x1b')              (embedded escape path)
 *   D3: str.includes(close)  [per-style]  (replaceAll gate)
 *   D4: newlineIdx !== -1                 (newline path)
 */
import { describe, it, expect } from 'vitest';
import { applyStyle } from '../src/apply.js';

const OPEN  = '\x1b[1m';   // bold open
const CLOSE = '\x1b[22m';  // bold close
const OPENS  = [OPEN];
const CLOSES = [CLOSE];

// ── D1: early-return guard ────────────────────────────────────────────────────

describe('applyStyle — D1 early return', () => {
  // A=T (level===0), B doesn't matter → passthrough
  it('[level=0, str non-empty] returns str unchanged', () => {
    expect(applyStyle(OPEN, CLOSE, CLOSES, OPENS, 0, 'hello')).toBe('hello');
  });

  // A=F (level≠0), B=T (str empty) → passthrough
  it('[level=3, str empty] returns empty string unchanged', () => {
    expect(applyStyle(OPEN, CLOSE, CLOSES, OPENS, 3, '')).toBe('');
  });

  // A=F, B=F → proceeds to styling
  it('[level=3, str non-empty] wraps string', () => {
    expect(applyStyle(OPEN, CLOSE, CLOSES, OPENS, 3, 'x')).toBe(`${OPEN}x${CLOSE}`);
  });
});

// ── D2: embedded escape branch ────────────────────────────────────────────────

describe('applyStyle — D2 embedded escape', () => {
  // D2=F: no escape codes — skip loop entirely
  it('[no escape] plain string is just wrapped', () => {
    const result = applyStyle(OPEN, CLOSE, CLOSES, OPENS, 3, 'hello');
    expect(result).toBe(`${OPEN}hello${CLOSE}`);
  });

  // D2=T, D3=F: escape present but not our close code → no replaceAll
  it('[escape present, different close] does not alter content', () => {
    // The inner string has \x1b[39m (fg close) but our chain close is \x1b[22m (bold)
    const inner = '\x1b[31mred\x1b[39m'; // red text — no bold close inside
    const result = applyStyle(OPEN, CLOSE, CLOSES, OPENS, 3, inner);
    // Content unchanged, just wrapped
    expect(result).toBe(`${OPEN}${inner}${CLOSE}`);
  });

  // D2=T, D3=T: escape present AND matches our close → re-opens after close
  it('[escape present, matching close] re-opens style after embedded close', () => {
    const inner = `${OPEN}inner${CLOSE}`; // bold wrapped inside
    const result = applyStyle(OPEN, CLOSE, CLOSES, OPENS, 3, inner);
    // The inner \x1b[22m should be followed by re-open \x1b[1m
    expect(result).toContain(`${CLOSE}${OPEN}`);
  });
});

// ── D3: per-style close gate (multiple styles in chain) ───────────────────────

describe('applyStyle — D3 per-style include gate with chained styles', () => {
  // Chain: bold + red. Opens: [bold, red], Closes: [bold, red]
  const boldOpen  = '\x1b[1m',  boldClose  = '\x1b[22m';
  const redOpen   = '\x1b[31m', redClose   = '\x1b[39m';
  const chainOpens  = [boldOpen, redOpen];
  const chainCloses = [boldClose, redClose];
  const openAll  = boldOpen + redOpen;
  const closeAll = redClose + boldClose;

  it('[only bold close inside] only bold close is re-opened', () => {
    const inner = `word${boldClose}end`; // bold close only, no red close
    const result = applyStyle(openAll, closeAll, chainCloses, chainOpens, 3, inner);
    // bold re-opened after its close; red close absent so not touched
    expect(result).toContain(`${boldClose}${boldOpen}`);
    expect(result).not.toContain(`${redClose}${redOpen}`);
  });

  it('[only red close inside] only red close is re-opened', () => {
    const inner = `word${redClose}end`;
    const result = applyStyle(openAll, closeAll, chainCloses, chainOpens, 3, inner);
    expect(result).toContain(`${redClose}${redOpen}`);
    expect(result).not.toContain(`${boldClose}${boldOpen}`);
  });
});

// ── D4: newline branch ────────────────────────────────────────────────────────

describe('applyStyle — D4 newline', () => {
  // D4=F: no newline
  it('[no newline] result has no extra open/close in middle', () => {
    const result = applyStyle(OPEN, CLOSE, CLOSES, OPENS, 3, 'abc');
    expect(result).toBe(`${OPEN}abc${CLOSE}`);
  });

  // D4=T: newline present → encaseNewlines called
  it('[newline] closes and reopens around \\n', () => {
    const result = applyStyle(OPEN, CLOSE, CLOSES, OPENS, 3, 'a\nb');
    expect(result).toBe(`${OPEN}a${CLOSE}\n${OPEN}b${CLOSE}`);
  });

  // D4=T with CRLF
  it('[CRLF] closes and reopens around \\r\\n', () => {
    const result = applyStyle(OPEN, CLOSE, CLOSES, OPENS, 3, 'a\r\nb');
    expect(result).toBe(`${OPEN}a${CLOSE}\r\n${OPEN}b${CLOSE}`);
  });
});

// ── Combined: embedded escape + newline ───────────────────────────────────────

describe('applyStyle — D2 + D4 combined', () => {
  it('[escape + newline] handles both in one string', () => {
    const inner = `${OPEN}word${CLOSE}\nnext`;
    const result = applyStyle(OPEN, CLOSE, CLOSES, OPENS, 3, inner);
    expect(result).toContain('\n');
    expect(result).toContain(OPEN);
    expect(result).toContain(CLOSE);
  });
});

// ── Level 1 and 2 passthrough (level ≠ 0 still applies style) ─────────────────

describe('applyStyle — levels 1 and 2 emit ANSI', () => {
  it('level 1 wraps string', () => {
    expect(applyStyle(OPEN, CLOSE, CLOSES, OPENS, 1, 'x')).toBe(`${OPEN}x${CLOSE}`);
  });
  it('level 2 wraps string', () => {
    expect(applyStyle(OPEN, CLOSE, CLOSES, OPENS, 2, 'x')).toBe(`${OPEN}x${CLOSE}`);
  });
});
