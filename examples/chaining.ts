/**
 * chaining.ts — composing multiple styles
 * Run: node --import tsx/esm examples/chaining.ts
 */
import { withLevel } from '../src/index.js';

const marker = withLevel(3);

// Styles can be chained in any order
console.log(marker.bold.red('Bold red'));
console.log(marker.italic.blue('Italic blue'));
console.log(marker.bold.underline.green('Bold underlined green'));
console.log(marker.bgBlue.white.bold('White bold on blue background'));
console.log(marker.bold.italic.underline.cyan('Bold italic underlined cyan'));

// Chains are cached — accessing the same chain twice returns the same object
const error   = marker.bold.red;
const warning = marker.bold.yellow;
const success = marker.bold.green;
const info    = marker.bold.cyan;

console.log(error('✖ Error: something went wrong'));
console.log(warning('⚠ Warning: check your config'));
console.log(success('✔ Success: all tests passed'));
console.log(info('ℹ Info: server running on :3000'));

// Combine foreground + background
console.log(marker.bgRed.white.bold(' FAIL ') + ' ' + marker.red('Test suite crashed'));
console.log(marker.bgGreen.black.bold(' PASS ') + ' ' + marker.green('All 29 tests passed'));

// Nested styled strings
const filename = marker.cyan.underline('src/index.ts');
const lineNum  = marker.yellow('42');
console.log(marker.dim(`at ${filename}:${lineNum}`));
