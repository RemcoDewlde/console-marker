/**
 * compare-chalk.ts — side-by-side visual comparison of marker vs chalk
 * Run: node --import tsx/esm examples/compare-chalk.ts
 */
import { withLevel } from '../src/index.js';
import chalk from 'chalk';

const m  = withLevel(3);
const ck = new (chalk.constructor as new (o: { level: number }) => typeof chalk)({ level: 3 });

const WIDTH = 52;
const COL   = 26; // label column width

// ── helpers ─────────────────────────────────────────────────────────────────

function row(label: string, markerFn: () => string, chalkFn: () => string) {
  const lbl = m.dim(label.padEnd(COL));
  console.log(`  ${lbl}  ${markerFn()}   ${chalkFn()}`);
}

function hr(title = '') {
  const dashes = Math.max(0, WIDTH - title.length - 6);
  const line = title
    ? m.dim('─'.repeat(4)) + ' ' + m.bold(title) + ' ' + m.dim('─'.repeat(dashes))
    : m.dim('─'.repeat(WIDTH));
  console.log(`\n  ${line}`);
}

function header() {
  const pad = ' '.repeat(COL + 2);
  console.log(`  ${pad}  ${m.bold.underline('marker')}   ${m.bold.underline('chalk')}`);
}

function gradient(styleFn: (r: number, g: number, b: number) => string, w = 28) {
  let out = '';
  for (let i = 0; i < w; i++) {
    const r = Math.round(255 * (i / w));
    const g = Math.round(255 * (1 - i / w));
    const b = Math.round(128 + 127 * Math.sin((i / w) * Math.PI));
    out += styleFn(r, g, b);
  }
  return out;
}

// ── intro ────────────────────────────────────────────────────────────────────

console.log();
console.log(`  ${m.bold('marker')} ${m.dim('vs')} ${m.bold('chalk')} ${m.dim('— visual output comparison (level 3, truecolor)')}`);

// ── modifiers ────────────────────────────────────────────────────────────────

hr('modifiers');
header();
row('bold',           () => m.bold('Hello, world!'),          () => ck.bold('Hello, world!'));
row('dim',            () => m.dim('Hello, world!'),           () => ck.dim('Hello, world!'));
row('italic',         () => m.italic('Hello, world!'),        () => ck.italic('Hello, world!'));
row('underline',      () => m.underline('Hello, world!'),     () => ck.underline('Hello, world!'));
row('overline',       () => m.overline('Hello, world!'),      () => ck.overline('Hello, world!'));
row('strikethrough',  () => m.strikethrough('Hello, world!'), () => ck.strikethrough('Hello, world!'));
row('inverse',        () => m.inverse('Hello, world!'),       () => ck.inverse('Hello, world!'));
row('hidden',         () => m.hidden('Hello, world!'),        () => ck.hidden('Hello, world!'));
row('visible',        () => m.bold('Hello, world!'),          () => ck.visible('Hello, world!'));

// ── foreground colors ────────────────────────────────────────────────────────

hr('foreground colors');
header();
for (const color of ['black','red','green','yellow','blue','magenta','cyan','white','gray'] as const) {
  row(color, () => (m[color] as (s:string)=>string)('Hello, world!'), () => (ck[color] as (s:string)=>string)('Hello, world!'));
}

hr('bright foreground');
header();
for (const color of ['blackBright','redBright','greenBright','yellowBright','blueBright','magentaBright','cyanBright','whiteBright'] as const) {
  row(color, () => (m[color] as (s:string)=>string)('Hello, world!'), () => (ck[color] as (s:string)=>string)('Hello, world!'));
}

// ── background colors ────────────────────────────────────────────────────────

hr('background colors');
header();
for (const color of ['bgBlack','bgRed','bgGreen','bgYellow','bgBlue','bgMagenta','bgCyan','bgWhite'] as const) {
  row(color, () => (m[color] as (s:string)=>string)('Hello, world!'), () => (ck[color] as (s:string)=>string)('Hello, world!'));
}

hr('bright background');
header();
for (const color of ['bgRedBright','bgGreenBright','bgYellowBright','bgBlueBright','bgMagentaBright','bgCyanBright','bgWhiteBright'] as const) {
  row(color, () => (m[color] as (s:string)=>string)('Hello, world!'), () => (ck[color] as (s:string)=>string)('Hello, world!'));
}

// ── chaining ─────────────────────────────────────────────────────────────────

hr('chaining');
header();
row('bold.red',              () => m.bold.red('Hello, world!'),              () => ck.bold.red('Hello, world!'));
row('bold.bgBlue.white',     () => m.bold.bgBlue.white('Hello, world!'),     () => ck.bold.bgBlue.white('Hello, world!'));
row('italic.underline.cyan', () => m.italic.underline.cyan('Hello, world!'), () => ck.italic.underline.cyan('Hello, world!'));
row('dim.strikethrough',     () => m.dim.strikethrough('Hello, world!'),     () => ck.dim.strikethrough('Hello, world!'));
row('bold.bgRed.whiteBright',() => m.bold.bgRed.whiteBright('Hello, world!'),() => ck.bold.bgRed.whiteBright('Hello, world!'));

// ── dynamic colors ────────────────────────────────────────────────────────────

