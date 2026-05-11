/**
 * MC/DC coverage for src/ansi.ts
 *
 * Every condition in every decision is exercised independently so that
 * each condition is shown to independently affect the outcome.
 */
import { describe, it, expect } from 'vitest';
import {
  hexToRgb,
  rgbToAnsi256,
  ansi256ToAnsi16,
  rgbToAnsi16Code,
  ansi256Fg,
  ansi256Bg,
  rgbFg,
  rgbBg,
  ANSI,
} from '../src/ansi.js';

// ── ANSI constant table ───────────────────────────────────────────────────────

describe('ANSI constants', () => {
  it('every entry has non-empty open and close strings', () => {
    for (const [name, pair] of Object.entries(ANSI)) {
      expect(pair.open,  `${name}.open`).toMatch(/^\x1b\[/);
      expect(pair.close, `${name}.close`).toMatch(/^\x1b\[/);
    }
  });
});

// ── escape builders ───────────────────────────────────────────────────────────

describe('ansi256Fg / ansi256Bg', () => {
  it('builds fg 256 sequence', () => {
    expect(ansi256Fg(196)).toEqual({ open: '\x1b[38;5;196m', close: '\x1b[39m' });
  });
  it('builds bg 256 sequence', () => {
    expect(ansi256Bg(21)).toEqual({ open: '\x1b[48;5;21m', close: '\x1b[49m' });
  });
});

describe('rgbFg / rgbBg', () => {
  it('builds fg truecolor sequence', () => {
    expect(rgbFg(255, 0, 128)).toEqual({ open: '\x1b[38;2;255;0;128m', close: '\x1b[39m' });
  });
  it('builds bg truecolor sequence', () => {
    expect(rgbBg(0, 128, 255)).toEqual({ open: '\x1b[48;2;0;128;255m', close: '\x1b[49m' });
  });
});

// ── hexToRgb ──────────────────────────────────────────────────────────────────
// Branch: hex string with '#' prefix vs without

describe('hexToRgb', () => {
  it('parses with # prefix', () => {
    expect(hexToRgb('#FF6400')).toEqual([255, 100, 0]);
  });
  it('parses without # prefix', () => {
    expect(hexToRgb('FF6400')).toEqual([255, 100, 0]);
  });
  it('parses black (#000000)', () => {
    expect(hexToRgb('#000000')).toEqual([0, 0, 0]);
  });
  it('parses white (#FFFFFF)', () => {
    expect(hexToRgb('#FFFFFF')).toEqual([255, 255, 255]);
  });
});

// ── rgbToAnsi256 ──────────────────────────────────────────────────────────────
// Decision 1: (r === g && g === b)  — MC/DC requires:
//   A=T independently: r===g is T AND g===b is T  → grayscale path
//   A=F via r≠g                                   → color-cube path
//   B=F via g≠b (with r===g)                      → color-cube path
//
// Inside grayscale branch:
//   Decision 2: r < 8
//   Decision 3: r > 248

describe('rgbToAnsi256', () => {
  // Grayscale — r < 8 (returns 16)
  it('[grayscale, r<8] returns 16 for near-black gray', () => {
    expect(rgbToAnsi256(0, 0, 0)).toBe(16);
    expect(rgbToAnsi256(7, 7, 7)).toBe(16);
  });

  // Grayscale — r > 248 (returns 231)
  it('[grayscale, r>248] returns 231 for near-white gray', () => {
    expect(rgbToAnsi256(255, 255, 255)).toBe(231);
    expect(rgbToAnsi256(249, 249, 249)).toBe(231);
  });

  // Grayscale — 8 ≤ r ≤ 248 (interpolated, 232–255)
  it('[grayscale, 8≤r≤248] returns grayscale ramp index 232+', () => {
    const idx = rgbToAnsi256(128, 128, 128);
    expect(idx).toBeGreaterThanOrEqual(232);
    expect(idx).toBeLessThanOrEqual(255);
  });

  // Non-grayscale: r ≠ g (first AND condition fails)
  it('[non-grayscale, r≠g] returns color-cube index', () => {
    const idx = rgbToAnsi256(255, 0, 0); // pure red
    expect(idx).toBeGreaterThanOrEqual(16);
    expect(idx).toBeLessThanOrEqual(231);
  });

  // Non-grayscale: g ≠ b with r === g (second AND condition fails)
  it('[non-grayscale, r===g but g≠b] returns color-cube index', () => {
    const idx = rgbToAnsi256(100, 100, 200);
    expect(idx).toBeGreaterThanOrEqual(16);
    expect(idx).toBeLessThanOrEqual(231);
  });

  // Color-cube boundary values
  it('pure red (255,0,0) maps to cube index 196', () => {
    expect(rgbToAnsi256(255, 0, 0)).toBe(196);
  });
  it('pure green (0,255,0) maps to cube index 46', () => {
    expect(rgbToAnsi256(0, 255, 0)).toBe(46);
  });
  it('pure blue (0,0,255) maps to cube index 21', () => {
    expect(rgbToAnsi256(0, 0, 255)).toBe(21);
  });
});

// ── ansi256ToAnsi16 ───────────────────────────────────────────────────────────
// Decision 1: code < 8          → 30 + code
// Decision 2: code < 16         → 90 + (code − 8)   [only reached if code ≥ 8]
// Decision 3: code >= 232       → grayscale block
//   F: color cube (16–231)
//
// Inside color cube:
//   value = max(r,g,b)*2 ∈ {0, 1, 2}
//   Decision 4: value === 0     → return 30
//   Decision 5: value === 2     → result += 60 (bright)

describe('ansi256ToAnsi16', () => {
  // code < 8 → basic color range
  it('[code<8] maps 0 → 30', () => expect(ansi256ToAnsi16(0)).toBe(30));
  it('[code<8] maps 7 → 37', () => expect(ansi256ToAnsi16(7)).toBe(37));

  // 8 ≤ code < 16 → bright color range
  it('[8≤code<16] maps 8 → 90', () => expect(ansi256ToAnsi16(8)).toBe(90));
  it('[8≤code<16] maps 15 → 97', () => expect(ansi256ToAnsi16(15)).toBe(97));

  // code >= 232 — grayscale ramp
  it('[code≥232] grayscale near-black returns 30 (value=0)', () => {
    // code=232 → v=8/255≈0.031, r=g=b≈0.031 → value=max*2≈0.063 → round to 0 → return 30
    expect(ansi256ToAnsi16(232)).toBe(30);
  });
  it('[code≥232] grayscale near-white returns white (37)', () => {
    // code=255 → v=((255-232)*10+8)/255=238/255≈0.933, value=0.933*2≈1.867
    // value is never exactly 2 for integer grayscale codes, so no +60 (not bright)
    expect(ansi256ToAnsi16(255)).toBe(37);
  });

  // color cube — value=0 (all channels 0 → black)
  it('[cube, value=0] pure black (code=16) returns 30', () => {
    expect(ansi256ToAnsi16(16)).toBe(30);
  });

  // color cube — value=2 (bright): any pure saturated color at full intensity
  it('[cube, value=2, bright] pure red cube → bright red (91)', () => {
    // code=196 = pure red in cube → r=1,g=0,b=0 → value=2 → result=30+1=31 +60=91
    expect(ansi256ToAnsi16(196)).toBe(91);
  });
  it('[cube, value=2, bright] pure blue cube → bright blue (94)', () => {
    // code=21 = pure blue → r=0,g=0,b=1 → result=30+(1<<2)=34 +60=94
    expect(ansi256ToAnsi16(21)).toBe(94);
  });

  // color cube — value≠0 and value≠2 (dark, non-bright): mid-intensity cube color
  it('[cube, value≠0,≠2] dim color — no +60', () => {
    // code=88 = dark red: c=72, rem=0, r=floor(72/36)/5=0.4, g=0, b=0
    // max=0.4, value=0.8 → round to 1 → no +60
    const result = ansi256ToAnsi16(88);
    // Should be a basic (non-bright) foreground: 30–37
    expect(result).toBeGreaterThanOrEqual(30);
    expect(result).toBeLessThanOrEqual(37);
  });
});

// ── rgbToAnsi16Code ───────────────────────────────────────────────────────────

describe('rgbToAnsi16Code', () => {
  it('composes rgbToAnsi256 + ansi256ToAnsi16 correctly', () => {
    // Pure red → ansi256 index 196 → ansi16 code 91
    expect(rgbToAnsi16Code(255, 0, 0)).toBe(91);
  });
  it('black maps to 30', () => {
    expect(rgbToAnsi16Code(0, 0, 0)).toBe(30);
  });
});
