import {
  ANSI,
  AnsiName,
  AnsiPair,
  ansi256Fg,
  ansi256Bg,
  rgbFg,
  rgbBg,
  hexToRgb,
  rgbToAnsi256,
  rgbToAnsi16Code,
} from './ansi.js';
import { applyStyle } from './apply.js';
import type { ColorLevel } from './detect.js';

// --- Types ------------------------------------------------------------------

export interface Builder {
  (str: string): string;
  (strings: TemplateStringsArray, ...values: unknown[]): string;
  // Modifiers
  readonly reset: Builder;
  readonly bold: Builder;
  readonly dim: Builder;
  readonly italic: Builder;
  readonly underline: Builder;
  readonly overline: Builder;
  readonly inverse: Builder;
  readonly hidden: Builder;
  readonly strikethrough: Builder;
  // Foreground
  readonly black: Builder;
  readonly red: Builder;
  readonly green: Builder;
  readonly yellow: Builder;
  readonly blue: Builder;
  readonly magenta: Builder;
  readonly cyan: Builder;
  readonly white: Builder;
  readonly gray: Builder;
  readonly grey: Builder;
  readonly blackBright: Builder;
  readonly redBright: Builder;
  readonly greenBright: Builder;
  readonly yellowBright: Builder;
  readonly blueBright: Builder;
  readonly magentaBright: Builder;
  readonly cyanBright: Builder;
  readonly whiteBright: Builder;
  // Background
  readonly bgBlack: Builder;
  readonly bgRed: Builder;
  readonly bgGreen: Builder;
  readonly bgYellow: Builder;
  readonly bgBlue: Builder;
  readonly bgMagenta: Builder;
  readonly bgCyan: Builder;
  readonly bgWhite: Builder;
  readonly bgGray: Builder;
  readonly bgGrey: Builder;
  readonly bgBlackBright: Builder;
  readonly bgRedBright: Builder;
  readonly bgGreenBright: Builder;
  readonly bgYellowBright: Builder;
  readonly bgBlueBright: Builder;
  readonly bgMagentaBright: Builder;
  readonly bgCyanBright: Builder;
  readonly bgWhiteBright: Builder;
  // Dynamic color methods
  ansi256(n: number): Builder;
  bgAnsi256(n: number): Builder;
  rgb(r: number, g: number, b: number): Builder;
  bgRgb(r: number, g: number, b: number): Builder;
  hex(color: string): Builder;
  bgHex(color: string): Builder;
  // Level
  readonly level: ColorLevel;
}

// --- Internal symbols -------------------------------------------------------

const OPEN_ALL  = Symbol('openAll');
const CLOSE_ALL = Symbol('closeAll');
const OPENS     = Symbol('opens');
const CLOSES    = Symbol('closes');
const LEVEL     = Symbol('level');

interface InternalBuilder extends Builder {
  [OPEN_ALL]:  string;
  [CLOSE_ALL]: string;
  [OPENS]:     readonly string[];
  [CLOSES]:    readonly string[];
  [LEVEL]:     ColorLevel;
}

// --- Prototype with style getters -------------------------------------------

// Build a single shared prototype with lazy-evaluated, instance-cached getters
// for every named ANSI style. This mirrors chalk's approach: no Proxy overhead,
// V8 can optimize direct property access, and Object.defineProperty caches the
// result on the specific instance after first access.

type StyleGetter = { get(this: InternalBuilder): Builder };

const styleGetters: Record<string, StyleGetter> = Object.create(null) as Record<string, StyleGetter>;

for (const name of Object.keys(ANSI) as AnsiName[]) {
  styleGetters[name] = {
    get(this: InternalBuilder): Builder {
      const child = makeChild(this, ANSI[name]);
      Object.defineProperty(this, name, { value: child, configurable: true });
      return child;
    },
  };
}

// Add level getter
const levelDescriptor = {
  get(this: InternalBuilder): ColorLevel { return this[LEVEL]; },
  enumerable: true,
  configurable: true,
};

// Dynamic color method getters (rgb, hex, ansi256, bgRgb, bgHex, bgAnsi256)
const dynamicGetters: Record<string, StyleGetter> = Object.create(null) as Record<string, StyleGetter>;

dynamicGetters['rgb'] = {
  get(this: InternalBuilder) {
    const fn = (r: number, g: number, b: number) =>
      makeChild(this, resolveDynamic('rgb', this[LEVEL], r, g, b));
    Object.defineProperty(this, 'rgb', { value: fn, configurable: true });
    return fn as unknown as Builder;
  },
};
dynamicGetters['bgRgb'] = {
  get(this: InternalBuilder) {
    const fn = (r: number, g: number, b: number) =>
      makeChild(this, resolveDynamic('bgRgb', this[LEVEL], r, g, b));
    Object.defineProperty(this, 'bgRgb', { value: fn, configurable: true });
    return fn as unknown as Builder;
  },
};
dynamicGetters['hex'] = {
  get(this: InternalBuilder) {
    const fn = (color: string) => {
      const [r, g, b] = hexToRgb(color);
      return makeChild(this, resolveDynamic('rgb', this[LEVEL], r, g, b));
    };
    Object.defineProperty(this, 'hex', { value: fn, configurable: true });
    return fn as unknown as Builder;
  },
};
dynamicGetters['bgHex'] = {
  get(this: InternalBuilder) {
    const fn = (color: string) => {
      const [r, g, b] = hexToRgb(color);
      return makeChild(this, resolveDynamic('bgRgb', this[LEVEL], r, g, b));
    };
    Object.defineProperty(this, 'bgHex', { value: fn, configurable: true });
    return fn as unknown as Builder;
  },
};
dynamicGetters['ansi256'] = {
  get(this: InternalBuilder) {
    const fn = (n: number) => makeChild(this, ansi256Fg(n));
    Object.defineProperty(this, 'ansi256', { value: fn, configurable: true });
    return fn as unknown as Builder;
  },
};
dynamicGetters['bgAnsi256'] = {
  get(this: InternalBuilder) {
    const fn = (n: number) => makeChild(this, ansi256Bg(n));
    Object.defineProperty(this, 'bgAnsi256', { value: fn, configurable: true });
    return fn as unknown as Builder;
  },
};

