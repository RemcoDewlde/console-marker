/**
 * template-literals.ts — tagged template literal support (built-in)
 * Run: node --import tsx/esm examples/template-literals.ts
 *
 * chalk requires the separate chalk-template package for this.
 * marker ships this out of the box.
 */
import { withLevel } from '../src/index.js';

const marker = withLevel(3);

const user     = 'Alice';
const count    = 42;
const filename = 'src/index.ts';
const duration = '1.23ms';

// Basic interpolation
console.log(marker.bold`Hello, ${user}!`);
console.log(marker.green`✔ ${count} tests passed in ${duration}`);
console.log(marker.red`✖ Failed to load ${filename}`);
console.log(marker.yellow`⚠ Deprecated since ${marker.bold`v2.0`} — use ${marker.cyan`newMethod()`} instead`);

// Chained styles as tags
console.log(marker.bold.cyan`Build complete in ${duration}`);
console.log(marker.bgRed.white.bold` FATAL ` + marker.red` Cannot connect to ${marker.underline`localhost:5432`}`);

// Building log lines
function log(level: 'info' | 'warn' | 'error', msg: string): void {
  const labels = {
    info:  marker.bgCyan.black.bold` INFO `,
    warn:  marker.bgYellow.black.bold` WARN `,
    error: marker.bgRed.white.bold` ERROR `,
  };
  const colors = {
    info:  marker.cyan,
    warn:  marker.yellow,
    error: marker.red,
  };
  console.log(`${labels[level]} ${colors[level](msg)}`);
}

console.log();
log('info',  'Server listening on :3000');
log('warn',  'Memory usage above 80%');
log('error', 'Unhandled rejection: TypeError: cannot read properties of undefined');

// Multi-expression template
const pkg  = 'marker';
const ver  = '0.1.0';
const desc = 'high-performance terminal styling';
console.log();
console.log(marker.bold`${marker.cyan(pkg)} ${marker.dim(`v${ver}`)} — ${desc}`);
