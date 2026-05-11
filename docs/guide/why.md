# Why marker?

chalk is great. marker builds on what chalk proved — chainable API, terminal detection, dual CJS/ESM — and then makes it faster and leaner for the cases that matter most.

## Where marker wins

### 5-level chains

Deep chains are common in real CLI tools: `marker.bgBlue.white.bold.underline('text')`. chalk creates a new builder object on each `.` accessor; marker caches every unique chain globally.

```
chalk  5-chain     56 ns
marker 5-chain     33 ns   1.70× faster
```

### Dynamic colors (hex, rgb)

Parsing a hex string and building an ANSI escape is non-trivial. marker optimizes the hot path with direct V8-native string ops.

```
chalk  .hex()     292 ns
marker .hex()     232 ns   1.26× faster

chalk  .rgb()     197 ns
marker .rgb()     169 ns   1.16× faster
```

### Tagged templates — no extra package

chalk requires `chalk-template` as a separate package for `` chalk`...` `` syntax. marker includes it out of the box.

## Where chalk wins

marker is not universally faster. Short single-style strings (`chalk.red('x')`) are roughly tied. Three-level chains slightly favor chalk. See the full [benchmarks](/benchmarks) page.

## Intentional differences

marker is **not** a drop-in replacement:

| chalk | marker | reason |
|---|---|---|
| `chalk('a', 'b')` joins with space | No multi-arg — use template literals | Removes a check from every call |
| `new Chalk({ level })` | `withLevel(level)` | Cleaner factory, no class |
| Tagged templates via `chalk-template` | Built-in | One fewer dependency |

See [Differences from chalk](/guide/chalk-diff) for the full list.
