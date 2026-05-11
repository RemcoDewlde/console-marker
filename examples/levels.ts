/**
 * levels.ts — color level detection and control
 * Run: node --import tsx/esm examples/levels.ts
 *
 * Color levels:
 *   0 — no colors (dumb terminal, CI redirect, NO_COLOR)
 *   1 — 16 basic ANSI colors
 *   2 — 256-color palette
 *   3 — 16 million truecolor
 */
import marker, { withLevel, supportsColor, supportsColorStderr } from '../src/index.js';

// Auto-detected from your terminal
console.log(`stdout supports color: ${supportsColor}`);
console.log(`stderr supports color: ${supportsColorStderr}`);
console.log(`detected level:        ${marker.level}`);

// Create instances at specific levels for demos or CI
const m0 = withLevel(0); // no color
const m1 = withLevel(1); // 16-color
const m2 = withLevel(2); // 256-color
const m3 = withLevel(3); // truecolor

const DEMO_TEXT = 'Hello, world!';
console.log(`\nlevel 0: ${JSON.stringify(m0.red.bold(DEMO_TEXT))}`);
console.log(`level 1: ${m1.red.bold(DEMO_TEXT)}`);
console.log(`level 2: ${m2.hex('#FF5733').bold(DEMO_TEXT)}`);
console.log(`level 3: ${m3.hex('#FF5733').bold(DEMO_TEXT)}`);

// Level also controls how rgb/hex are downsampled
const ORANGE = '#FF6400';
console.log(`\nSame hex ${ORANGE} across levels:`);
console.log(`  level 1 → nearest ANSI-16: ${m1.hex(ORANGE)('████████')}`);
console.log(`  level 2 → nearest ANSI-256: ${m2.hex(ORANGE)('████████')}`);
console.log(`  level 3 → exact truecolor:  ${m3.hex(ORANGE)('████████')}`);

// Environment variables (set before running):
//   FORCE_COLOR=0   → level 0 (no color)
//   FORCE_COLOR=1   → level 1
//   FORCE_COLOR=3   → level 3
//   NO_COLOR=1      → level 0
//
// CLI flags (passed to Node process):
//   --no-color      → level 0
//   --color=256     → level 2
//   --color=16m     → level 3
