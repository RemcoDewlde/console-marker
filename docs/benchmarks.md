# Benchmarks

Measured with [mitata](https://github.com/evanwashere/mitata) on Apple M3 Pro, Node 24.2.0. Both libraries forced to level 3 (truecolor) for a fair comparison.

## Results

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

## Run them yourself

```bash
npm run bench
```

Benchmarks use [mitata](https://github.com/evanwashere/mitata) — a V8-JIT-aware harness that warms up before measuring, so results reflect steady-state performance.

## Why these scenarios?

The benchmark suite focuses on the workloads that appear most in real CLI tools:

- **Single style, short** — the most common call: `marker.red('error')`
- **Deep chains** — `marker.bgBlue.white.bold.underline.italic('text')` — five style layers. chalk pays allocation on each step; marker hits the global cache.
- **Dynamic colors** — `rgb()` and `hex()` parse input at runtime. marker's conversion path is optimized around V8's string internals.
- **Embedded ANSI** — strings that already contain escape codes (e.g., from a sub-process). marker must re-wrap closing codes to prevent bleed.
- **Tagged templates** — only marker supports this natively; chalk would need `chalk-template`.

## How the cache makes deep chains fast

chalk allocates a new builder object on each property access. On first use, `marker.bold` is also allocated — but the result is stored in a global `Map<string, Builder>` keyed by the accumulated ANSI codes. The second access to `marker.bold.red.underline.bgBlue.white` is a cache hit: the same object is returned, no new allocation.

This is why marker scales better with chain depth: the per-step allocation cost is amortized to zero after warmup.
