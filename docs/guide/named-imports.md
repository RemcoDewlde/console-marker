# Named imports

Every style is available as a standalone named export for tree-shaking.

## Usage

```ts
import { red, bold, green, bgBlue, cyan, italic } from 'marker';

console.log(red('error'));
console.log(bold(green('ok')));
console.log(bgBlue(cyan('info')));
```

## Composing named exports

Named exports are `Builder` functions — they can be wrapped:

```ts
import { red, bold, underline } from 'marker';

const error   = (s: string) => red(bold(s));
const heading = (s: string) => bold(underline(s));
```

## Available named exports

All styles from the chaining API are exported by name:

**Modifiers:** `reset` `bold` `dim` `italic` `underline` `overline` `inverse` `hidden` `strikethrough`

**Foreground:** `black` `red` `green` `yellow` `blue` `magenta` `cyan` `white` `gray` `grey` `blackBright` `redBright` `greenBright` `yellowBright` `blueBright` `magentaBright` `cyanBright` `whiteBright`

**Background:** `bgBlack` `bgRed` `bgGreen` `bgYellow` `bgBlue` `bgMagenta` `bgCyan` `bgWhite` `bgGray` `bgGrey` `bgBlackBright` `bgRedBright` `bgGreenBright` `bgYellowBright` `bgBlueBright` `bgMagentaBright` `bgCyanBright` `bgWhiteBright`

**Utilities:** `withLevel` `supportsColor` `supportsColorStderr`

## Tree-shaking note

Named imports only save bytes if you use a bundler (esbuild, Rollup, webpack). In a plain Node.js script, the entire module is loaded regardless.
