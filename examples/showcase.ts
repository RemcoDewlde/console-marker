/**
 * showcase.ts — a full-featured terminal UI demo
 * Run: node --import tsx/esm examples/showcase.ts
 */
import { withLevel } from '../src/index.js';

const marker = withLevel(3);

const { bold, dim, red, green, yellow, cyan, magenta, white, gray,
        bgRed, bgGreen, bgYellow, bgBlue, bgMagenta,
        underline, italic, strikethrough } = {
  bold:          marker.bold,
  dim:           marker.dim,
  red:           marker.red,
  green:         marker.green,
  yellow:        marker.yellow,
  cyan:          marker.cyan,
  magenta:       marker.magenta,
  white:         marker.white,
  gray:          marker.gray,
  bgRed:         marker.bgRed,
  bgGreen:       marker.bgGreen,
  bgYellow:      marker.bgYellow,
  bgBlue:        marker.bgBlue,
  bgMagenta:     marker.bgMagenta,
  underline:     marker.underline,
  italic:        marker.italic,
  strikethrough: marker.strikethrough,
};

const hr = dim('─'.repeat(60));

// ── Header ──────────────────────────────────────────────────────────────────
console.log();
console.log(bold(cyan('  marker')) + dim(' v0.1.0') + '  ' + italic(gray('high-performance terminal styling')));
console.log(hr);

// ── Build output ─────────────────────────────────────────────────────────────
console.log(bold('\n  Build'));
console.log(`  ${bgGreen(white(bold(' ESM ')))}  ${green('dist/index.js')}      ${dim('12.38 KB')}`);
console.log(`  ${bgBlue(white(bold(' CJS ')))}  ${cyan('dist/index.cjs')}     ${dim('15.39 KB')}`);
console.log(`  ${bgMagenta(white(bold(' DTS ')))}  ${magenta('dist/index.d.ts')}   ${dim(' 4.04 KB')}`);
console.log(`  ${dim('⚡ Build complete in')} ${yellow('8ms')}`);

// ── Test results ──────────────────────────────────────────────────────────────
console.log(bold('\n  Tests'));
const tests = [
  { name: 'level 0 passthrough', pass: true,  ms: '0.12' },
  { name: 'single styles',       pass: true,  ms: '0.08' },
  { name: 'chaining',            pass: true,  ms: '0.09' },
  { name: 'dynamic rgb colors',  pass: true,  ms: '0.11' },
  { name: 'hex colors',          pass: true,  ms: '0.10' },
  { name: 'ansi256',             pass: true,  ms: '0.07' },
  { name: 'embedded ANSI',       pass: true,  ms: '0.14' },
  { name: 'newline handling',    pass: true,  ms: '0.13' },
  { name: 'tagged templates',    pass: true,  ms: '0.09' },
];
for (const t of tests) {
  const icon   = t.pass ? green('✔') : red('✖');
  const name   = t.pass ? t.name : red(t.name);
  const timing = dim(`${t.ms}ms`);
  console.log(`  ${icon}  ${name} ${timing}`);
}
console.log(`\n  ${bgGreen(white(bold(' PASS ')))} ${dim('29/29 tests')} ${green('100%')}`);

// ── Benchmark summary ─────────────────────────────────────────────────────────
console.log(bold('\n  Benchmarks') + dim(' vs chalk@5 — Apple M3 Pro, Node 24'));
console.log(hr);

function row(label: string, chalkNs: string, markerNs: string, win: 'marker' | 'chalk' | 'tied') {
  const winLabel = win === 'marker'
    ? green(bold('marker ') + '⬆')
    : win === 'tied'
      ? dim('~tied')
      : dim('chalk');
  const padding = ' '.repeat(Math.max(0, 28 - label.length));
  console.log(
    `  ${dim(label)}${padding}` +
    `chalk ${dim(chalkNs.padStart(5))}ns   ` +
    `marker ${(win === 'marker' ? green : win === 'chalk' ? dim : dim)(markerNs.padStart(5))}ns   ` +
    winLabel,
  );
}

row('single style (short)',      ' 14',  ' 21', 'chalk');
row('single style (long 440ch)', ' 36',  ' 39', 'tied');
row('chain 2 levels',            ' 22',  ' 27', 'chalk');
row('chain 3 levels',            ' 17',  ' 27', 'chalk');
row('chain 5 levels',            ' 56',  ' 38', 'marker');
row('newlines (3 lines)',        ' 71',  ' 74', 'tied');
row('embedded ANSI codes',       ' 36',  ' 43', 'chalk');
row('rgb() truecolor',           '194', '182', 'marker');
row('hex() truecolor',           '283', '233', 'marker');

console.log(hr);
console.log(
  `  ${green('✔')} Faster on ${bold('5-chain')} (1.46×), ` +
  `${bold('hex')} (1.22×), ${bold('rgb')} (1.06×)`,
);
console.log(
  `  ${dim('○')} Tagged templates built-in — ` +
  `${strikethrough(dim('chalk-template'))} not required`,
);

// ── Style gallery ──────────────────────────────────────────────────────────────
console.log(bold('\n  Style gallery'));
const styles: [string, (s: string) => string][] = [
  ['bold',          bold],
  ['dim',           dim],
  ['italic',        italic],
  ['underline',     underline],
  ['strikethrough', strikethrough],
  ['red',           red],
  ['green',         green],
  ['yellow',        yellow],
  ['cyan',          cyan],
  ['magenta',       magenta],
  ['bgRed',         (s) => bgRed(white(s))],
  ['bgGreen',       (s) => bgGreen(white(s))],
  ['bgYellow',      (s) => bgYellow(white(s))],
];

const SAMPLE = 'Hello, world!';
for (let i = 0; i < styles.length; i += 2) {
  const [n1, f1] = styles[i]!;
  const [n2, f2] = styles[i + 1] ?? ['', (s: string) => s];
  const col1 = `  ${dim(n1.padEnd(14))} ${f1(SAMPLE)}`;
  const col2 = n2 ? `   ${dim(n2.padEnd(14))} ${f2(SAMPLE)}` : '';
  console.log(col1 + col2);
}

// ─── Truecolor gradient ────────────────────────────────────────────────────────
console.log(bold('\n  Truecolor gradient'));
process.stdout.write('  ');
const WIDTH = 56;
for (let i = 0; i < WIDTH; i++) {
  const r = Math.round(255 * (i / WIDTH));
  const g = Math.round(255 * (1 - i / WIDTH));
  const b = Math.round(128 + 127 * Math.sin((i / WIDTH) * Math.PI));
  process.stdout.write(marker.rgb(r, g, b)('█'));
}
process.stdout.write('\n\n');
