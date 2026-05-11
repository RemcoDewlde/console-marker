# Color levels

marker uses a 0–3 color level to control output depth, matching chalk's convention.

| Level | Meaning | Escape type |
|---|---|---|
| `0` | No color | Plain text passthrough |
| `1` | 16-color | Basic ANSI `\x1b[30m`–`\x1b[37m` |
| `2` | 256-color | `\x1b[38;5;Nm` |
| `3` | Truecolor | `\x1b[38;2;R;G;Bm` |

## Detection

The level is detected once at module load from `process.stdout`:

```ts
import { supportsColor, supportsColorStderr } from 'console-marker';

if (supportsColor) {
  console.log(`stdout supports color level ${supportsColor.level}`);
}
if (supportsColorStderr) {
  console.log(`stderr supports color level ${supportsColorStderr.level}`);
}
```

## Environment overrides

| Variable / flag | Effect |
|---|---|
| `FORCE_COLOR=0` | Disable colors |
| `FORCE_COLOR=1` \| `2` \| `3` | Force level |
| `NO_COLOR=1` | Disable colors (standard) |
| `--no-color` | Disable colors |
| `--color=256` | Force 256-color |
| `--color=16m` | Force truecolor |

These take effect at startup — changing `process.env.FORCE_COLOR` after import has no effect.

## Custom level instance

Create a builder fixed to a specific level:

```ts
import { withLevel } from 'console-marker';

const m = withLevel(0);   // colors off — useful for testing
m.red('text')             // → 'text' (unchanged)

const m256 = withLevel(2);
m256.rgb(255, 100, 0)('text')  // → ANSI 256 escape, not truecolor
```

## Checking the current level

```ts
import marker from 'console-marker';

console.log(marker.level);  // 0 | 1 | 2 | 3
```
