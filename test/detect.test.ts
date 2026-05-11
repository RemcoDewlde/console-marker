/**
 * MC/DC coverage for src/detect.ts
 *
 * parseForceColor():
 *   D1: val==='true' || val==='1'    → 1
 *   D2: val==='2'                    → 2
 *   D3: val==='3'                    → 3
 *   D4: val==='false' || val==='0'   → 0
 *   else                             → undefined
 *
 * hasFlag(flag):
 *   D1: argv.includes(--flag) || argv.includes(--flag=true)
 *
 * detectLevel(stream):
 *   D1: forced !== undefined
 *   D2: hasFlag(no-color) || hasFlag(no-colors) || NO_COLOR in env
 *   D3: hasFlag(color=16m) || hasFlag(color=full) || hasFlag(color=truecolor)
 *   D4: hasFlag(color=256)
 *   D5: hasFlag(color) || hasFlag(colors)
 *   D6: !stream?.isTTY
 *   D7/D8/D9: color depth >= 24 / >= 8 / >= 4
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { parseForceColor, hasFlag, detectLevel, toWriteStream } from '../src/detect.js';
import type tty from 'node:tty';

// ── toWriteStream ─────────────────────────────────────────────────────────────
// Branch: stream instanceof tty.WriteStream → true / false

import ttyModule from 'node:tty';

describe('toWriteStream', () => {
  // False branch: non-TTY stream → undefined
  it('returns undefined for a plain object (non-TTY)', () => {
    const plain = {} as NodeJS.WriteStream;
    expect(toWriteStream(plain)).toBeUndefined();
  });

  // True branch: actual tty.WriteStream instance → returned as-is
  it('returns the stream when it is a tty.WriteStream instance', () => {
    // Construct a minimal WriteStream backed by a real fd would require a PTY.
    // Instead: create an object whose prototype IS tty.WriteStream.prototype
    // so that instanceof passes.
    const fake = Object.create(ttyModule.WriteStream.prototype) as tty.WriteStream;
    expect(toWriteStream(fake as unknown as NodeJS.WriteStream)).toBe(fake);
  });
});

// ── parseForceColor ───────────────────────────────────────────────────────────

describe('parseForceColor', () => {
  const orig = process.env['FORCE_COLOR'];
  afterEach(() => {
    if (orig === undefined) delete process.env['FORCE_COLOR'];
    else process.env['FORCE_COLOR'] = orig;
  });

  const set = (v: string | undefined) => {
    if (v === undefined) delete process.env['FORCE_COLOR'];
    else process.env['FORCE_COLOR'] = v;
  };

  // D1a: 'true' → 1
  it("'true' → 1", () => { set('true'); expect(parseForceColor()).toBe(1); });
  // D1b: '1' → 1 (second OR condition, independent of first)
  it("'1' → 1", () => { set('1'); expect(parseForceColor()).toBe(1); });
  // D2: '2' → 2
  it("'2' → 2", () => { set('2'); expect(parseForceColor()).toBe(2); });
  // D3: '3' → 3
  it("'3' → 3", () => { set('3'); expect(parseForceColor()).toBe(3); });
  // D4a: 'false' → 0
  it("'false' → 0", () => { set('false'); expect(parseForceColor()).toBe(0); });
  // D4b: '0' → 0 (second OR condition, independent of first)
  it("'0' → 0", () => { set('0'); expect(parseForceColor()).toBe(0); });
  // else: unrecognised value → undefined
  it("unrecognised value → undefined", () => { set('yes'); expect(parseForceColor()).toBeUndefined(); });
  // else: not set → undefined
  it("not set → undefined", () => { set(undefined); expect(parseForceColor()).toBeUndefined(); });
});

// ── hasFlag ───────────────────────────────────────────────────────────────────

describe('hasFlag', () => {
  const origArgv = process.argv;
  afterEach(() => { (process as NodeJS.Process).argv = origArgv; });

  // D1a: --flag present (no =true suffix) → true
  it('finds --flag without =true', () => {
    process.argv = ['node', 'script', '--color'];
    expect(hasFlag('color')).toBe(true);
  });

  // D1b: --flag=true present → true (second OR condition)
  it('finds --flag=true', () => {
    process.argv = ['node', 'script', '--color=true'];
    expect(hasFlag('color')).toBe(true);
  });

  // D1a=F, D1b=F: flag absent → false
  it('returns false when flag absent', () => {
    process.argv = ['node', 'script'];
    expect(hasFlag('color')).toBe(false);
  });

  // Unrelated flags don't interfere
  it('does not match partial flag names', () => {
    process.argv = ['node', 'script', '--colors'];
    expect(hasFlag('color')).toBe(false);
  });
});

// ── detectLevel ───────────────────────────────────────────────────────────────

describe('detectLevel', () => {
  const origArgv = process.argv;
  const origEnv  = { ...process.env };

  beforeEach(() => {
    // Clean slate: no FORCE_COLOR, no NO_COLOR, no color flags
    delete process.env['FORCE_COLOR'];
    delete process.env['NO_COLOR'];
    process.argv = ['node', 'script'];
  });

  afterEach(() => {
    (process as NodeJS.Process).argv = origArgv;
    // Restore env
    for (const key of ['FORCE_COLOR', 'NO_COLOR']) {
      if (key in origEnv) process.env[key] = origEnv[key];
      else delete process.env[key];
    }
  });

  const fakeTTY = (depth: number): tty.WriteStream =>
    ({ isTTY: true, getColorDepth: () => depth } as unknown as tty.WriteStream);

  const noTTY = (): tty.WriteStream =>
    ({ isTTY: false } as unknown as tty.WriteStream);

  // D1=T: FORCE_COLOR overrides everything
  it('[FORCE_COLOR=3] returns 3 regardless of stream', () => {
    process.env['FORCE_COLOR'] = '3';
    expect(detectLevel(undefined)).toBe(3);
  });
  it('[FORCE_COLOR=0] returns 0 even for a truecolor TTY', () => {
    process.env['FORCE_COLOR'] = '0';
    expect(detectLevel(fakeTTY(24))).toBe(0);
  });

  // D2a: --no-color → 0
  it('[--no-color] returns 0', () => {
    process.argv = ['node', 'script', '--no-color'];
    expect(detectLevel(fakeTTY(24))).toBe(0);
  });

  // D2b: --no-colors → 0 (independent of --no-color)
  it('[--no-colors] returns 0', () => {
    process.argv = ['node', 'script', '--no-colors'];
    expect(detectLevel(fakeTTY(24))).toBe(0);
  });

  // D2c: NO_COLOR env → 0 (independent condition)
  it('[NO_COLOR env] returns 0', () => {
    process.env['NO_COLOR'] = '1';
    expect(detectLevel(fakeTTY(24))).toBe(0);
  });

  // D3a: --color=16m → 3
  it('[--color=16m] returns 3', () => {
    process.argv = ['node', 'script', '--color=16m'];
    expect(detectLevel(undefined)).toBe(3);
  });

  // D3b: --color=full → 3 (independent condition)
  it('[--color=full] returns 3', () => {
    process.argv = ['node', 'script', '--color=full'];
    expect(detectLevel(undefined)).toBe(3);
  });

  // D3c: --color=truecolor → 3 (independent condition)
  it('[--color=truecolor] returns 3', () => {
    process.argv = ['node', 'script', '--color=truecolor'];
    expect(detectLevel(undefined)).toBe(3);
  });

  // D4: --color=256 → 2
  it('[--color=256] returns 2', () => {
    process.argv = ['node', 'script', '--color=256'];
    expect(detectLevel(undefined)).toBe(2);
  });

  // D5a: --color → 1
  it('[--color] returns 1', () => {
    process.argv = ['node', 'script', '--color'];
    expect(detectLevel(undefined)).toBe(1);
  });

  // D5b: --colors → 1 (independent condition)
  it('[--colors] returns 1', () => {
    process.argv = ['node', 'script', '--colors'];
    expect(detectLevel(undefined)).toBe(1);
  });

  // D6a: stream is undefined → 0
  it('[stream=undefined] returns 0', () => {
    expect(detectLevel(undefined)).toBe(0);
  });

  // D6b: stream.isTTY === false → 0
  it('[isTTY=false] returns 0', () => {
    expect(detectLevel(noTTY())).toBe(0);
  });

  // D7: TTY, colors >= 24 → 3
  it('[TTY, depth=24] returns 3', () => {
    expect(detectLevel(fakeTTY(24))).toBe(3);
  });

  // D8: TTY, 8 ≤ colors < 24 → 2
  it('[TTY, depth=8] returns 2', () => {
    expect(detectLevel(fakeTTY(8))).toBe(2);
  });

  // D9: TTY, 4 ≤ colors < 8 → 1
  it('[TTY, depth=4] returns 1', () => {
    expect(detectLevel(fakeTTY(4))).toBe(1);
  });

  // D9=F: TTY, colors < 4 → 0
  it('[TTY, depth=1] returns 0', () => {
    expect(detectLevel(fakeTTY(1))).toBe(0);
  });
});
