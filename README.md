# console-marker

> High-performance terminal string styling for Node.js 20+

[![CI](https://github.com/RemcoDewlde/marker/actions/workflows/ci.yml/badge.svg)](https://github.com/RemcoDewlde/marker/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/RemcoDewlde/marker/graph/badge.svg?token=4C7L7LVYN1)](https://codecov.io/gh/RemcoDewlde/marker)
[![npm version](https://img.shields.io/npm/v/console-marker.svg)](https://www.npmjs.com/package/console-marker)
[![Node.js](https://img.shields.io/node/v/console-marker.svg)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue.svg)](tsconfig.json)

**[Documentation](https://remcodewlde.github.io/marker/)**

A chalk-inspired terminal styling library built from scratch to win where it counts: deep chains, dynamic colors (rgb/hex), and tagged template literals — all with zero runtime dependencies and full TypeScript types included.

```
chalk  short str   14 ns   marker short str   16 ns   ~tied  (was 1.82× slower)
chalk  bold.red    21 ns   marker bold.red    20 ns   marker 1.06× faster
chalk  5-chain     56 ns   marker 5-chain     33 ns   marker 1.70× faster
chalk  .hex()     292 ns   marker .hex()     232 ns   marker 1.26× faster
chalk  .rgb()     197 ns   marker .rgb()     169 ns   marker 1.16× faster
```

---

## Features

- **Chainable API** — `marker.bold.red.underline('text')`
- **Tagged template literals built-in** — `marker.red\`Hello ${name}!\`` (no separate package needed)
- **Named exports** — `import { red, bold } from 'console-marker'` for tree-shaking
- **Full color model support** — RGB, hex, ANSI 256, truecolor fallback to 256→16 automatically
- **Dual ESM + CJS** — works in any Node.js project, no config needed
- **Strict TypeScript** — every method typed, zero `any`
- **Zero dependencies** — no `ansi-styles`, no `supports-color`
- **Tiny** — 12 KB ESM, 15 KB CJS (minified)

---

## Installation

```bash
npm install console-marker
```

> **Node.js ≥ 20** required. Uses `String.prototype.replaceAll`, `tty.WriteStream.getColorDepth()`.

---

## Quick start

```ts
import marker from 'console-marker';

console.log(marker.red('Hello world'));
console.log(marker.bold.green('Build complete'));
console.log(marker.bgBlue.white.bold(' SUCCESS '));
```

---

## API

### Chaining

Styles compose left-to-right. Each accessor returns a new builder; calling it applies the accumulated styles.

```ts
marker.red('text')
marker.bold.red('text')
marker.bold.italic.underline.bgBlue.white('text')
```

Every chain is cached globally — accessing `marker.red.bold` twice returns the **same object**, so there is no allocation cost after warmup.

### String call

```ts
marker.red('Hello')         // → '\x1b[31mHello\x1b[39m'
marker.bold.red('Hello')    // → '\x1b[1m\x1b[31mHello\x1b[39m\x1b[22m'
```

### Tagged template literals

marker handles tagged templates natively — no chalk-template shim needed.

```ts
const name = 'Alice';
const count = 42;

marker.red`Hello ${name}!`
marker.bold.cyan`${count} tests passed`
marker.bgRed.white.bold` ERROR ` + marker.red` ${message}`
```

### Named exports (tree-shakeable)

```ts
import { red, bold, green, bgBlue, cyan } from 'console-marker';

red('error')
bold(green('ok'))
bgBlue(cyan('info'))
```

### Dynamic colors

```ts
// RGB — any of 16 million colors
marker.rgb(255, 100, 0)('text')
marker.bgRgb(0, 128, 255)('text')

// Hex
marker.hex('#FF6400')('text')
marker.bgHex('#FF6400')('text')

// ANSI 256
marker.ansi256(196)('text')
marker.bgAnsi256(57)('text')
```

Auto-downsamples to 256-color or 16-color when the terminal doesn't support truecolor.

### Custom color level

```ts
import { withLevel } from 'console-marker';

const m = withLevel(0)   // 0=none, 1=16-color, 2=256-color, 3=truecolor
m.red('text')            // → 'text' (level 0 passes through unchanged)
```

### Color detection

```ts
import { supportsColor, supportsColorStderr } from 'console-marker';

if (supportsColor) {
  // stdout supports ANSI colors
}
```

Detection respects:

| Override | Effect |
|---|---|
| `FORCE_COLOR=0` | Disable colors |
| `FORCE_COLOR=1` \| `2` \| `3` | Force level |
| `NO_COLOR=1` | Disable colors (standard) |
| `--no-color` | Disable colors |
| `--color=256` | Force 256-color |
| `--color=16m` | Force truecolor |

---

## Style reference

### Modifiers

| Style | Code |
|---|---|
| `bold` | `\x1b[1m` … `\x1b[22m` |
| `dim` | `\x1b[2m` … `\x1b[22m` |
| `italic` | `\x1b[3m` … `\x1b[23m` |
| `underline` | `\x1b[4m` … `\x1b[24m` |
| `overline` | `\x1b[53m` … `\x1b[55m` |
| `inverse` | `\x1b[7m` … `\x1b[27m` |
| `hidden` | `\x1b[8m` … `\x1b[28m` |
| `strikethrough` | `\x1b[9m` … `\x1b[29m` |
| `reset` | `\x1b[0m` … `\x1b[0m` |

### Foreground colors

`black` `red` `green` `yellow` `blue` `magenta` `cyan` `white` `gray` / `grey`

Bright variants: `redBright` `greenBright` `yellowBright` `blueBright` `magentaBright` `cyanBright` `whiteBright` `blackBright`

### Background colors

`bgBlack` `bgRed` `bgGreen` `bgYellow` `bgBlue` `bgMagenta` `bgCyan` `bgWhite` `bgGray` / `bgGrey`

Bright variants: `bgRedBright` `bgGreenBright` … `bgWhiteBright` `bgBlackBright`

---

## Benchmarks

Measured with [mitata](https://github.com/evanwashere/mitata) on Apple M3 Pro, Node 24.2.0. Both libraries forced to level 3 (truecolor) for a fair comparison.

```
cpu: Apple M3 Pro
runtime: node 24.2.0 (arm64-darwin)

benchmark                       chalk avg    marker avg    result
───────────────────────────────────────────────────────────────────
single style — short string ★    14.31 ns     15.54 ns    ~tied (was chalk 1.82×) ✓
single style — long (440 chars)  37.00 ns     39.19 ns    ~tied
chain — bold.red ★               21.48 ns     20.31 ns    marker 1.06× ✓
chain — 3 levels                 17.45 ns     23.39 ns    chalk  1.34×
chain — 5 levels ★               56.34 ns     33.07 ns    marker 1.70× ✓
newlines (3 lines)               68.83 ns     70.44 ns    ~tied
embedded ANSI codes              34.45 ns     39.22 ns    chalk  1.14×
rgb() truecolor ★               197.14 ns    169.47 ns    marker 1.16× ✓
hex() truecolor ★               291.58 ns    232.30 ns    marker 1.26× ✓
tagged template (marker only)       —         41.01 ns    —
```

★ marker wins or ties on 6 of 9 scenarios including the workloads that dominate real CLI tools.

Run them yourself:

```bash
npm run bench
```

Benchmarks use [mitata](https://github.com/evanwashere/mitata) — a V8-JIT-aware harness that warms up before measuring so results reflect steady-state performance.

---

## Examples

```
examples/
  basic.ts            All single styles and colors
  chaining.ts         Composing multiple styles
  dynamic-colors.ts   rgb, hex, ansi256, fallback levels
  template-literals.ts Tagged template usage
  named-imports.ts    Tree-shaking with named imports
  levels.ts           Color level detection and control
  showcase.ts         Full-featured terminal UI demo
  compare-chalk.ts    Side-by-side visual comparison with chalk
```

```bash
node --import tsx/esm examples/showcase.ts
node --import tsx/esm examples/compare-chalk.ts
```

---

## Differences from chalk

marker is **not** a drop-in replacement. It diverges where divergence buys performance or API clarity.

| chalk | marker | why |
|---|---|---|
| `chalk('a', 'b')` joins with space | No multi-arg: use `` `${a} ${b}` `` | Removes a check from every call |
| `new Chalk({ level })` | `withLevel(level)` | Cleaner factory, no class |
| Tagged templates via `chalk-template` | Built-in | One less dependency |
| ESM only (v5+) | Dual ESM + CJS | Broader compatibility |

Everything else maps 1:1: chaining, `.level`, `rgb()`, `hex()`, `ansi256()`, `FORCE_COLOR`, `NO_COLOR`.

---

## How it works

### Builder caching

Every unique chain is stored in a global `Map<string, Builder>` keyed by its accumulated ANSI open and close codes. `marker.red.bold` accessed in 1,000 places costs one allocation.

### Object.setPrototypeOf

Builders use a shared prototype with cached getters — the same pattern as chalk, without the Proxy overhead. A Proxy-based first draft was 3–4× slower: Proxy traps prevent V8's inline-cache optimizations.

### ANSI constants

All ANSI codes are hardcoded string constants in `src/ansi.ts`. There are no runtime function calls to build escape sequences.

### Native string operations

`applyStyle` uses `str.includes('\x1b')` and `str.indexOf('\n')` — V8 implements both with SIMD. A single hand-rolled JavaScript character loop was 18× slower on long strings.

---

## Testing

```bash
npm test               # run tests
npm test -- --coverage # run tests + branch coverage report
npm run typecheck      # TypeScript strict check
```

The test suite aims for **MC/DC coverage** (Modified Condition/Decision Coverage — the DO-178C avionics standard): every condition in every branch decision is demonstrated to independently affect the outcome.

```
File        | % Stmts | % Branch | % Funcs | % Lines
------------|---------|----------|---------|--------
ansi.ts     |     100 |      100 |     100 |    100
apply.ts    |     100 |      100 |     100 |    100
builder.ts  |     100 |      100 |     100 |    100
detect.ts   |     100 |      100 |     100 |    100
utils.ts    |     100 |      100 |     100 |    100
```

---

## License

MIT
