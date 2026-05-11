# Chaining styles

Styles compose left-to-right. Each accessor returns a new builder; calling it applies the accumulated styles.

```ts
import marker from 'console-marker';

marker.red('text')
marker.bold.red('text')
marker.bold.italic.underline.bgBlue.white('text')
```

## How caching works

Every chain is cached globally — accessing `marker.red.bold` twice returns the **same object**. There is no allocation cost after warmup.

```ts
marker.red.bold === marker.red.bold  // true — same reference
```

The cache key is the combined ANSI open and close escape sequences plus the color level. Two builders with identical accumulated codes at the same level share one object.

## Style order

ANSI escapes are applied in the order you chain them:

```ts
marker.bold.red('text')
// → '\x1b[1m\x1b[31mtext\x1b[39m\x1b[22m'
//     bold↑   red↑         close red↑ close bold↑
```

Close codes are written in reverse: the most recently opened style is closed first.

## Available modifiers

| Style | Open | Close |
|---|---|---|
| `bold` | `\x1b[1m` | `\x1b[22m` |
| `dim` | `\x1b[2m` | `\x1b[22m` |
| `italic` | `\x1b[3m` | `\x1b[23m` |
| `underline` | `\x1b[4m` | `\x1b[24m` |
| `overline` | `\x1b[53m` | `\x1b[55m` |
| `inverse` | `\x1b[7m` | `\x1b[27m` |
| `hidden` | `\x1b[8m` | `\x1b[28m` |
| `strikethrough` | `\x1b[9m` | `\x1b[29m` |
| `reset` | `\x1b[0m` | `\x1b[0m` |

## Foreground colors

`black` `red` `green` `yellow` `blue` `magenta` `cyan` `white` `gray` / `grey`

Bright variants: `redBright` `greenBright` `yellowBright` `blueBright` `magentaBright` `cyanBright` `whiteBright` `blackBright`

## Background colors

`bgBlack` `bgRed` `bgGreen` `bgYellow` `bgBlue` `bgMagenta` `bgCyan` `bgWhite` `bgGray` / `bgGrey`

Bright variants: `bgRedBright` `bgGreenBright` `bgYellowBright` `bgBlueBright` `bgMagentaBright` `bgCyanBright` `bgWhiteBright` `bgBlackBright`
