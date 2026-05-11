/**
 * basic.ts — single-style usage
 * Run: node --import tsx/esm examples/basic.ts
 */
import { withLevel } from '../src/index.js';

const marker = withLevel(3);

// Single modifiers
console.log(marker.bold('Bold text'));
console.log(marker.italic('Italic text'));
console.log(marker.underline('Underlined text'));
console.log(marker.strikethrough('Strikethrough text'));
console.log(marker.dim('Dim text'));
console.log(marker.inverse('Inverse text'));

// Foreground colors
console.log(marker.black('Black'));
console.log(marker.red('Red'));
console.log(marker.green('Green'));
console.log(marker.yellow('Yellow'));
console.log(marker.blue('Blue'));
console.log(marker.magenta('Magenta'));
console.log(marker.cyan('Cyan'));
console.log(marker.white('White'));
console.log(marker.gray('Gray'));

// Bright foreground colors
console.log(marker.redBright('Bright Red'));
console.log(marker.greenBright('Bright Green'));
console.log(marker.blueBright('Bright Blue'));
console.log(marker.cyanBright('Bright Cyan'));

// Background colors
console.log(marker.bgRed('Bg Red'));
console.log(marker.bgGreen('Bg Green'));
console.log(marker.bgBlue('Bg Blue'));
console.log(marker.bgYellow('Bg Yellow'));
console.log(marker.bgMagenta('Bg Magenta'));
console.log(marker.bgCyan('Bg Cyan'));
