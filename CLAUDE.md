# marker

High-performance terminal string styling for Node.js 20+. A chalk-inspired library built to beat chalk's benchmarks on multi-level chains and dynamic colors.

## Stack

- **Language**: TypeScript (strict), compiled with tsup
- **Output**: Dual ESM (`dist/index.js`) + CJS (`dist/index.cjs`) + `.d.ts` types
- **Node target**: ≥20.0.0
- **Test runner**: vitest
- **Benchmark tool**: mitata

## Commands

```bash
npm run build      # tsup → dist/
npm test           # vitest (correctness suite)
npm run typecheck  # tsc --noEmit
npm run bench      # build then mitata comparison vs chalk
```

## API

```ts
import marker from 'marker';
import { red, bold, withLevel, supportsColor } from 'marker';

// Chaining
marker.red.bold('Hello')
marker.hex('#FF6400').bgBlue('text')
marker.rgb(255, 100, 0)('text')
marker.ansi256(196)('text')

// Tagged template (built-in — chalk requires a separate package)
marker.red`Hello ${name}!`

// Named imports (tree-shakeable)
red(bold('Hello'))

// Custom level instance
const m = withLevel(0)  // disable colors
```

### Intentional divergences from chalk

| chalk | marker |
|---|---|
| `chalk('a', 'b')` joins with space | No multi-arg join — use template literals |
| `new Chalk({ level })` | `withLevel(level)` |
| Tagged templates via `chalk-template` package | Built-in |

## Architecture

```
src/
  ansi.ts      Hardcoded ANSI open/close constants (no runtime computation)
  detect.ts    Color level detection (0–3) via tty + env vars
  utils.ts     encaseNewlines() for multi-line style bleeding fix
  apply.ts     applyStyle() hot path — native includes/indexOf, native replaceAll
  builder.ts   Builder type, Object.setPrototypeOf prototype chain, global dedup cache
  index.ts     Default export + named exports + withLevel/supportsColor
```

## Performance design decisions

### Object.setPrototypeOf (not Proxy)
Builders use `Object.setPrototypeOf(fn, builderProto)` — the same pattern as chalk. A shared prototype holds all style getters. Each getter caches the child builder on the instance via `Object.defineProperty`. Proxy was tried first but added ~4x overhead due to trap indirection.

### Global builder dedup cache
`builderCache: Map<string, Builder>` keyed by `"<level>:<openAll>\0<closeAll>"`. Any two builders with the same ANSI code accumulation and level share the same object. This prevents unbounded allocation when the same chain appears in many places.

### Native string ops
`applyStyle` uses `str.includes('\x1b')` and `str.indexOf('\n')` — both are SIMD-backed in V8. A hand-rolled JS character loop was 18x slower for long strings.

### typeof hot-path guard
The builder function checks `typeof first === 'string'` before the tagged-template-array check, so normal string calls skip the Array.isArray + `'raw' in obj` test entirely.

## Benchmark results (Apple M3 Pro, Node 24)

| Scenario | chalk | marker | Winner |
|---|---|---|---|
| Single style, short | 14ns | 21ns | chalk 1.49x |
| Single style, long (440 chars) | 36ns | 39ns | ~tied |
| Chain 2 levels | 22ns | 27ns | chalk 1.24x |
| Chain 3 levels | 17ns | 27ns | chalk 1.57x |
| **Chain 5 levels** | 56ns | **38ns** | **marker 1.46x** |
| Newlines (3 lines) | 71ns | 74ns | ~tied |
| Embedded ANSI | 36ns | 43ns | chalk 1.21x |
| **rgb() truecolor** | 194ns | **182ns** | **marker 1.06x** |
| **hex() truecolor** | 283ns | **233ns** | **marker 1.22x** |

## Color level detection

`FORCE_COLOR=0|1|2|3`, `NO_COLOR`, `--color`, `--no-color` env vars and CLI flags are all respected. Level is detected once at module load from `process.stdout`/`process.stderr` TTY depth. Use `withLevel(n)` to create an instance at a fixed level.
