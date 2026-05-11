import { describe, it, expect, beforeEach } from 'vitest';
import { withLevel } from '../src/index.js';
import type { Builder } from '../src/builder.js';

// Use level 3 (truecolor) for all output tests so ANSI codes are always emitted
let m: Builder;
beforeEach(() => {
  m = withLevel(3);
});

describe('level 0 passthrough', () => {
  it('returns string unchanged when level is 0', () => {
    const m0 = withLevel(0);
    expect(m0.red('hello')).toBe('hello');
    expect(m0.bold.red('hello')).toBe('hello');
  });

  it('returns empty string unchanged', () => {
    expect(m.red('')).toBe('');
  });
});

describe('single styles', () => {
  it('wraps with bold', () => {
    expect(m.bold('hello')).toBe('\x1b[1mhello\x1b[22m');
  });

  it('wraps with red', () => {
    expect(m.red('hello')).toBe('\x1b[31mhello\x1b[39m');
  });

  it('wraps with bgBlue', () => {
    expect(m.bgBlue('hello')).toBe('\x1b[44mhello\x1b[49m');
  });

  it('wraps with underline', () => {
    expect(m.underline('hello')).toBe('\x1b[4mhello\x1b[24m');
  });

  it('gray is alias for blackBright', () => {
    expect(m.gray('x')).toBe(m.blackBright('x'));
  });
});

describe('chaining', () => {
  it('chains bold + red', () => {
    const result = m.bold.red('hello');
    expect(result).toBe('\x1b[1m\x1b[31mhello\x1b[39m\x1b[22m');
  });

  it('chains three styles', () => {
    const result = m.bold.red.underline('hi');
    expect(result).toBe('\x1b[1m\x1b[31m\x1b[4mhi\x1b[24m\x1b[39m\x1b[22m');
  });

  it('same chain returns same builder reference (caching)', () => {
    const a = m.red.bold;
    const b = m.red.bold;
    expect(a).toBe(b);
  });

  it('different order of same styles produces different builders', () => {
    const ab = m.red.bold;
    const ba = m.bold.red;
    // Different ANSI ordering — they ARE different builders
    expect(ab).not.toBe(ba);
    expect(ab('x')).not.toBe(ba('x'));
  });
});

describe('dynamic colors — rgb', () => {
  it('emits truecolor sequence at level 3', () => {
    const result = m.rgb(255, 100, 0)('hello');
    expect(result).toBe('\x1b[38;2;255;100;0mhello\x1b[39m');
  });

  it('emits 256-color sequence at level 2', () => {
    const m2 = withLevel(2);
    const result = m2.rgb(255, 0, 0)('hello');
    expect(result).toMatch(/\x1b\[38;5;\d+mhello\x1b\[39m/);
  });
});

describe('dynamic colors — hex', () => {
  it('converts hex to truecolor at level 3', () => {
    const result = m.hex('#FF6400')('hello');
    expect(result).toBe('\x1b[38;2;255;100;0mhello\x1b[39m');
  });

  it('hex without # prefix works', () => {
    const result = m.hex('FF6400')('hello');
    expect(result).toBe('\x1b[38;2;255;100;0mhello\x1b[39m');
  });
});

describe('dynamic colors — ansi256', () => {
  it('emits 256-color fg sequence', () => {
    expect(m.ansi256(196)('hello')).toBe('\x1b[38;5;196mhello\x1b[39m');
  });

  it('emits 256-color bg sequence', () => {
    expect(m.bgAnsi256(21)('hello')).toBe('\x1b[48;5;21mhello\x1b[49m');
  });
});

describe('bgRgb / bgHex', () => {
  it('emits truecolor bg sequence', () => {
    expect(m.bgRgb(0, 128, 255)('hello')).toBe('\x1b[48;2;0;128;255mhello\x1b[49m');
  });

  it('emits hex bg sequence', () => {
    expect(m.bgHex('#0080FF')('hello')).toBe('\x1b[48;2;0;128;255mhello\x1b[49m');
  });
});

describe('embedded ANSI codes', () => {
  it('re-opens style around embedded close code', () => {
    const inner = m.red('world');          // \x1b[31mworld\x1b[39m
    const outer = m.bold(inner);
    // bold's close is \x1b[22m; the embedded \x1b[39m is a fg close, not bold's close
    // but if we wrap bold around something that already has bold inside, it should re-open
    const innerBold = m.bold('world');     // \x1b[1mworld\x1b[22m
    const outerBold = m.bold(innerBold);
    // The inner \x1b[22m should be re-opened with \x1b[1m
    expect(outerBold).toContain('\x1b[22m\x1b[1m');
    void outer; // suppress unused warning
  });
});

describe('newline handling', () => {
  it('closes and reopens style around newlines', () => {
    const result = m.red('hello\nworld');
    expect(result).toBe('\x1b[31mhello\x1b[39m\n\x1b[31mworld\x1b[39m');
  });

  it('handles CRLF', () => {
    const result = m.red('hello\r\nworld');
    expect(result).toBe('\x1b[31mhello\x1b[39m\r\n\x1b[31mworld\x1b[39m');
  });

  it('handles multiple newlines', () => {
    const result = m.bold('a\nb\nc');
    const lines = result.split('\n');
    expect(lines).toHaveLength(3);
    for (const line of lines) {
      expect(line).toMatch(/^\x1b\[1m.*\x1b\[22m$/);
    }
  });
});

describe('tagged template literals', () => {
  it('works as a tag function', () => {
    const name = 'world';
    const result = m.red`Hello ${name}!`;
    expect(result).toBe('\x1b[31mHello world!\x1b[39m');
  });

  it('handles multiple interpolations', () => {
    const a = 'foo', b = 'bar';
    expect(m.bold`${a} and ${b}`).toBe('\x1b[1mfoo and bar\x1b[22m');
  });

  it('root marker as tag returns plain string', () => {
    const result = m`plain ${'text'}`;
    expect(result).toBe('plain text');
  });
});

describe('level property', () => {
  it('reports correct level', () => {
    expect(withLevel(0).level).toBe(0);
    expect(withLevel(1).level).toBe(1);
    expect(withLevel(2).level).toBe(2);
    expect(withLevel(3).level).toBe(3);
  });

  it('chained builder inherits level', () => {
    const m2 = withLevel(2);
    expect(m2.red.bold.level).toBe(2);
  });
});

describe('named exports', () => {
  it('named red export works', async () => {
    // Named exports use stdoutLevel which may be 0 in CI; test via withLevel
    const { red: namedRed } = await import('../src/index.js');
    // Just verify it's a callable
    expect(typeof namedRed).toBe('function');
  });
});
