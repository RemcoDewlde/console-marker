# Dynamic colors

marker supports RGB, hex, and ANSI 256 — and automatically downsamples to the best color model the terminal supports.

## RGB truecolor

Any of 16 million colors:

```ts
import marker from 'marker';

marker.rgb(255, 100, 0)('text')       // foreground
marker.bgRgb(0, 128, 255)('text')     // background

// Chain with other styles
marker.bold.rgb(255, 100, 0)('text')
```

## Hex

Accepts `#RRGGBB` (the `#` is required):

```ts
marker.hex('#FF6400')('text')
marker.bgHex('#FF6400')('text')
marker.bold.hex('#00FF88').underline('text')
```

## ANSI 256

The classic 256-color palette (0–255):

```ts
marker.ansi256(196)('text')    // bright red
marker.bgAnsi256(57)('text')   // purple background
```

## Automatic downsampling

When the terminal does not support truecolor, marker automatically converts:

| Terminal level | rgb/hex becomes |
|---|---|
| Level 3 (truecolor) | `\x1b[38;2;R;G;Bm` — full 24-bit |
| Level 2 (256-color) | Nearest ANSI 256 index |
| Level 1 (16-color) | Nearest ANSI 16 code |
| Level 0 (none) | Passed through unstyled |

You can force a specific level for testing:

```ts
import { withLevel } from 'marker';

const m1 = withLevel(1);
m1.hex('#FF6400')('text')  // → ANSI 16 escape
```
