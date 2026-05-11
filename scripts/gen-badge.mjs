/**
 * Reads coverage/coverage-summary.json produced by @vitest/coverage-v8
 * and writes coverage/coverage-badge.json in shields.io endpoint format.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const summary = JSON.parse(readFileSync('coverage/coverage-summary.json', 'utf8'));
const { pct } = summary.total.branches;

const color =
  pct >= 100 ? 'brightgreen' :
  pct >= 90  ? 'green' :
  pct >= 80  ? 'yellow' :
               'red';

const badge = { schemaVersion: 1, label: 'coverage', message: `${pct}%`, color };
writeFileSync('coverage/coverage-badge.json', JSON.stringify(badge));
console.log(`coverage badge: ${pct}% (${color})`);