hr('rgb()');
header();
for (const [label, r, g, b] of [
  ['rgb(255, 80, 0)',    255, 80,  0  ],
  ['rgb(0, 200, 100)',   0,   200, 100],
  ['rgb(80, 120, 255)',  80,  120, 255],
  ['rgb(200, 0, 200)',   200, 0,   200],
  ['rgb(255, 215, 0)',   255, 215, 0  ],
] as [string, number, number, number][]) {
  row(label, () => m.rgb(r,g,b)('Hello, world!'), () => ck.rgb(r,g,b)('Hello, world!'));
}

hr('hex()');
header();
for (const [label, hex] of [
  ['hex(#FF5733)', '#FF5733'],
  ['hex(#2ECC71)', '#2ECC71'],
  ['hex(#3498DB)', '#3498DB'],
  ['hex(#9B59B6)', '#9B59B6'],
  ['hex(#F39C12)', '#F39C12'],
]) {
  row(label, () => m.hex(hex)('Hello, world!'), () => ck.hex(hex)('Hello, world!'));
}

hr('ansi256()');
header();
for (const n of [196, 46, 21, 201, 226, 51, 208, 57]) {
  row(`ansi256(${n})`, () => m.ansi256(n)('Hello, world!'), () => ck.ansi256(n)('Hello, world!'));
}

// ── newline handling ──────────────────────────────────────────────────────────

hr('newline handling');
header();
row('red("line1\\nline2")',
  () => m.red('line1\nline2').replace('\n', m.dim('↵') + '\n        '),
  () => ck.red('line1\nline2').replace('\n', ck.dim('↵') + '\n        '));

// ── truecolor gradients ───────────────────────────────────────────────────────

const m2  = withLevel(2);
const m1  = withLevel(1);
const ck2 = new (chalk.constructor as new (o: { level: number }) => typeof chalk)({ level: 2 });
const ck1 = new (chalk.constructor as new (o: { level: number }) => typeof chalk)({ level: 1 });

function gradientRow(
  label: string,
  mFn: (r: number, g: number, b: number) => string,
  cFn: (r: number, g: number, b: number) => string,
  w = 22,
) {
  const lbl = m.dim(label.padEnd(COL));
  console.log(`  ${lbl}  ${gradient(mFn, w)}   ${gradient(cFn, w)}`);
}

hr('truecolor gradients');
header();
gradientRow('truecolor  (level 3)', (r,g,b) => m.rgb(r,g,b)('█'),  (r,g,b) => ck.rgb(r,g,b)('█'));
gradientRow('256-color  (level 2)', (r,g,b) => m2.rgb(r,g,b)('█'), (r,g,b) => ck2.rgb(r,g,b)('█'));
gradientRow('16-color   (level 1)', (r,g,b) => m1.rgb(r,g,b)('█'), (r,g,b) => ck1.rgb(r,g,b)('█'));

hr('truecolor vs chalk approximations');
const pad = ' '.repeat(COL + 2);
console.log(`  ${pad}  ${m.dim('marker L3 (truecolor)')}`);
console.log(`  ${pad}  ${gradient((r,g,b) => m.rgb(r,g,b)('█'), 44)}`);
console.log(`  ${pad}  ${m.dim('chalk L2  (256-color approx)')}`);
console.log(`  ${pad}  ${gradient((r,g,b) => ck2.rgb(r,g,b)('█'), 44)}`);
console.log(`  ${pad}  ${m.dim('chalk L1  (16-color approx)')}`);
console.log(`  ${pad}  ${gradient((r,g,b) => ck1.rgb(r,g,b)('█'), 44)}`);

// ── tagged templates (marker only) ───────────────────────────────────────────

hr('tagged templates  (marker only — chalk needs chalk-template)');
const name = 'Alice';
const count = 42;
console.log(`  ${m.dim('marker.red`Hello ${name}!`'.padEnd(COL))}  ${m.red`Hello ${name}!`}`);
console.log(`  ${m.dim('marker.bold.cyan`${count} tests`'.padEnd(COL))}  ${m.bold.cyan`${count} tests passed`}`);
console.log(`  ${m.dim('chalk  (not supported)'.padEnd(COL))}  ${m.dim('—')}`);

// ── output codes match? ───────────────────────────────────────────────────────

hr('code parity check');
const checks: [string, string, string][] = [
  ['bold',        m.bold('x'),        ck.bold('x')],
  ['red',         m.red('x'),         ck.red('x')],
  ['bgBlue',      m.bgBlue('x'),      ck.bgBlue('x')],
  ['bold.red',    m.bold.red('x'),    ck.bold.red('x')],
  ['rgb()',       m.rgb(255,0,0)('x'),ck.rgb(255,0,0)('x')],
  ['hex()',       m.hex('#FF0000')('x'), ck.hex('#FF0000')('x')],
  ['ansi256()',   m.ansi256(196)('x'),ck.ansi256(196)('x')],
];
let allMatch = true;
for (const [label, mOut, cOut] of checks) {
  const match = mOut === cOut;
  if (!match) allMatch = false;
  const icon = match ? m.green('✔') : m.red('✖');
  const detail = match ? m.dim('identical') : m.red(`marker: ${JSON.stringify(mOut)} | chalk: ${JSON.stringify(cOut)}`);
  console.log(`  ${icon}  ${m.dim(label.padEnd(14))}  ${detail}`);
}
console.log();
console.log(`  ${allMatch ? m.bgGreen.black.bold(' ALL MATCH ') : m.bgRed.white.bold(' MISMATCH ')}  ${m.dim('marker and chalk produce identical ANSI output')}`);
console.log();
