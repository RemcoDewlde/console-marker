/**
 * MC/DC coverage for src/builder.ts
 *
 * Builder fn closure decisions:
 *   D1: typeof first === 'string'                          (string fast-path)
 *   D2: first !== null && typeof first === 'object'
 *       && 'raw' in (first as object)                     (tagged template path)
 *       — three independent conditions
 *   D3: isRoot || !str                                     (early return for root/empty)
 *
 * resolveDynamic decisions:
 *   D4: level === 3                                        (truecolor)
 *   D5: level === 2                                        (256-color)
 *   D6: type === 'bgRgb'                                   (bg vs fg in ansi16 path)
 *
 * Cache:
 *   D7: builderCache hit vs miss
 */
import { describe, it, expect } from 'vitest';
import { createRootBuilder } from '../src/builder.js';

// ── D1: typeof first === 'string' ─────────────────────────────────────────────

describe('builder fn — D1 string fast-path', () => {
  const m = createRootBuilder(3);

  // D1=T: normal string call
  it('applies style to a string argument', () => {
    expect(m.red('hello')).toBe('\x1b[31mhello\x1b[39m');
  });

  // D1=F, D2=T: tagged template literal
  it('applies style via tagged template literal', () => {
    const name = 'world';
    expect(m.red`Hello ${name}!`).toBe('\x1b[31mHello world!\x1b[39m');
  });
});

// ── D2: tagged template path — three independent conditions ───────────────────

describe('builder fn — D2 tagged template conditions', () => {
  const m = createRootBuilder(3);

  // D2a=F: first is null → else branch → String(null) = '' → ''
  it('[first=null] returns empty string', () => {
    // Call with null as first positional arg, bypassing TypeScript
    const fn = m.red as unknown as (...a: unknown[]) => string;
    expect(fn(null)).toBe('');
  });

  // D2a=T, D2b=F: first is a number (typeof !== 'object') → else branch
  it('[first=number] coerces to string', () => {
    const fn = m.red as unknown as (...a: unknown[]) => string;
    expect(fn(42)).toBe('\x1b[31m42\x1b[39m');
  });

  // D2a=T, D2b=T, D2c=F: first is object without 'raw' → else branch
  it('[first=plain object without raw] coerces via String()', () => {
    const fn = m.red as unknown as (...a: unknown[]) => string;
    const obj = { toString: () => 'obj' };
    // Should coerce: '' + obj = '[object Object]'
    const result = fn(obj);
    expect(result).toContain('\x1b[31m');
  });

  // D2a=T, D2b=T, D2c=T: TemplateStringsArray (has 'raw') → tagged template path
  it('[TemplateStringsArray] assembles interpolations', () => {
    const tsa = Object.assign(['Hello ', '!'], { raw: ['Hello ', '!'] }) as TemplateStringsArray;
    const fn = m.red as unknown as (s: TemplateStringsArray, ...v: unknown[]) => string;
    expect(fn(tsa, 'world')).toBe('\x1b[31mHello world!\x1b[39m');
  });

  // Template with empty first segment
  it('[tagged template, empty first slot] handles undefined tsa[0]', () => {
    const result = m.red`${'only'}`;
    expect(result).toBe('\x1b[31monly\x1b[39m');
  });

  // tsa[0] === undefined → ?? '' fallback (line 221)
  it('[tsa[0]=undefined] falls back to empty string for first slot', () => {
    const tsa = Object.assign([undefined, '!'], { raw: [undefined, '!'] }) as unknown as TemplateStringsArray;
    const fn = m.red as unknown as (s: TemplateStringsArray, ...v: unknown[]) => string;
    expect(fn(tsa, 'world')).toBe('\x1b[31mworld!\x1b[39m');
  });

  // tsa[i] === undefined mid-array → ?? '' fallback (line 222)
  it('[tsa[i]=undefined] falls back to empty string for middle slot', () => {
    const tsa = Object.assign(['prefix', undefined, 'suffix'], { raw: ['prefix', undefined, 'suffix'] }) as unknown as TemplateStringsArray;
    const fn = m.red as unknown as (s: TemplateStringsArray, ...v: unknown[]) => string;
    // i=1: str += String(args[1]) + (tsa[1] ?? '') = String('mid') + '' = 'mid'
    // i=2: str += String(args[2]) + (tsa[2] ?? '') = String(undefined) + 'suffix'
    expect(fn(tsa, 'mid', undefined)).toBe('\x1b[31mprefixmidundefinedsuffix\x1b[39m');
  });
});

// ── D3: isRoot || !str ────────────────────────────────────────────────────────