// Build the shared prototype
const builderProto: object = Object.defineProperties(
  function () {} as unknown as object,
  {
    ...Object.fromEntries(
      Object.entries(styleGetters).map(([k, v]) => [k, { ...v, enumerable: false, configurable: true }])
    ),
    ...Object.fromEntries(
      Object.entries(dynamicGetters).map(([k, v]) => [k, { ...v, enumerable: false, configurable: true }])
    ),
    level: { ...levelDescriptor },
  },
);

// --- Global dedup cache -----------------------------------------------------
// Builders with identical ANSI codes and level are interchangeable.
const builderCache = new Map<string, InternalBuilder>();

function dedupKey(openAll: string, closeAll: string, level: ColorLevel): string {
  return `${level}:${openAll}\0${closeAll}`;
}

// --- Builder construction ---------------------------------------------------

function makeBuilderFn(
  openAll: string,
  closeAll: string,
  opens: readonly string[],
  closes: readonly string[],
  level: ColorLevel,
): InternalBuilder {
  // Two separate closures so the JIT sees a single, unconditional code path in
  // each case — no isRoot branch in the styled hot path, and first is a named
  // parameter (register-allocated) rather than args[0] (heap array element).
  // V8 also elides the empty `values` rest array for single-string calls.
  const fn: (first: unknown, ...values: unknown[]) => string =
    openAll === ''
      ? function rootFn(first, ...values) {
          if (typeof first === 'string') return first;
          if (first !== null && typeof first === 'object' && 'raw' in (first as object)) {
            const tsa = first as TemplateStringsArray;
            let str = tsa[0] ?? '';
            for (let i = 1; i < tsa.length; i++) str += String(values[i - 1]) + (tsa[i] ?? '');
            return str;
          }
          return '' + (first ?? '');
        }
      : function styleFn(first, ...values) {
          if (typeof first === 'string') {
            if (!first) return first;
            return applyStyle(openAll, closeAll, closes, opens, level, first);
          }
          if (first !== null && typeof first === 'object' && 'raw' in (first as object)) {
            const tsa = first as TemplateStringsArray;
            let str = tsa[0] ?? '';
            for (let i = 1; i < tsa.length; i++) str += String(values[i - 1]) + (tsa[i] ?? '');
            if (!str) return str;
            return applyStyle(openAll, closeAll, closes, opens, level, str);
          }
          const str = '' + (first ?? '');
          if (!str) return str;
          return applyStyle(openAll, closeAll, closes, opens, level, str);
        };

  const internalFn = fn as unknown as InternalBuilder;

  // Store state as Symbol-keyed properties directly on the function.
  internalFn[OPEN_ALL]  = openAll;
  internalFn[CLOSE_ALL] = closeAll;
  internalFn[OPENS]     = opens;
  internalFn[CLOSES]    = closes;
  internalFn[LEVEL]     = level;

  // Wire up the shared prototype (same pattern as chalk)
  Object.setPrototypeOf(internalFn, builderProto);

  return internalFn;
}

function makeChild(parent: InternalBuilder, pair: AnsiPair): InternalBuilder {
  const openAll  = parent[OPEN_ALL]  + pair.open;
  const closeAll = pair.close + parent[CLOSE_ALL];
  const level    = parent[LEVEL];

  const key = dedupKey(openAll, closeAll, level);
  const cached = builderCache.get(key);
  if (cached) return cached;

  const child = makeBuilderFn(
    openAll,
    closeAll,
    [pair.open,  ...parent[OPENS]],
    [pair.close, ...parent[CLOSES]],
    level,
  );

  builderCache.set(key, child);
  return child;
}

function resolveDynamic(
  type: 'rgb' | 'bgRgb',
  level: ColorLevel,
  r: number,
  g: number,
  b: number,
): AnsiPair {
  if (level === 3) return type === 'bgRgb' ? rgbBg(r, g, b) : rgbFg(r, g, b);
  if (level === 2) {
    const idx = rgbToAnsi256(r, g, b);
    return type === 'bgRgb' ? ansi256Bg(idx) : ansi256Fg(idx);
  }
  // rgb → ansi256 → ansi16 (chalk-compatible bit-packing)
  const code16 = rgbToAnsi16Code(r, g, b);
  const isBg = type === 'bgRgb';
  const open = isBg ? `\x1b[${code16 + 10}m` : `\x1b[${code16}m`;
  const close = isBg ? '\x1b[49m' : '\x1b[39m';
  return { open, close };
}

// --- Public factory ---------------------------------------------------------

export function createRootBuilder(level: ColorLevel): Builder {
  return makeBuilderFn('', '', [], [], level) as unknown as Builder;
}
