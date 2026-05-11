// Run with: npm run bench
import { bench, run, group, summary, do_not_optimize } from 'mitata';
import chalk from 'chalk';
import { withLevel } from '../src/index.js';

// Force both libraries to level 3 for consistent, deterministic output
const chalkL3 = new (chalk.constructor as new (opts: { level: number }) => typeof chalk)({ level: 3 });
const m = withLevel(3);

const SHORT    = 'Hello world';
const MEDIUM   = 'The quick brown fox jumps over the lazy dog';
const LONG     = MEDIUM.repeat(10);
const NEWLINES = 'line one\nline two\nline three';
const EMBEDDED = m.red(SHORT); // string already containing ANSI codes

// ─── Single style ──────────────────────────────────────────────────────────
group('single style — short string', () => {
  summary(() => {
    bench('chalk  .red', () => do_not_optimize(chalkL3.red(SHORT)));
    bench('marker .red', () => do_not_optimize(m.red(SHORT)));
  });
});

group('single style — long string', () => {
  summary(() => {
    bench('chalk  .red', () => do_not_optimize(chalkL3.red(LONG)));
    bench('marker .red', () => do_not_optimize(m.red(LONG)));
  });
});

// ─── Chaining ──────────────────────────────────────────────────────────────
group('chain — bold.red', () => {
  summary(() => {
    bench('chalk  .bold.red', () => do_not_optimize(chalkL3.bold.red(SHORT)));
    bench('marker .bold.red', () => do_not_optimize(m.bold.red(SHORT)));
  });
});

group('chain — 3 levels (bold.red.underline)', () => {
  summary(() => {
    bench('chalk  .bold.red.underline', () => do_not_optimize(chalkL3.bold.red.underline(SHORT)));
    bench('marker .bold.red.underline', () => do_not_optimize(m.bold.red.underline(SHORT)));
  });
});

group('chain — 5 levels', () => {
  summary(() => {
    bench('chalk  5-chain', () => do_not_optimize(chalkL3.bold.italic.underline.bgBlue.red(SHORT)));
    bench('marker 5-chain', () => do_not_optimize(m.bold.italic.underline.bgBlue.red(SHORT)));
  });
});

// ─── Newlines ──────────────────────────────────────────────────────────────
group('newlines — 3 lines', () => {
  summary(() => {
    bench('chalk  .red + newlines', () => do_not_optimize(chalkL3.red(NEWLINES)));
    bench('marker .red + newlines', () => do_not_optimize(m.red(NEWLINES)));
  });
});

// ─── Embedded ANSI ─────────────────────────────────────────────────────────
group('embedded ANSI — bold wraps pre-styled string', () => {
  const chalkEmbedded = chalkL3.red(SHORT);
  summary(() => {
    bench('chalk  .bold(red_str)', () => do_not_optimize(chalkL3.bold(chalkEmbedded)));
    bench('marker .bold(red_str)', () => do_not_optimize(m.bold(EMBEDDED)));
  });
});

// ─── Dynamic colors ────────────────────────────────────────────────────────
group('rgb() truecolor', () => {
  summary(() => {
    bench('chalk  .rgb()',  () => do_not_optimize(chalkL3.rgb(255, 100, 0)(SHORT)));
    bench('marker .rgb()',  () => do_not_optimize(m.rgb(255, 100, 0)(SHORT)));
  });
});

group('hex() truecolor', () => {
  summary(() => {
    bench('chalk  .hex()',  () => do_not_optimize(chalkL3.hex('#FF6400')(SHORT)));
    bench('marker .hex()',  () => do_not_optimize(m.hex('#FF6400')(SHORT)));
  });
});

// ─── Tagged template ───────────────────────────────────────────────────────
group('tagged template literal', () => {
  const name = 'world';
  summary(() => {
    // chalk requires chalk-template for tagged template support; skip chalk here
    bench('marker .red`Hello ${name}!`', () => do_not_optimize(m.red`Hello ${name}!`));
  });
});

await run({ colors: true });
