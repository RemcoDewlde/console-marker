/**
 * Reads coverage/coverage-summary.json produced by @vitest/coverage-v8
 * and writes a shields.io endpoint JSON to the path given as argv[2]
 * (defaults to .github/badges/coverage.json).
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const out = process.argv[2] ?? '.github/badges/coverage.json';
const summary = JSON.parse(readFileSync('coverage/coverage-summary.json', 'utf8'));
const { pct } = summary.total.branches;

const color =
  pct >= 100 ? 'brightgreen' :
  pct >= 90  ? 'green' :
  pct >= 80  ? 'yellow' :
               'red';

mkdirSync(dirname(out), { recursive: true });
const badge = { schemaVersion: 1, label: 'coverage', message: `${pct}%`, color };
writeFileSync(out, JSON.stringify(badge));
console.log(`coverage badge → ${out}: ${pct}% (${color})`);
