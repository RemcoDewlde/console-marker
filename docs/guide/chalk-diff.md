# Differences from chalk

marker is **not** a drop-in replacement. It diverges where divergence buys performance or API clarity.

## Breaking changes

### No multi-argument join

```ts
// chalk
chalk('Hello', 'world')  // → 'Hello world'

// marker — use a template literal instead
marker(`Hello world`)
marker(`${'Hello'} ${'world'}`)
```

**Why:** Every chalk call checks `arguments.length > 1` and joins with spaces. Removing this check eliminates a branch from the styled hot path.

### Factory function instead of class

```ts
// chalk
import { Chalk } from 'chalk';
const m = new Chalk({ level: 0 });

// marker
import { withLevel } from 'marker';
const m = withLevel(0);
```

**Why:** `withLevel` is a plain function — no class prototype chain, no `instanceof` check, no `new` keyword. The resulting object is the same Builder type as the default export.

### Tagged templates built-in

```ts
// chalk — requires npm install chalk-template
import chalkTemplate from 'chalk-template';
chalkTemplate`{red Hello!}`

// marker — built-in, uses the same chaining API
marker.red`Hello!`
```

**Why:** One fewer dependency. The tagged template path is the same function as the styled call path — no extra parsing.

## What maps 1:1

- Chaining: `marker.red.bold.underline('text')` ↔ `chalk.red.bold.underline('text')`
- `.level` property: `marker.level` ↔ `chalk.level`
- `.rgb(r, g, b)`, `.hex(color)`, `.ansi256(n)` — identical signatures
- `FORCE_COLOR`, `NO_COLOR`, `--color`, `--no-color` env/flag handling
- `supportsColor` / `supportsColorStderr` shape
- Named style names — all 50+ style names are identical
