/**
 * dynamic-colors.ts — rgb, hex, and ansi256 color models
 * Run: node --import tsx/esm examples/dynamic-colors.ts
 *
 * Requires a terminal with truecolor support (TERM_PROGRAM=iTerm.app,
 * Windows Terminal, etc.). marker auto-detects the supported level and
 * gracefully falls back: truecolor → 256-color → 16-color.
 */
import { withLevel } from '../src/index.js';

const marker = withLevel(3);

// ─── RGB (truecolor) ────────────────────────────────────────────────────────
console.log('\n── rgb() ──');
console.log(marker.rgb(255, 80,  0)('Sunset orange'));
console.log(marker.rgb(0,   200, 100)('Electric green'));
console.log(marker.rgb(80,  120, 255)('Periwinkle blue'));
console.log(marker.rgb(200, 0,   200)('Vivid purple'));

// ─── Hex ────────────────────────────────────────────────────────────────────
console.log('\n── hex() ──');
console.log(marker.hex('#FF5733')('Coral'));
console.log(marker.hex('#2ECC71')('Emerald'));
console.log(marker.hex('#3498DB')('Peter River blue'));
console.log(marker.hex('#9B59B6')('Amethyst'));
console.log(marker.hex('#F39C12')('Orange'));
console.log(marker.hex('#1ABC9C')('Green Sea'));

// ─── ANSI 256 ───────────────────────────────────────────────────────────────
console.log('\n── ansi256() ──');
// 16-color palette (indices 0-15)
for (let i = 0; i < 16; i++) {
  process.stdout.write(marker.ansi256(i)(`${String(i).padStart(3)} `));
}
process.stdout.write('\n');

// 6×6×6 color cube (indices 16-231)
console.log('\n6×6×6 color cube (first row of each z-slice):');
for (let z = 0; z < 6; z++) {
  for (let y = 0; y < 6; y++) {
    process.stdout.write(marker.ansi256(16 + z * 36 + y * 6)('██'));
  }
  process.stdout.write(' ');
}
process.stdout.write('\n');

// Grayscale ramp (indices 232-255)
console.log('\nGrayscale ramp:');
for (let i = 232; i <= 255; i++) {
  process.stdout.write(marker.ansi256(i)('█'));
}
process.stdout.write('\n');

// ─── Background dynamic colors ──────────────────────────────────────────────
console.log('\n── bgRgb() / bgHex() ──');
console.log(marker.bgRgb(255, 80, 0).black.bold(' Sunset bg '));
console.log(marker.bgHex('#2ECC71').black.bold(' Emerald bg '));
console.log(marker.bgAnsi256(57).white.bold(' ANSI 57 bg '));

// ─── Level fallback demo ────────────────────────────────────────────────────
console.log('\n── level fallback ──');
const same = marker.hex('#FF6400');
const l3   = withLevel(3);
const l2   = withLevel(2);
const l1   = withLevel(1);

const COLOR = '#FF6400';
console.log(`level 3 (truecolor): ${l3.hex(COLOR)('██████')}`);
console.log(`level 2 (256-color): ${l2.hex(COLOR)('██████')}`);
console.log(`level 1 (16-color):  ${l1.hex(COLOR)('██████')}`);
void same;
