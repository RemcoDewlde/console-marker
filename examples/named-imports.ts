/**
 * named-imports.ts — tree-shakeable named exports
 * Run: node --import tsx/esm examples/named-imports.ts
 *
 * Import only the styles you need. Bundlers (esbuild, Rollup, webpack)
 * will tree-shake unused styles out of your bundle.
 */
import { withLevel } from '../src/index.js';

const m = withLevel(3);
const { red, green, yellow, bold, dim, cyan, bgRed, white } = m;

// Compose by calling as functions
console.log(red('Error text'));
console.log(green('Success text'));
console.log(yellow('Warning text'));

// Compose manually — wrap one style in another
console.log(bold(red('Bold red')));
console.log(bold(green('Bold green')));
console.log(dim(cyan('Dim cyan')));

// Build reusable formatters
const errorLine   = (msg: string) => `${bgRed(white(bold(' ERROR ')))} ${red(msg)}`;
const successLine = (msg: string) => `${green('✔')} ${msg}`;
const dimHint     = (msg: string) => `  ${dim(msg)}`;

console.log(errorLine('Connection refused'));
console.log(successLine('Build completed'));
console.log(dimHint('Run `npm run dev` to start the dev server'));

// Named exports are just pre-built builder instances from the default marker
// at the detected stdout color level — they respect FORCE_COLOR / NO_COLOR too.
