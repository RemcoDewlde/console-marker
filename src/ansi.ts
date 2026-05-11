export type AnsiPair = { readonly open: string; readonly close: string };

export const ANSI = {
  // Modifiers
  reset:         { open: '\x1b[0m',  close: '\x1b[0m'  },
  bold:          { open: '\x1b[1m',  close: '\x1b[22m' },
  dim:           { open: '\x1b[2m',  close: '\x1b[22m' },
  italic:        { open: '\x1b[3m',  close: '\x1b[23m' },
  underline:     { open: '\x1b[4m',  close: '\x1b[24m' },
  overline:      { open: '\x1b[53m', close: '\x1b[55m' },
  inverse:       { open: '\x1b[7m',  close: '\x1b[27m' },
  hidden:        { open: '\x1b[8m',  close: '\x1b[28m' },
  strikethrough: { open: '\x1b[9m',  close: '\x1b[29m' },

  // Foreground colors
  black:   { open: '\x1b[30m', close: '\x1b[39m' },
  red:     { open: '\x1b[31m', close: '\x1b[39m' },
  green:   { open: '\x1b[32m', close: '\x1b[39m' },
  yellow:  { open: '\x1b[33m', close: '\x1b[39m' },
  blue:    { open: '\x1b[34m', close: '\x1b[39m' },
  magenta: { open: '\x1b[35m', close: '\x1b[39m' },
  cyan:    { open: '\x1b[36m', close: '\x1b[39m' },
  white:   { open: '\x1b[37m', close: '\x1b[39m' },
  gray:    { open: '\x1b[90m', close: '\x1b[39m' },
  grey:    { open: '\x1b[90m', close: '\x1b[39m' },

  // Bright foreground colors
  blackBright:   { open: '\x1b[90m', close: '\x1b[39m' },
  redBright:     { open: '\x1b[91m', close: '\x1b[39m' },
  greenBright:   { open: '\x1b[92m', close: '\x1b[39m' },
  yellowBright:  { open: '\x1b[93m', close: '\x1b[39m' },
  blueBright:    { open: '\x1b[94m', close: '\x1b[39m' },
  magentaBright: { open: '\x1b[95m', close: '\x1b[39m' },
  cyanBright:    { open: '\x1b[96m', close: '\x1b[39m' },
  whiteBright:   { open: '\x1b[97m', close: '\x1b[39m' },

  // Background colors
  bgBlack:   { open: '\x1b[40m',  close: '\x1b[49m' },
  bgRed:     { open: '\x1b[41m',  close: '\x1b[49m' },
  bgGreen:   { open: '\x1b[42m',  close: '\x1b[49m' },
  bgYellow:  { open: '\x1b[43m',  close: '\x1b[49m' },
  bgBlue:    { open: '\x1b[44m',  close: '\x1b[49m' },
  bgMagenta: { open: '\x1b[45m',  close: '\x1b[49m' },
  bgCyan:    { open: '\x1b[46m',  close: '\x1b[49m' },
  bgWhite:   { open: '\x1b[47m',  close: '\x1b[49m' },
  bgGray:    { open: '\x1b[100m', close: '\x1b[49m' },
  bgGrey:    { open: '\x1b[100m', close: '\x1b[49m' },

  // Bright background colors
  bgBlackBright:   { open: '\x1b[100m', close: '\x1b[49m' },
  bgRedBright:     { open: '\x1b[101m', close: '\x1b[49m' },
  bgGreenBright:   { open: '\x1b[102m', close: '\x1b[49m' },
  bgYellowBright:  { open: '\x1b[103m', close: '\x1b[49m' },
  bgBlueBright:    { open: '\x1b[104m', close: '\x1b[49m' },
  bgMagentaBright: { open: '\x1b[105m', close: '\x1b[49m' },
  bgCyanBright:    { open: '\x1b[106m', close: '\x1b[49m' },
  bgWhiteBright:   { open: '\x1b[107m', close: '\x1b[49m' },
} as const satisfies Record<string, AnsiPair>;

export type AnsiName = keyof typeof ANSI;
export const ANSI_NAMES = Object.keys(ANSI) as AnsiName[];

// ANSI 256-color escape builders
export function ansi256Fg(n: number): AnsiPair {
  return { open: `\x1b[38;5;${n}m`, close: '\x1b[39m' };
}
export function ansi256Bg(n: number): AnsiPair {
  return { open: `\x1b[48;5;${n}m`, close: '\x1b[49m' };
}

// RGB (truecolor) escape builders
export function rgbFg(r: number, g: number, b: number): AnsiPair {
  return { open: `\x1b[38;2;${r};${g};${b}m`, close: '\x1b[39m' };
}
export function rgbBg(r: number, g: number, b: number): AnsiPair {
  return { open: `\x1b[48;2;${r};${g};${b}m`, close: '\x1b[49m' };
}

// Hex to RGB conversion
export function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace('#', '');
  const n = parseInt(normalized, 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

// RGB to ANSI 256 approximation
export function rgbToAnsi256(r: number, g: number, b: number): number {
  if (r === g && g === b) {
    if (r < 8) return 16;
    if (r > 248) return 231;
    return Math.round((r - 8) / 247 * 24) + 232;
  }
  return 16
    + 36 * Math.round(r / 255 * 5)
    + 6  * Math.round(g / 255 * 5)
    +      Math.round(b / 255 * 5);
}

// ANSI 256 → ANSI 16 (chalk-compatible bit-packing algorithm)
export function ansi256ToAnsi16(code: number): number {
  if (code < 8)  return 30 + code;
  if (code < 16) return 90 + (code - 8);

  let r: number, g: number, b: number;
  if (code >= 232) {
    const v = ((code - 232) * 10 + 8) / 255;
    r = g = b = v;
  } else {
    const c = code - 16;
    const rem = c % 36;
    r = Math.floor(c / 36) / 5;
    g = Math.floor(rem / 6) / 5;
    b = (rem % 6) / 5;
  }

  const value = Math.max(r, g, b) * 2;
  if (value === 0) return 30;

  let result = 30 + ((Math.round(b) << 2) | (Math.round(g) << 1) | Math.round(r));
  if (value === 2) result += 60;
  return result;
}

// RGB → ANSI 16 via the ansi256 intermediate (matches chalk)
export function rgbToAnsi16Code(r: number, g: number, b: number): number {
  return ansi256ToAnsi16(rgbToAnsi256(r, g, b));
}
