# API Reference

## Default export

```ts
import marker from 'console-marker';
```

The default export is a root `Builder` at the auto-detected color level.

## Builder

A `Builder` is simultaneously a callable function and an object with style properties.

### `builder(str: string): string`

Apply accumulated styles to a string.

```ts
marker.red('Hello')         // → '\x1b[31mHello\x1b[39m'
marker.bold.red('Hello')    // → '\x1b[1m\x1b[31mHello\x1b[39m\x1b[22m'
```

Returns the input unchanged when:
- The string is empty
- `builder.level === 0`

### `` builder`template ${value}` ``

Apply accumulated styles to a tagged template literal. All values are coerced to strings.

```ts
const name = 'Alice';
marker.red`Hello ${name}!`
```

### `builder.level: ColorLevel`

Current color level (`0` | `1` | `2` | `3`).

### Style getters

Every style name returns a new `Builder` that prepends that style's ANSI codes to the accumulated chain. Results are cached on the instance.

## Dynamic color methods

### `builder.rgb(r, g, b): Builder`

Foreground color from RGB components (0–255 each).

```ts
marker.rgb(255, 100, 0)('text')
marker.bold.rgb(0, 200, 100)('text')
```

### `builder.bgRgb(r, g, b): Builder`

Background color from RGB components.

### `builder.hex(color: string): Builder`

Foreground color from a hex string. The `#` prefix is required.

```ts
marker.hex('#FF6400')('text')
```

### `builder.bgHex(color: string): Builder`

Background color from a hex string.

### `builder.ansi256(n: number): Builder`

Foreground color from ANSI 256 palette (0–255).

```ts
marker.ansi256(196)('text')  // bright red
```

### `builder.bgAnsi256(n: number): Builder`

Background color from ANSI 256 palette.

## Named exports

```ts
import {
  // Modifiers
  reset, bold, dim, italic, underline,
  overline, inverse, hidden, strikethrough,

  // Foreground
  black, red, green, yellow, blue,
  magenta, cyan, white, gray, grey,
  blackBright, redBright, greenBright, yellowBright,
  blueBright, magentaBright, cyanBright, whiteBright,

  // Background
  bgBlack, bgRed, bgGreen, bgYellow, bgBlue,
  bgMagenta, bgCyan, bgWhite, bgGray, bgGrey,
  bgBlackBright, bgRedBright, bgGreenBright, bgYellowBright,
  bgBlueBright, bgMagentaBright, bgCyanBright, bgWhiteBright,

  // Utilities
  withLevel, supportsColor, supportsColorStderr,
} from 'console-marker';
```

Each named style export is a `Builder` equivalent to `marker.<style>`.

## `withLevel(level: ColorLevel): Builder`

Create a root builder fixed at a specific color level.

```ts
import { withLevel } from 'console-marker';

const m = withLevel(0);   // colors disabled
const m3 = withLevel(3);  // force truecolor
```

`ColorLevel` is `0 | 1 | 2 | 3`.

## `supportsColor`

```ts
import { supportsColor } from 'console-marker';

// supportsColor is false | { level: ColorLevel }
if (supportsColor) {
  console.log(supportsColor.level);
}
```

Reflects the auto-detected level for `process.stdout`. `false` when level is 0.

## `supportsColorStderr`

Same as `supportsColor` but for `process.stderr`.

## Types

```ts
import type { Builder, ColorLevel } from 'console-marker';
```

`ColorLevel = 0 | 1 | 2 | 3`
