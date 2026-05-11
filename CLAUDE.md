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
The builder function checks `typeof first === 'string'` before the tagged-template-array check, so normal string calls skip the `'raw' in obj` test entirely.

### Split root/non-root builder closures
`makeBuilderFn` creates two separate function closures: one for the root builder (pass-through) and one for styled builders. The styled closure has no `isRoot` branch — the JIT sees a single unconditional code path. Combined with changing `...args` rest parameter to an explicit `(first, ...values)` signature, this eliminates the heap array allocation for every single-string call (V8 elides the empty `values` rest array). Result: single-style-short dropped from 26 ns → 15 ns.

## Benchmark results (Apple M3 Pro, Node 24)

| Scenario | chalk | marker | Winner |
|---|---|---|---|
| **Single style, short** | 14ns | **15ns** | **~tied** (was chalk 1.82×) |
| Single style, long (440 chars) | 37ns | 39ns | ~tied |
| **Chain 2 (bold.red)** | 21ns | **20ns** | **marker 1.06×** |
| Chain 3 levels | 17ns | 23ns | chalk 1.34× |
| **Chain 5 levels** | 56ns | **33ns** | **marker 1.70×** |
| Newlines (3 lines) | 69ns | 70ns | ~tied |
| Embedded ANSI | 34ns | 39ns | chalk 1.14× |
| **rgb() truecolor** | 197ns | **169ns** | **marker 1.16×** |
| **hex() truecolor** | 292ns | **232ns** | **marker 1.26×** |

## Color level detection

`FORCE_COLOR=0|1|2|3`, `NO_COLOR`, `--color`, `--no-color` env vars and CLI flags are all respected. Level is detected once at module load from `process.stdout`/`process.stderr` TTY depth. Use `withLevel(n)` to create an instance at a fixed level.