describe('builder fn — D3 early return', () => {
  // D3a=T (isRoot=true): root builder never applies styling
  it('[isRoot] root builder returns string as-is', () => {
    const root = createRootBuilder(3);
    expect(root('hello')).toBe('hello');
  });

  // D3b=T (isRoot=false, str empty): non-root with empty string
  it('[isRoot=false, empty str] returns empty string without wrapping', () => {
    const m = createRootBuilder(3);
    expect(m.red('')).toBe('');
  });

  // D3=F (isRoot=false, str non-empty): style is applied
  it('[isRoot=false, non-empty str] applies style', () => {
    const m = createRootBuilder(3);
    expect(m.bold('x')).toBe('\x1b[1mx\x1b[22m');
  });
});

// ── D4/D5/D6: resolveDynamic ──────────────────────────────────────────────────

describe('resolveDynamic — D4 level 3 (truecolor)', () => {
  const m = createRootBuilder(3);

  it('[level=3, rgb] emits 38;2 truecolor sequence', () => {
    expect(m.rgb(255, 0, 0)('x')).toBe('\x1b[38;2;255;0;0mx\x1b[39m');
  });
  it('[level=3, bgRgb] emits 48;2 truecolor bg sequence', () => {
    expect(m.bgRgb(0, 255, 0)('x')).toBe('\x1b[48;2;0;255;0mx\x1b[49m');
  });
  it('[level=3, hex] converts hex and emits truecolor', () => {
    expect(m.hex('#FF0000')('x')).toBe('\x1b[38;2;255;0;0mx\x1b[39m');
  });
  it('[level=3, bgHex] converts hex and emits truecolor bg', () => {
    expect(m.bgHex('#00FF00')('x')).toBe('\x1b[48;2;0;255;0mx\x1b[49m');
  });
});

describe('resolveDynamic — D5 level 2 (256-color)', () => {
  const m = createRootBuilder(2);

  it('[level=2, rgb] emits 38;5 256-color sequence', () => {
    expect(m.rgb(255, 0, 0)('x')).toMatch(/^\x1b\[38;5;\d+mx\x1b\[39m$/);
  });
  it('[level=2, bgRgb] emits 48;5 256-color bg sequence', () => {
    expect(m.bgRgb(0, 0, 255)('x')).toMatch(/^\x1b\[48;5;\d+mx\x1b\[49m$/);
  });
  it('[level=2, hex] downsample to 256-color', () => {
    expect(m.hex('#FF0000')('x')).toMatch(/^\x1b\[38;5;\d+mx\x1b\[39m$/);
  });
  it('[level=2, bgHex] downsample bg to 256-color', () => {
    expect(m.bgHex('#0000FF')('x')).toMatch(/^\x1b\[48;5;\d+mx\x1b\[49m$/);
  });
});

describe('resolveDynamic — D6 level 1 (16-color, D6 bg vs fg)', () => {
  const m = createRootBuilder(1);

  // D6=F: type==='rgb' → fg code (30–37 / 90–97)
  it('[level=1, rgb fg] emits ansi16 fg sequence', () => {
    const result = m.rgb(255, 0, 0)('x');
    // Should be \x1b[<code>mx\x1b[39m
    expect(result).toMatch(/^\x1b\[\d+mx\x1b\[39m$/);
  });

  // D6=T: type==='bgRgb' → bg code (code + 10), close \x1b[49m
  it('[level=1, bgRgb bg] emits ansi16 bg sequence', () => {
    const result = m.bgRgb(255, 0, 0)('x');
    expect(result).toMatch(/^\x1b\[\d+mx\x1b\[49m$/);
  });

  // Level 0 also uses the ansi16 code path (but applyStyle returns early)
  it('[level=0, rgb] returns string unchanged (level-0 passthrough)', () => {
    const m0 = createRootBuilder(0);
    expect(m0.rgb(255, 0, 0)('x')).toBe('x');
  });
});

// ── D7: builder dedup cache ───────────────────────────────────────────────────

describe('builder cache', () => {
  it('[cache hit] same chain returns identical object reference', () => {
    const m = createRootBuilder(3);
    expect(m.red.bold).toBe(m.red.bold);
  });

  it('[cache hit across roots] same level + chain → same object', () => {
    const a = createRootBuilder(3);
    const b = createRootBuilder(3);
    // Both red.bold chains at level 3 share the same cached builder
    expect(a.red.bold).toBe(b.red.bold);
  });

  it('[cache miss] different level → different object', () => {
    const m2 = createRootBuilder(2);
    const m3 = createRootBuilder(3);
    expect(m2.red.bold).not.toBe(m3.red.bold);
  });

  it('[cache miss] different chain → different object', () => {
    const m = createRootBuilder(3);
    expect(m.red.bold).not.toBe(m.bold.red);
  });
});

// ── Dynamic method getter caching ─────────────────────────────────────────────

describe('dynamic method getter caching', () => {
  const m = createRootBuilder(3);

  it('rgb getter is stable across accesses', () => {
    const fn1 = m.rgb;
    const fn2 = m.rgb;
    expect(fn1).toBe(fn2);
  });

  it('bgRgb getter is stable', () => {
    expect(m.bgRgb).toBe(m.bgRgb);
  });

  it('hex getter is stable', () => {
    expect(m.hex).toBe(m.hex);
  });

  it('bgHex getter is stable', () => {
    expect(m.bgHex).toBe(m.bgHex);
  });

  it('ansi256 getter is stable', () => {
    expect(m.ansi256).toBe(m.ansi256);
  });

  it('bgAnsi256 getter is stable', () => {
    expect(m.bgAnsi256).toBe(m.bgAnsi256);
  });
});

// ── Level property propagation ────────────────────────────────────────────────

describe('level property on chained builders', () => {
  it('level propagates through arbitrarily deep chains', () => {
    const m = createRootBuilder(2);
    expect(m.red.bold.underline.level).toBe(2);
  });

  it('level is correct on dynamic color builders', () => {
    const m = createRootBuilder(1);
    expect(m.rgb(255, 0, 0).level).toBe(1);
  });
});

// ── All named ANSI styles ─────────────────────────────────────────────────────

describe('all ANSI style getters emit correct sequences', () => {
  const m = createRootBuilder(3);

  const cases: [string, string, string][] = [
    ['reset',         '\x1b[0m',   '\x1b[0m'],
    ['dim',           '\x1b[2m',   '\x1b[22m'],
    ['italic',        '\x1b[3m',   '\x1b[23m'],
    ['underline',     '\x1b[4m',   '\x1b[24m'],
    ['overline',      '\x1b[53m',  '\x1b[55m'],
    ['inverse',       '\x1b[7m',   '\x1b[27m'],
    ['hidden',        '\x1b[8m',   '\x1b[28m'],
    ['strikethrough', '\x1b[9m',   '\x1b[29m'],
    ['black',         '\x1b[30m',  '\x1b[39m'],
    ['green',         '\x1b[32m',  '\x1b[39m'],
    ['yellow',        '\x1b[33m',  '\x1b[39m'],
    ['blue',          '\x1b[34m',  '\x1b[39m'],
    ['magenta',       '\x1b[35m',  '\x1b[39m'],
    ['cyan',          '\x1b[36m',  '\x1b[39m'],
    ['white',         '\x1b[37m',  '\x1b[39m'],
    ['gray',          '\x1b[90m',  '\x1b[39m'],
    ['grey',          '\x1b[90m',  '\x1b[39m'],
    ['blackBright',   '\x1b[90m',  '\x1b[39m'],
    ['redBright',     '\x1b[91m',  '\x1b[39m'],
    ['greenBright',   '\x1b[92m',  '\x1b[39m'],
    ['yellowBright',  '\x1b[93m',  '\x1b[39m'],
    ['blueBright',    '\x1b[94m',  '\x1b[39m'],
    ['magentaBright', '\x1b[95m',  '\x1b[39m'],
    ['cyanBright',    '\x1b[96m',  '\x1b[39m'],
    ['whiteBright',   '\x1b[97m',  '\x1b[39m'],
    ['bgBlack',       '\x1b[40m',  '\x1b[49m'],
    ['bgRed',         '\x1b[41m',  '\x1b[49m'],
    ['bgGreen',       '\x1b[42m',  '\x1b[49m'],
    ['bgYellow',      '\x1b[43m',  '\x1b[49m'],
    ['bgBlue',        '\x1b[44m',  '\x1b[49m'],
    ['bgMagenta',     '\x1b[45m',  '\x1b[49m'],
    ['bgCyan',        '\x1b[46m',  '\x1b[49m'],
    ['bgWhite',       '\x1b[47m',  '\x1b[49m'],
    ['bgGray',        '\x1b[100m', '\x1b[49m'],
    ['bgGrey',        '\x1b[100m', '\x1b[49m'],
    ['bgBlackBright', '\x1b[100m', '\x1b[49m'],
    ['bgRedBright',   '\x1b[101m', '\x1b[49m'],
    ['bgGreenBright', '\x1b[102m', '\x1b[49m'],
    ['bgYellowBright','\x1b[103m', '\x1b[49m'],
    ['bgBlueBright',  '\x1b[104m', '\x1b[49m'],
    ['bgMagentaBright','\x1b[105m','\x1b[49m'],
    ['bgCyanBright',  '\x1b[106m', '\x1b[49m'],
    ['bgWhiteBright', '\x1b[107m', '\x1b[49m'],
  ];

  for (const [name, open, close] of cases) {
    it(`${name} wraps with correct ANSI codes`, () => {
      const builder = (m as unknown as Record<string, (s: string) => string>)[name]!;
      expect(builder('x')).toBe(`${open}x${close}`);
    });
  }
});
